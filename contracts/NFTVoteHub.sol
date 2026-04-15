// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract NFTVoteHub is ERC721URIStorage {
    struct Proposal {
        string title;
        string description;
        uint256 deadline;
        uint256 yesVotes;
        uint256 noVotes;
        bool executed;
        bool active;
        bool passed;
    }

    address public immutable admin;
    uint256 public mintFee = 0.001 ether;
    uint256 public tokenCounter;
    uint256 public proposalCounter;

    mapping(uint256 => address) public tokenCreator;
    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => address) public proposalCreator;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event NFTMinted(uint256 indexed tokenId, address indexed to, string tokenURI);
    event NFTURIUpdated(uint256 indexed tokenId, string newTokenURI);
    event NFTBurned(uint256 indexed tokenId, address indexed by);
    event MintFeeUpdated(uint256 newMintFee);
    event ProposalCreated(uint256 indexed proposalId, address indexed creator, uint256 deadline);
    event ProposalUpdated(uint256 indexed proposalId);
    event ProposalDeleted(uint256 indexed proposalId);
    event VoteCast(uint256 indexed proposalId, address indexed voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed proposalId, bool passed);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    constructor() ERC721("TopshiriqNFT", "TSNFT") {
        admin = msg.sender;
    }

    function setMintFee(uint256 newMintFee) external onlyAdmin {
        mintFee = newMintFee;
        emit MintFeeUpdated(newMintFee);
    }

    function mintNFT(address to, string calldata uri) external payable returns (uint256 tokenId) {
        require(bytes(uri).length > 0, "Token URI required");
        require(msg.value >= mintFee, "Insufficient mint fee");

        tokenCounter += 1;
        tokenId = tokenCounter;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        tokenCreator[tokenId] = msg.sender;

        if (msg.value > mintFee) {
            (bool refunded, ) = payable(msg.sender).call{value: msg.value - mintFee}("");
            require(refunded, "Refund failed");
        }

        emit NFTMinted(tokenId, to, uri);
    }

    function updateTokenURI(uint256 tokenId, string calldata newURI) external {
        require(bytes(newURI).length > 0, "Token URI required");
        require(_isTokenManager(msg.sender, tokenId), "Not owner nor approved");

        _setTokenURI(tokenId, newURI);
        emit NFTURIUpdated(tokenId, newURI);
    }

    function burnNFT(uint256 tokenId) external {
        require(_isTokenManager(msg.sender, tokenId), "Not owner nor approved");

        _burn(tokenId);
        emit NFTBurned(tokenId, msg.sender);
    }

    function createProposal(
        string calldata title,
        string calldata description,
        uint256 durationMinutes
    ) external returns (uint256 proposalId) {
        require(bytes(title).length > 0, "Title required");
        require(durationMinutes > 0, "Duration must be > 0");

        proposalCounter += 1;
        proposalId = proposalCounter;

        proposals[proposalId] = Proposal({
            title: title,
            description: description,
            deadline: block.timestamp + (durationMinutes * 1 minutes),
            yesVotes: 0,
            noVotes: 0,
            executed: false,
            active: true,
            passed: false
        });

        proposalCreator[proposalId] = msg.sender;
        emit ProposalCreated(proposalId, msg.sender, proposals[proposalId].deadline);
    }

    function updateProposal(
        uint256 proposalId,
        string calldata newTitle,
        string calldata newDescription
    ) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.active, "Proposal inactive");
        require(proposalCreator[proposalId] == msg.sender, "Only creator");
        require(block.timestamp < proposal.deadline, "Proposal expired");
        require((proposal.yesVotes + proposal.noVotes) == 0, "Already voted");
        require(bytes(newTitle).length > 0, "Title required");

        proposal.title = newTitle;
        proposal.description = newDescription;

        emit ProposalUpdated(proposalId);
    }

    function deleteProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.active, "Already inactive");
        require(proposalCreator[proposalId] == msg.sender, "Only creator");
        require((proposal.yesVotes + proposal.noVotes) == 0, "Already voted");

        proposal.active = false;
        emit ProposalDeleted(proposalId);
    }

    function vote(uint256 proposalId, bool support) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.active, "Proposal inactive");
        require(block.timestamp < proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 weight = balanceOf(msg.sender);
        require(weight > 0, "Need NFT to vote");

        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            proposal.yesVotes += weight;
        } else {
            proposal.noVotes += weight;
        }

        emit VoteCast(proposalId, msg.sender, support, weight);
    }

    function executeProposal(uint256 proposalId) external {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.active, "Proposal inactive");
        require(block.timestamp >= proposal.deadline, "Voting not finished");
        require(!proposal.executed, "Already executed");

        proposal.executed = true;
        proposal.passed = proposal.yesVotes > proposal.noVotes;

        emit ProposalExecuted(proposalId, proposal.passed);
    }

    function getProposal(
        uint256 proposalId
    )
        external
        view
        returns (
            string memory title,
            string memory description,
            uint256 deadline,
            uint256 yesVotes,
            uint256 noVotes,
            bool executed,
            bool active,
            bool passed,
            address creator
        )
    {
        Proposal memory proposal = proposals[proposalId];
        return (
            proposal.title,
            proposal.description,
            proposal.deadline,
            proposal.yesVotes,
            proposal.noVotes,
            proposal.executed,
            proposal.active,
            proposal.passed,
            proposalCreator[proposalId]
        );
    }

    function withdraw(address payable to) external onlyAdmin {
        require(to != address(0), "Zero address");
        uint256 amount = address(this).balance;
        require(amount > 0, "No funds");

        (bool sent, ) = to.call{value: amount}("");
        require(sent, "Withdraw failed");
    }

    function _isTokenManager(address user, uint256 tokenId) internal view returns (bool) {
        address owner = ownerOf(tokenId);
        return user == owner || getApproved(tokenId) == user || isApprovedForAll(owner, user);
    }
}
