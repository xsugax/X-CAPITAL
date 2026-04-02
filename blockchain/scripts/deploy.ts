import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Mock USDC address on localhost (deploy a stub ERC-20 or use this placeholder)
const MOCK_USDC_ADDRESS = "0x0000000000000000000000000000000000000001";

interface DeployedAddresses {
  network: string;
  timestamp: string;
  XCapitalToken: string;
  SPVFunds: Record<string, string>;
  MockUSDC?: string;
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network    = (await ethers.provider.getNetwork()).name;

  console.log(`\n========================================`);
  console.log(`  X-CAPITAL Deployment — ${network}`);
  console.log(`  Deployer: ${deployer.address}`);
  console.log(`========================================\n`);

  const addresses: DeployedAddresses = {
    network,
    timestamp: new Date().toISOString(),
    XCapitalToken: "",
    SPVFunds: {},
  };

  // ─── 1. Deploy MockUSDC on local networks ─────────────────────────────────
  let usdcAddress = MOCK_USDC_ADDRESS;
  if (network === "localhost" || network === "hardhat" || network === "unknown") {
    console.log("Deploying MockUSDC...");
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    const mockUsdc  = await MockERC20.deploy("USD Coin", "USDC", 6);
    await mockUsdc.waitForDeployment();
    usdcAddress = await mockUsdc.getAddress();
    addresses.MockUSDC = usdcAddress;
    console.log(`  MockUSDC deployed → ${usdcAddress}`);
  }

  // ─── 2. Deploy XCapitalToken ──────────────────────────────────────────────
  console.log("\nDeploying XCapitalToken...");
  const XCapitalToken = await ethers.getContractFactory("XCapitalToken");
  const xcToken = await XCapitalToken.deploy(
    "X-Capital Security Token",  // name
    "XCAP",                       // symbol
    ethers.parseUnits("100000000", 6), // maxSupply: 100M tokens (6 decimals)
    "REG_D",                      // offeringType
    deployer.address              // admin
  );
  await xcToken.waitForDeployment();
  addresses.XCapitalToken = await xcToken.getAddress();
  console.log(`  XCapitalToken → ${addresses.XCapitalToken}`);

  // ─── 3. Deploy SPV Funds ──────────────────────────────────────────────────
  const funds = [
    {
      key:          "X_SPACE_FUND",
      name:         "X-SPACE Alpha Fund I",
      category:     "SPACE",
      minInvestment: ethers.parseUnits("25000", 6),  // $25,000 USDC
      maxCapacity:   ethers.parseUnits("10000000", 6), // $10M cap
      lockDays:      365,
      returnBps:     2200,  // 22% target
    },
    {
      key:          "X_AI_FUND",
      name:         "X-AI Infrastructure Fund I",
      category:     "AI",
      minInvestment: ethers.parseUnits("50000", 6),
      maxCapacity:   ethers.parseUnits("25000000", 6),
      lockDays:      730,
      returnBps:     2800,  // 28% target
    },
    {
      key:          "X_ENERGY_FUND",
      name:         "X-ENERGY Transition Fund",
      category:     "ENERGY",
      minInvestment: ethers.parseUnits("10000", 6),
      maxCapacity:   ethers.parseUnits("5000000", 6),
      lockDays:      180,
      returnBps:     1400,  // 14% target
    },
    {
      key:          "X_VENTURE_FUND",
      name:         "X-Capital Venture Fund I",
      category:     "VENTURE",
      minInvestment: ethers.parseUnits("100000", 6),
      maxCapacity:   ethers.parseUnits("50000000", 6),
      lockDays:      365,
      returnBps:     3500,  // 35% target
    },
  ];

  const SPVFund = await ethers.getContractFactory("SPVFund");

  console.log("");
  for (const fund of funds) {
    console.log(`Deploying ${fund.name}...`);
    const spv = await SPVFund.deploy(
      fund.name,
      fund.category,
      usdcAddress,
      fund.minInvestment,
      fund.maxCapacity,
      fund.lockDays,
      fund.returnBps,
      deployer.address
    );
    await spv.waitForDeployment();
    const addr = await spv.getAddress();
    addresses.SPVFunds[fund.key] = addr;
    console.log(`  ${fund.key} → ${addr}`);
  }

  // ─── 4. Write artifact ────────────────────────────────────────────────────
  const outDir  = path.join(__dirname, "..", "deployments");
  const outFile = path.join(outDir, `${network}.json`);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(addresses, null, 2));

  console.log(`\n✅ Deployment complete. Addresses saved → deployments/${network}.json`);
  console.log(JSON.stringify(addresses, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
