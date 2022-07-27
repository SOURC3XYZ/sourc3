const dotenv = require("dotenv");
const program = require("commander");
const ethers = require('ethers');

dotenv.config();

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_HTTP_PROVIDER);
const wallet = ethers.Wallet.fromMnemonic(process.env.MNEMONIC, process.env.HD_PATH);
const walletSigner = wallet.connect(provider);
const abi = [
    "function createOrganization(string memory name) public"
];
const sourc3Contract = new ethers.Contract(process.env.ETH_SOURC3_CONTRACT, abi, walletSigner);

(async () => {
    console.log("Calling 'createOrganization' of Sourc3 contract:")

    program.option('-n, --name <string>', 'Organization name', 'Test')
    program.parse(process.argv)

    const options = program.opts()

    let tx = await sourc3Contract.createOrganization(options.name);
    let txReceipt = await tx.wait();
    
    console.log("txReceipt: ", txReceipt)
    console.log("'createOrganization' is finished.")
})();
