// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title XCapitalToken
 * @notice SEC Reg D / Reg S compliant security token with transfer restrictions.
 *         Only whitelisted (KYC-approved accredited investor) wallets may hold or transfer tokens.
 * @dev    Implements a simple whitelist so that transfers can only occur between
 *         approved addresses. The COMPLIANCE_ROLE manages the whitelist off-chain
 *         after verifying investor accreditation status.
 */
contract XCapitalToken is ERC20, ERC20Burnable, ERC20Pausable, AccessControl, ReentrancyGuard {
    // ─── Roles ────────────────────────────────────────────────────────────────
    bytes32 public constant MINTER_ROLE     = keccak256("MINTER_ROLE");
    bytes32 public constant COMPLIANCE_ROLE = keccak256("COMPLIANCE_ROLE");
    bytes32 public constant PAUSER_ROLE     = keccak256("PAUSER_ROLE");

    // ─── Transfer restriction ─────────────────────────────────────────────────
    /// @dev True means the address has passed KYC/accreditation checks
    mapping(address => bool) private _whitelist;

    // ─── Offering parameters ──────────────────────────────────────────────────
    uint256 public immutable maxSupply;
    string  public  offeringType;   // "REG_D", "REG_S", "REG_A_PLUS"
    bool    public  transferRestrictionEnabled = true;

    // ─── Events ───────────────────────────────────────────────────────────────
    event WhitelistUpdated(address indexed investor, bool approved);
    event TransferRestrictionToggled(bool enabled);

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor(
        string memory name_,
        string memory symbol_,
        uint256 maxSupply_,
        string memory offeringType_,
        address admin
    ) ERC20(name_, symbol_) {
        require(admin != address(0), "Admin cannot be zero address");
        maxSupply   = maxSupply_;
        offeringType = offeringType_;

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE,        admin);
        _grantRole(COMPLIANCE_ROLE,    admin);
        _grantRole(PAUSER_ROLE,        admin);

        // Admin is always whitelisted
        _whitelist[admin] = true;
    }

    // ─── Whitelist management ─────────────────────────────────────────────────

    /**
     * @notice Approve or revoke an investor address.
     * @dev    Only callable by COMPLIANCE_ROLE.
     */
    function setWhitelisted(address investor, bool approved) external onlyRole(COMPLIANCE_ROLE) {
        require(investor != address(0), "Invalid address");
        _whitelist[investor] = approved;
        emit WhitelistUpdated(investor, approved);
    }

    /**
     * @notice Batch-whitelist multiple addresses at once.
     */
    function batchSetWhitelisted(address[] calldata investors, bool approved) external onlyRole(COMPLIANCE_ROLE) {
        for (uint256 i = 0; i < investors.length; i++) {
            require(investors[i] != address(0), "Invalid address in batch");
            _whitelist[investors[i]] = approved;
            emit WhitelistUpdated(investors[i], approved);
        }
    }

    function isWhitelisted(address investor) external view returns (bool) {
        return _whitelist[investor];
    }

    // ─── Mint ─────────────────────────────────────────────────────────────────

    /**
     * @notice Mint tokens to an approved investor.
     * @dev    Only MINTER_ROLE; receiver must be whitelisted; respects maxSupply.
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) nonReentrant {
        require(_whitelist[to], "Recipient not whitelisted");
        require(totalSupply() + amount <= maxSupply, "Exceeds max supply");
        _mint(to, amount);
    }

    // ─── Pause ────────────────────────────────────────────────────────────────

    function pause()   external onlyRole(PAUSER_ROLE) { _pause(); }
    function unpause() external onlyRole(PAUSER_ROLE) { _unpause(); }

    // ─── Toggle transfer restriction ──────────────────────────────────────────

    function setTransferRestriction(bool enabled) external onlyRole(COMPLIANCE_ROLE) {
        transferRestrictionEnabled = enabled;
        emit TransferRestrictionToggled(enabled);
    }

    // ─── Transfer hook ────────────────────────────────────────────────────────

    /**
     * @dev Override _update to enforce whitelist on every transfer.
     *      Mints (from == address(0)) and burns (to == address(0)) are exempt
     *      from the whitelist check only when the counterparty is address(0).
     */
    function _update(address from, address to, uint256 value)
        internal
        override(ERC20, ERC20Pausable)
    {
        if (transferRestrictionEnabled) {
            // Mint: only check receiver
            if (from != address(0)) {
                require(_whitelist[from], "Sender not whitelisted");
            }
            // Burn: only check sender
            if (to != address(0)) {
                require(_whitelist[to], "Recipient not whitelisted");
            }
        }
        super._update(from, to, value);
    }

    // ─── Decimals ─────────────────────────────────────────────────────────────
    function decimals() public pure override returns (uint8) { return 6; }
}
