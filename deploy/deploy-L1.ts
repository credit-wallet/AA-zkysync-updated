


import { ethers } from "ethers";
import "dotenv/config";
import * as l1ContractJson from "../artifacts-zk/contracts/L1Contract.sol/L1Contract.json";
import * as dotenv from "dotenv";

const EXPOSED_KEY = "";


async function main() {
const wallet =
process.env.MNEMONIC && process.env.MNEMONIC.length > 0
    ? ethers.Wallet.fromMnemonic(process.env.MNEMONIC)
    : new ethers.Wallet(process.env.PRIVATE_KEY ?? EXPOSED_KEY);
console.log(`Using address ${wallet.address}`);
const provider = ethers.providers.getDefaultProvider("goerli");
const signer = wallet.connect(provider);
const balanceBN = await signer.getBalance();
const balance = Number(ethers.utils.formatEther(balanceBN));
console.log(`Wallet balance ${balance}`);
if (balance < 0.01) {
    throw new Error("Not enough ether");
}
console.log("Deploying L1");

const L1Factory = new ethers.ContractFactory(
    l1ContractJson.abi,
    l1ContractJson.bytecode,
    signer
);
const l1Contract = await L1Factory.deploy();
console.log("Awaiting confirmations");
await l1Contract.deployed();
console.log("Completed");
console.log(`Contract deployed at ${l1Contract.address}`);
}

main().catch((error) => {
console.error(error);
process.exitCode = 1;
})