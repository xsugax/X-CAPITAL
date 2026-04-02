// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

/**
 * @title SPVFund
 * @notice On-chain Special Purpose Vehicle for private fund investments.
 *         Investors subscribe by depositing USDC (or another accepted stablecoin).
 *         At maturity the GP distributes returns proportionally.
 *
 * @dev  Workflow:
 *  1. Admin deploys contract and sets fund parameters.
 *  2. Accredited investors (whitelisted) call subscribe() to invest.
 *  3. Admin calls distribute() at maturity to send returns to all investors.
 *  4. Investors call claimReturn() to receive their share.
 */
contract SPVFund is AccessControl, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant ADMIN_ROLE      = keccak256("ADMIN_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");

    // ─── Fund parameters ──────────────────────────────────────────────────────
    string  public name;
    string  public category;       // "SPACE", "AI", "ENERGY", "VENTURE"
    uint256 public minInvestment;  // in stablecoin token units
    uint256 public maxCapacity;    // 0 = unlimited
    uint256 public lockEndTime;    // Unix timestamp when lock expires
    uint256 public targetReturnBps; // basis points, e.g. 2200 = 22%
    bool    public isOpen;

    IERC20  public immutable stablecoin;

    // ─── State ────────────────────────────────────────────────────────────────
    uint256 public totalSubscribed;

    struct Investment {
        uint256 amount;
        uint256 claimableReturn;
        bool    hasClaimed;
    }

    mapping(address => Investment) public investments;
    address[] private _investors;
    mapping(address => bool) private _whitelist;
    bool public distributed;

    // ─── Events ───────────────────────────────────────────────────────────────
    event Subscribed(address indexed investor, uint256 amount);
    event ReturnDistributed(uint256 totalReturn, uint256 timestamp);
    event ReturnClaimed(address indexed investor, uint256 amount);
    event WhitelistUpdated(address indexed investor, bool approved);
    event FundClosed();

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        string memory name_,
        string memory category_,
        address stablecoin_,
        uint256 minInvestment_,
        uint256 maxCapacity_,
        uint256 lockDurationDays_,
        uint256 targetReturnBps_,
        address admin
    ) {
        require(stablecoin_ != address(0), "Invalid stablecoin");
        require(admin != address(0), "Invalid admin");
        require(lockDurationDays_ > 0, "Lock period required");

        name             = name_;
        category         = category_;
        stablecoin       = IERC20(stablecoin_);
        minInvestment    = minInvestment_;
        maxCapacity      = maxCapacity_;
        lockEndTime      = block.timestamp + (lockDurationDays_ * 1 days);
        targetReturnBps  = targetReturnBps_;
        isOpen           = true;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(ADMIN_ROLE,         admin);
        _grantRole(COMPLIANCE_ROLE,    admin);
    }

    // ─── Whitelist ────────────────────────────────────────────────────────────

    function setWhitelisted(address investor, bool approved) external onlyRole(COMPLIANCE_ROLE) {
        _whitelist[investor] = approved;
        emit WhitelistUpdated(investor, approved);
    }

    function isWhitelisted(address investor) external view returns (bool) {
        return _whitelist[investor];
    }

    // ─── Subscribe ────────────────────────────────────────────────────────────

    /**
     * @notice Invest `amount` stablecoin units into this SPV.
     * @dev    Investor must first approve this contract to spend the stablecoin.
     */
    function subscribe(uint256 amount) external nonReentrant whenNotPaused {
        require(isOpen, "Fund is closed");
        require(_whitelist[msg.sender], "Not whitelisted");
        require(amount >= minInvestment, "Below minimum investment");
        require(!distributed, "Fund already distributed");
        if (maxCapacity > 0) {
            require(totalSubscribed + amount <= maxCapacity, "Exceeds fund capacity");
        }

        stablecoin.safeTransferFrom(msg.sender, address(this), amount);

        if (investments[msg.sender].amount == 0) {
            _investors.push(msg.sender);
        }
        investments[msg.sender].amount += amount;
        totalSubscribed += amount;

        emit Subscribed(msg.sender, amount);
    }

    // ─── Distribute returns ───────────────────────────────────────────────────

    /**
     * @notice GP calls this after maturity to record each investor's claimable return.
     * @dev    Admin must have transferred enough stablecoin into this contract to
     *         cover all returns before calling. `totalReturnAmount` is the TOTAL
     *         pot to distribute (principal + profits).
     */
    function distribute(uint256 totalReturnAmount) external onlyRole(ADMIN_ROLE) nonReentrant {
        require(block.timestamp >= lockEndTime, "Lock period not ended");
        require(!distributed, "Already distributed");
        require(totalSubscribed > 0, "No investments");

        // Verify the contract holds enough funds
        require(
            stablecoin.balanceOf(address(this)) >= totalReturnAmount,
            "Insufficient return funds"
        );

        for (uint256 i = 0; i < _investors.length; i++) {
            address inv = _investors[i];
            uint256 share = (investments[inv].amount * totalReturnAmount) / totalSubscribed;
            investments[inv].claimableReturn = share;
        }

        distributed = true;
        isOpen = false;

        emit ReturnDistributed(totalReturnAmount, block.timestamp);
    }

    // ─── Claim ────────────────────────────────────────────────────────────────

    /**
     * @notice Investor claims their proportional return after distribution.
     */
    function claimReturn() external nonReentrant {
        require(distributed, "Returns not yet distributed");
        Investment storage inv = investments[msg.sender];
        require(inv.claimableReturn > 0, "Nothing to claim");
        require(!inv.hasClaimed, "Already claimed");

        inv.hasClaimed = true;
        uint256 payout = inv.claimableReturn;

        stablecoin.safeTransfer(msg.sender, payout);

        emit ReturnClaimed(msg.sender, payout);
    }

    // ─── Admin ────────────────────────────────────────────────────────────────

    function closeFund() external onlyRole(ADMIN_ROLE) {
        isOpen = false;
        emit FundClosed();
    }

    function pause()   external onlyRole(ADMIN_ROLE) { _pause(); }
    function unpause() external onlyRole(ADMIN_ROLE) { _unpause(); }

    // ─── View helpers ─────────────────────────────────────────────────────────

    function investorCount() external view returns (uint256) { return _investors.length; }

    function getInvestors() external view onlyRole(ADMIN_ROLE) returns (address[] memory) {
        return _investors;
    }

    function myInvestment() external view returns (uint256 amount, uint256 claimable, bool claimed) {
        Investment memory inv = investments[msg.sender];
        return (inv.amount, inv.claimableReturn, inv.hasClaimed);
    }
}
