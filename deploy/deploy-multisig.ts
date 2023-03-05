import { utils, Wallet, Provider, EIP712Signer, types } from 'zksync-web3';
import * as ethers from 'ethers';
import { HardhatRuntimeEnvironment } from 'hardhat/types';

// Put the address of your AA factory
const AA_FACTORY_ADDRESS = '0x29c6fF2E3D04a9f37e7af1fF9b38C9E2e9079FfA';

export default async function (hre: HardhatRuntimeEnvironment) {
  const provider = new Provider('http://localhost:3050/');
  const wallet = new Wallet('0x7726827caac94a7f9e1b160f7ea819f172f7b6f9d2a97f992c38edeab82d4110').connect(provider);
  const factoryArtifact = await hre.artifacts.readArtifact('AAFactory');

  const aaFactory = new ethers.Contract(
    AA_FACTORY_ADDRESS,
    factoryArtifact.abi,
    wallet
  );

  // The two owners of the multisig
  const owner1 = new Wallet('0xac1e735be8536c6534bb4f17f06f6afc73b2b5ba84ac2cfb12f7461b20c0bbe3').connect(provider);
  const owner2 = new Wallet('0xd293c684d884d56f8d6abd64fc76757d3664904e309a0645baf8522ab6366d9e').connect(provider);

  // For the simplicity of the tutorial, we will use zero hash as salt
  const salt = ethers.constants.HashZero;

  const tx = await aaFactory.deployAccount(
    salt,
    owner1.address,
    owner2.address
  );
  await tx.wait();

  // Getting the address of the deployed contract
  const abiCoder = new ethers.utils.AbiCoder();
  const multisigAddress = utils.create2Address(
    AA_FACTORY_ADDRESS,
    await aaFactory.aaBytecodeHash(),
    salt,
    abiCoder.encode(['address', 'address'], [owner1.address, owner2.address])
  );
  console.log(`Multisig deployed on address ${multisigAddress}`);

  await (
    await wallet.sendTransaction({
      to: multisigAddress,
      // You can increase the amount of ETH sent to the multisig
      value: ethers.utils.parseEther('0.003'),
    })
  ).wait();

  // let aaTx = await aaFactory.populateTransaction.deployAccount(
  //   salt,
  //   Wallet.createRandom().address,
  //   Wallet.createRandom().address
  // );

  // const gasLimit = await provider.estimateGas(aaTx);
  // const gasPrice = await provider.getGasPrice();

  // aaTx = {
  //   ...aaTx,
  //   from: multisigAddress,
  //   gasLimit: gasLimit,
  //   gasPrice: gasPrice,
  //   chainId: (await provider.getNetwork()).chainId,
  //   nonce: await provider.getTransactionCount(multisigAddress),
  //   type: 113,
  //   customData: {
  //     gasPerPubdata: utils.DEFAULT_GAS_PER_PUBDATA_LIMIT,
  //   } as types.Eip712Meta,
  //   value: ethers.BigNumber.from(0),
  // };
  // const signedTxHash = EIP712Signer.getSignedDigest(aaTx);

  // const signature = ethers.utils.concat([
  //   // Note, that `signMessage` wouldn't work here, since we don't want
  //   // the signed hash to be prefixed with `\x19Ethereum Signed Message:\n`
  //   ethers.utils.joinSignature(owner1._signingKey().signDigest(signedTxHash)),
  //   ethers.utils.joinSignature(owner2._signingKey().signDigest(signedTxHash)),
  // ]);

  // aaTx.customData = {
  //   ...aaTx.customData,
  //   customSignature: signature,
  // };

  // console.log(
  //   `The multisig's nonce before the first tx is ${await provider.getTransactionCount(
  //     multisigAddress
  //   )}`
  // );
  // const sentTx = await provider.sendTransaction(utils.serialize(aaTx));
  // await sentTx.wait();

  // // Checking that the nonce for the account has increased
  // console.log(
  //   `The multisig's nonce after the first tx is ${await provider.getTransactionCount(
  //     multisigAddress
  //   )}`
  // );
}


