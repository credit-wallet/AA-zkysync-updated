import { utils, Wallet, Provider } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { Deployer } from '@matterlabs/hardhat-zksync-deploy';

// export default async function (hre: HardhatRuntimeEnvironment) {
//   console.log("running");
//   const wallet = new Wallet('0760f12e22b81d72ab9cbf7321990b9c05a73cf5bf0f0e180b9382eb9abc9fc8');
//   const deployer = new Deployer(hre, wallet);
//   const L2ContractArtifact = await deployer.loadArtifact('L2Contract');


//   const factory = await deployer.deploy(
//     L2ContractArtifact,
//     undefined,
//   );
//   console.log(`L2 address: ${factory.address}`);
// }

export default async function (hre: HardhatRuntimeEnvironment) {

  const l2Addr = "0xbF205b1Db30A122b43FaD0279eCFf8035CF890b0";  
  console.log("running");
  const provider = new Provider('https://zksync2-testnet.zksync.dev');
  const wallet = new Wallet('0760f12e22b81d72ab9cbf7321990b9c05a73cf5bf0f0e180b9382eb9abc9fc8').connect(provider);
  const L2Artifact = await hre.artifacts.readArtifact('L2Contract');

  const L2Contract = new ethers.Contract(
    l2Addr,
    L2Artifact.abi,
    wallet
  );

  const tx = await L2Contract.sendGreetingMessageToL1('hello zbi');
  await tx.wait();
  console.log(tx);

}
