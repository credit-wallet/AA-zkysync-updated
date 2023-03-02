// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;


interface IL1Messenger {
    // Possibly in the future we will be able to track the messages sent to L1 with
    // some hooks in the VM. For now, it is much easier to track them with L2 events.
    event L1MessageSent(address indexed _sender, bytes32 indexed _hash, bytes _message);

    function sendToL1(bytes memory _message) external returns (bytes32);
    }

contract L2Contract {
    IL1Messenger constant L1_MESSENGER_CONTRACT = IL1Messenger(0x1234567890123456789012345678901234567890);
    event MessageSent(bytes32 indexed messageHash, address indexed l1Messenger, bytes message);

    function sendGreetingMessageToL1(string memory greeting) external returns(bytes32 messageHash) {
        bytes memory message = abi.encodeWithSignature(
            "setGreeting(string)",
            greeting
        );

        messageHash = L1_MESSENGER_CONTRACT.sendToL1(message);
        emit MessageSent(messageHash, address(L1_MESSENGER_CONTRACT), message);
    }
}