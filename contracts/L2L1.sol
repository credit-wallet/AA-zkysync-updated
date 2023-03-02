// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

 interface IL1Messenger {
    // Possibly in the future we will be able to track the messages sent to L1 with
    // some hooks in the VM. For now, it is much easier to track them with L2 events.
    event L1MessageSent(address indexed _sender, bytes32 indexed _hash, bytes _message);

    function sendToL1(bytes memory _message) external returns (bytes32);
    }

contract L2Contract {

    IL1Messenger constant L1_MESSENGER_CONTRACT = IL1Messenger("0x1234567890123456789012345678901234567890");

    event MessageSent(bytes32 indexed messageHash, address indexed l1Messenger, bytes message);

    function callDrawDown(uint amount, address receiver) external returns(bytes32 messageHash) {
        bytes memory message = abi.encodeWithSignature(
            "drawdown()",
            amount,
            receiver
        );

        messageHash = L1_MESSENGER_CONTRACT.sendToL1(message);
        emit MessageSent(messageHash, address(L1_MESSENGER_CONTRACT), message);
    }
}


//L1 Contract ---------------

import "@matterlabs/zksync-contracts/l1/contracts/zksync/interfaces/IZkSync.sol";

contract L1Contract {
    address private l2Contract;


    constructor(address _l2Contract) {
      l2Contract = _l2Contract;
    }

    function drawdown(amount,receiver);

    mapping(uint32 => mapping(uint256 => bool)) isL2ToL1MessageProcessed;

    function consumeMessageFromL2(
        // The address of the zkSync smart contract.
        // It is not recommended to hardcode it during the alpha testnet as regenesis may happen.
        // This can be retrieved with zksync-web3 zkSyncProvider.getMainContractAddress()
        address _zkSyncAddress,
        // zkSync block number in which the message was sent
        uint32 _blockNumber,
        // The position in the L2 logs Merkle tree of the l2Log that was sent with the message, that can be received via API
        uint256 _index,
        // Message index, that can be received via API
        uint16 _txNumberInBlock,
        // The sender address of the message
        address _sender,
        // The message that was sent from l2
        bytes calldata _message,
        // Merkle proof for inclusion of L2 log that was sent with the message
        bytes32[] calldata _proof
        ) external returns (bytes32 messageHash) {
            // check that the message has not been processed yet
            require(!isL2ToL1MessageProcessed[_blockNumber][_index]);
            require(_sender == l2Contract);

            (uint32 functionSignature,) = UnsafeBytes.readUint32(_message, 0);
            require(bytes4(functionSignature) == this.setGreeting.selector);

            IZkSync zksync = IZkSync(_zkSyncAddress);

            bool success = zksync.proveL2MessageInclusion(
            _blockNumber,
            _index,
            // Information about the sent message: sender address, the message itself, tx index in the L2 block where the message was sent
            L2Message({sender: _sender, data: _message, txNumberInBlock: _txNumberInBlock}),
            _proof
            );
            require(success, "Failed to prove message inclusion");
            (bool callSuccess,) = address(this).call(_message);
            emit CallResult(callSuccess, _blockNumber, _message);

            // Mark message as processed
            isL2ToL1MessageProcessed[_blockNumber][_index] = true;
    }

    
}