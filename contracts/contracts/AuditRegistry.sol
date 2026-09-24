// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AuditRegistry is ReentrancyGuard, Ownable {
    bytes32 public merkleRoot;
    uint32 public currentEpoch;

    struct DocumentRecord {
        bytes32 docHash;
        uint256 timestamp;
        address submitter;
    }

    mapping(bytes32 => DocumentRecord) public notarizedDocuments;
    mapping(uint32 => mapping(address => bool)) public hasClaimed;

    event DocumentNotarized(bytes32 indexed docHash, address indexed submitter, uint256 timestamp);
    event MerkleRootUpdated(bytes32 indexed newRoot, uint32 indexed epoch);
    event RewardClaimed(address indexed account, uint256 amount, uint32 indexed epoch);

    constructor(bytes32 _initialRoot) Ownable(msg.sender) {
        merkleRoot = _initialRoot;
    }

    function notarizeDocument(bytes32 _docHash) external {
        require(notarizedDocuments[_docHash].timestamp == 0, "Document already notarized");
        
        notarizedDocuments[_docHash] = DocumentRecord({
            docHash: _docHash,
            timestamp: block.timestamp,
            submitter: msg.sender
        });

        emit DocumentNotarized(_docHash, msg.sender, block.timestamp);
    }

    function setMerkleRoot(bytes32 _newRoot, uint32 _epoch) external onlyOwner {
        merkleRoot = _newRoot;
        currentEpoch = _epoch;
        emit MerkleRootUpdated(_newRoot, _epoch);
    }

    function claimTaxReward(uint256 amount, bytes32[] calldata merkleProof) external nonReentrant {
        require(!hasClaimed[currentEpoch][msg.sender], "Reward already claimed");

        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(msg.sender, amount, currentEpoch))));
        require(MerkleProof.verify(merkleProof, merkleRoot, leaf), "Invalid cryptographic proof");

        hasClaimed[currentEpoch][msg.sender] = true;
        payable(msg.sender).transfer(amount);

        emit RewardClaimed(msg.sender, amount, currentEpoch);
    }
}
