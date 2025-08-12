// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";

contract SealedBidAuction is ReentrancyGuard, Ownable, ERC721Holder {
    enum AuctionType { SINGLE_NFT, COLLECTION }
    enum AuctionState { ACTIVE, FINALIZED, CANCELLED }

    struct Auction {
        uint256 auctionId;
        AuctionType auctionType;
        address nftContract;
        uint256 tokenId;
        uint256[] tokenIds;
        address seller;
        uint256 startingPrice;
        uint256 reservePrice;
        uint256 minBidIncrement;
        uint256 startTime;
        uint256 endTime;
        uint256 bidExtensionTime;
        AuctionState state;
        uint256 totalBids;
        address highestBidder;
        uint256 highestBid;
        string title;
        string description;
        uint256 claimDeadline;
    }

    struct Bid {
        address bidder;
        uint256 amount;
        uint256 timestamp;
        uint256 deposit;
    }

    uint256 private _auctionIdCounter = 1;
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 30 days;
    uint256 public constant BID_EXTENSION_TIME = 10 minutes;
    uint256 public constant MAX_EXTENSIONS = 10;
    uint256 public constant MAX_COLLECTION_SIZE = 100;
    uint256 public constant CLAIM_DURATION = 3 days;
    uint256 public constant PLATFORM_FEE = 250; // 2.5%
    uint256 public constant MIN_BID_INCREMENT = 0.001 ether;
    uint256 public constant MAX_BIDS_PER_AUCTION = 1000;

    mapping(uint256 => Auction) public auctions;
    mapping(uint256 => Bid[]) private auctionBids;
    mapping(uint256 => mapping(address => uint256)) private bidderToIndex;
    mapping(address => uint256[]) private userAuctions;
    mapping(address => uint256[]) private userBids;
    mapping(uint256 => uint256) private auctionDeposits;

    event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nftContract, AuctionType auctionType, uint256 tokenId, uint256[] tokenIds, uint256 startingPrice, uint256 endTime, string title);
    event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 timestamp);
    event AuctionFinalized(uint256 indexed auctionId, address indexed winner, uint256 finalPrice, uint256 platformFeeAmount, uint256 sellerAmount);
    event AuctionCancelled(uint256 indexed auctionId, address indexed seller, string reason);
    event NFTClaimed(uint256 indexed auctionId, address indexed winner, uint256 amountPaid);
    event NFTReclaimed(uint256 indexed auctionId, address indexed seller);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function createSingleNFTAuction(
        address nftContract,
        uint256 tokenId,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 minBidIncrement,
        uint256 duration,
        string calldata title,
        string calldata description
    ) external nonReentrant returns (uint256) {
        require(supportsERC721(nftContract), "Invalid NFT contract");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid duration");
        require(startingPrice > 0 && reservePrice >= startingPrice, "Invalid price");
        require(minBidIncrement >= MIN_BID_INCREMENT, "Increment too low");
        require(bytes(title).length > 0, "Title required");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(IERC721(nftContract).getApproved(tokenId) == address(this) || IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");

        IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 auctionId = _auctionIdCounter++;
        uint256 endTime = block.timestamp + duration;
        auctions[auctionId] = Auction(
            auctionId,
            AuctionType.SINGLE_NFT,
            nftContract,
            tokenId,
            new uint256[](0),
            msg.sender,
            startingPrice,
            reservePrice,
            minBidIncrement,
            block.timestamp,
            endTime,
            BID_EXTENSION_TIME,
            AuctionState.ACTIVE,
            0,
            address(0),
            0,
            title,
            description,
            0
        );
        userAuctions[msg.sender].push(auctionId);

        emit AuctionCreated(auctionId, msg.sender, nftContract, AuctionType.SINGLE_NFT, tokenId, new uint256[](0), startingPrice, endTime, title);
        return auctionId;
    }

    function createCollectionAuction(
        address nftContract,
        uint256[] calldata tokenIds,
        uint256 startingPrice,
        uint256 reservePrice,
        uint256 minBidIncrement,
        uint256 duration,
        string calldata title,
        string calldata description
    ) external nonReentrant returns (uint256) {
        require(supportsERC721(nftContract), "Invalid NFT contract");
        require(duration >= MIN_AUCTION_DURATION && duration <= MAX_AUCTION_DURATION, "Invalid duration");
        require(startingPrice > 0 && reservePrice >= startingPrice, "Invalid price");
        require(minBidIncrement >= MIN_BID_INCREMENT, "Increment too low");
        require(bytes(title).length > 0 && tokenIds.length > 1 && tokenIds.length <= MAX_COLLECTION_SIZE, "Invalid tokenIds");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(IERC721(nftContract).ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            require(IERC721(nftContract).getApproved(tokenIds[i]) == address(this) || IERC721(nftContract).isApprovedForAll(msg.sender, address(this)), "Contract not approved");
            IERC721(nftContract).safeTransferFrom(msg.sender, address(this), tokenIds[i]);
        }

        uint256 auctionId = _auctionIdCounter++;
        uint256 endTime = block.timestamp + duration;
        auctions[auctionId] = Auction(
            auctionId,
            AuctionType.COLLECTION,
            nftContract,
            0,
            tokenIds,
            msg.sender,
            startingPrice,
            reservePrice,
            minBidIncrement,
            block.timestamp,
            endTime,
            BID_EXTENSION_TIME,
            AuctionState.ACTIVE,
            0,
            address(0),
            0,
            title,
            description,
            0
        );
        userAuctions[msg.sender].push(auctionId);

        emit AuctionCreated(auctionId, msg.sender, nftContract, AuctionType.COLLECTION, 0, tokenIds, startingPrice, endTime, title);
        return auctionId;
    }

    function placeBid(uint256 auctionId, uint256 bidAmount) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");
        require(msg.value == auction.startingPrice, "Incorrect deposit");
        require(bidAmount >= auction.startingPrice + auction.minBidIncrement, "Bid too low");
        require(auction.totalBids < MAX_BIDS_PER_AUCTION, "Max bids reached");

        uint256 existingIndex = bidderToIndex[auctionId][msg.sender];
        if (existingIndex > 0) {
            Bid storage existingBid = auctionBids[auctionId][existingIndex - 1];
            require(bidAmount > existingBid.amount, "New bid must be higher");
            existingBid.amount = bidAmount;
            existingBid.timestamp = block.timestamp;
        } else {
            auctionBids[auctionId].push(Bid(msg.sender, bidAmount, block.timestamp, msg.value));
            bidderToIndex[auctionId][msg.sender] = auctionBids[auctionId].length;
            auction.totalBids++;
            userBids[msg.sender].push(auctionId);
            auctionDeposits[auctionId] += msg.value;
        }


        emit BidPlaced(auctionId, msg.sender, block.timestamp);
    }

    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction still active");

        auction.state = AuctionState.FINALIZED;
        (address winner, uint256 highestBid) = determineWinner(auctionId);
        auction.highestBidder = winner;
        auction.highestBid = highestBid;

        if (winner != address(0) && highestBid >= auction.reservePrice) {
            auction.claimDeadline = block.timestamp + CLAIM_DURATION;
            uint256 feeAmount = (highestBid * PLATFORM_FEE) / 10000;
            uint256 sellerAmount = highestBid - feeAmount;

            for (uint256 i = 0; i < auctionBids[auctionId].length; i++) {
                Bid storage bid = auctionBids[auctionId][i];
                if (bid.bidder != winner) {
                    payable(bid.bidder).transfer(bid.deposit);
                    auctionDeposits[auctionId] -= bid.deposit;
                } else {
                    payable(auction.seller).transfer(bid.deposit);
                    auctionDeposits[auctionId] -= bid.deposit;
                }
            }

            emit AuctionFinalized(auctionId, winner, highestBid, feeAmount, sellerAmount);
        } else {
            cancelAuctionInternal(auctionId, "Reserve not met");
        }
    }

    function cancelAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.ACTIVE, "Auction not active");
        require(msg.sender == auction.seller || msg.sender == owner(), "Not authorized");

        cancelAuctionInternal(auctionId, "Cancelled by seller or owner");
    }

    function cancelAuctionInternal(uint256 auctionId, string memory reason) internal {
        Auction storage auction = auctions[auctionId];
        auction.state = AuctionState.CANCELLED;

        for (uint256 i = 0; i < auctionBids[auctionId].length; i++) {
            Bid storage bid = auctionBids[auctionId][i];
            payable(bid.bidder).transfer(bid.deposit);
            auctionDeposits[auctionId] -= bid.deposit;
        }

        if (auction.auctionType == AuctionType.SINGLE_NFT) {
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);
        } else {
            for (uint256 i = 0; i < auction.tokenIds.length; i++) {
                IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenIds[i]);
            }
        }

        emit AuctionCancelled(auctionId, auction.seller, reason);
    }

    function claimNFT(uint256 auctionId) external payable nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.FINALIZED, "Auction not finalized");
        require(msg.sender == auction.highestBidder, "Not winner");
        require(block.timestamp <= auction.claimDeadline, "Claim period expired");

        uint256 remainingAmount = auction.highestBid - auction.startingPrice;
        require(msg.value == remainingAmount, "Incorrect amount");

        uint256 feeAmount = (auction.highestBid * PLATFORM_FEE) / 10000;
        uint256 sellerAmount = auction.highestBid - feeAmount;

        if (auction.auctionType == AuctionType.SINGLE_NFT) {
            IERC721(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenId);
        } else {
            for (uint256 i = 0; i < auction.tokenIds.length; i++) {
                IERC721(auction.nftContract).safeTransferFrom(address(this), msg.sender, auction.tokenIds[i]);
            }
        }

        payable(auction.seller).transfer(sellerAmount - auction.startingPrice);
        payable(owner()).transfer(feeAmount);

        emit NFTClaimed(auctionId, msg.sender, remainingAmount);
    }

    function reclaimNFT(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.state == AuctionState.FINALIZED, "Auction not finalized");
        require(msg.sender == auction.seller, "Not seller");
        require(block.timestamp > auction.claimDeadline || auction.highestBidder == address(0), "Claim period not expired or no bids");

        if (auction.auctionType == AuctionType.SINGLE_NFT) {
            IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenId);
        } else {
            for (uint256 i = 0; i < auction.tokenIds.length; i++) {
                IERC721(auction.nftContract).safeTransferFrom(address(this), auction.seller, auction.tokenIds[i]);
            }
        }

        emit NFTReclaimed(auctionId, auction.seller);
    }

    function determineWinner(uint256 auctionId) internal view returns (address winner, uint256 highestBid) {
        Bid[] storage bids = auctionBids[auctionId];
        uint256 highestAmount = 0;
        address tempWinner = address(0);
        uint256 winnerTimestamp = type(uint256).max;

        for (uint256 i = 0; i < bids.length; i++) {
            if (bids[i].amount > highestAmount || (bids[i].amount == highestAmount && bids[i].timestamp < winnerTimestamp)) {
                highestAmount = bids[i].amount;
                tempWinner = bids[i].bidder;
                winnerTimestamp = bids[i].timestamp;
            }
        }
        return (tempWinner, highestAmount);
    }

    function supportsERC721(address nftContract) internal view returns (bool) {
        return IERC721(nftContract).supportsInterface(0x80ac58cd);
    }

    function getAuctionBids(uint256 auctionId) external view returns (Bid[] memory) {
        require(auctionId > 0 && auctionId < _auctionIdCounter, "Invalid auction ID");
        require(auctions[auctionId].state == AuctionState.FINALIZED, "Auction not finalized");
        return auctionBids[auctionId];
    }
}