// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts/utils/Address.sol";

contract Voter is Initializable, OwnableUpgradeable {
    using Address for address payable;

    mapping(uint256 => address) public votes;
    mapping(uint256 => bool) public isAcceptableId;

    bool public paused;
    bool private locked;

    event Voter__Cast(uint256 indexed id, address indexed voter);
    event VoteIdAdded(uint256 indexed id);
    event VoteIdRemoved(uint256 indexed id);
    event Withdrawn(uint256 amount);
    event Paused();
    event Unpaused();

    error VoteAlreadyCast(uint256 id);
    error InvalidVoteId(uint256 id);
    error InvalidVoteAmount(uint256 amount);
    error ReentrancyDetected();

    modifier whenNotPaused() {
        require(!paused, "Voting is paused");
        _;
    }

    modifier nonReentrant() {
        if (locked) revert ReentrancyDetected();
        locked = true;
        _;
        locked = false;
    }

    function initialize(uint256[] memory ids) public initializer {
        __Ownable_init(msg.sender);
        paused = false;
        locked = false;

        for (uint256 i = 0; i < ids.length; i++) {
            isAcceptableId[ids[i]] = true;
        }
    }

    function castVote(uint256 _id) public payable whenNotPaused returns (bool) {
        if (msg.value < 0.01 ether) revert InvalidVoteAmount(msg.value);
        if (!isAcceptableId[_id]) revert InvalidVoteId(_id);
        if (votes[_id] != address(0)) revert VoteAlreadyCast(_id);

        votes[_id] = msg.sender;
        emit Voter__Cast(_id, msg.sender);
        return true;
    }

    function getVote(uint256 _id) public view returns (address) {
        return votes[_id];
    }
 function getAllVotes(uint256 totalIds) public view returns (address[] memory) {
    uint256 count = 0;

    // First pass: count how many acceptable IDs
    for (uint256 i = 0; i < totalIds; i++) {
        if (isAcceptableId[i]) {
            count++;
        }
    }

    // Allocate array of correct size
    address[] memory allVotes = new address[](count);
    uint256 index = 0;

    // Second pass: fill array with vote addresses
    for (uint256 i = 0; i < totalIds; i++) {
        if (isAcceptableId[i]) {
            allVotes[index] = votes[i];
            index++;
        }
    }

    return allVotes;
}


    function addAcceptableId(uint256 _id) external onlyOwner {
        isAcceptableId[_id] = true;
        emit VoteIdAdded(_id);
    }

    function removeAcceptableId(uint256 _id) external onlyOwner {
        isAcceptableId[_id] = false;
        emit VoteIdRemoved(_id);
    }

    function withdraw() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        payable(owner()).sendValue(balance);
        emit Withdrawn(balance);
    }

    function pause() external onlyOwner {
        paused = true;
        emit Paused();
    }

    function unpause() external onlyOwner {
        paused = false;
        emit Unpaused();
    }

    receive() external payable {}
    fallback() external payable {}
}
