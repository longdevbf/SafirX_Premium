// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract NFTMarket is ReentrancyGuard, Ownable {
    enum ListingType {
        SINGLE,
        COLLECTION_BUNDLE
    }
    struct Listing {
        uint256 tokenId;
        address nftContract;
        address seller;
        uint256 price;
        bool isActive;
    }

    struct CollectionListing {
        uint256 collectionId;
        address nftContract;
        address seller;
        uint256[] tokenIds;
        uint256 bundlePrice;
        bool isActive;
        string collectionName;
        ListingType listingType;
    }

    uint256 private _listingIdCounter = 1;
    uint256 private _collectionIdCounter = 1;
    uint256 private constant FEE = 250;
    uint256 private constant MAX_COLLECTION_SIZE = 100;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => CollectionListing) public collectionListings;
    mapping(address => mapping(uint256 => uint256)) public tokenToListingId;

    event NFTListed(uint256 indexed listingId, address indexed nftContract, uint256 indexed tokenId, address seller, uint256 price, ListingType listingType);
    event CollectionBundleListed(uint256 indexed collectionId, address indexed nftContract, address indexed seller, uint256[] tokenIds, uint256 bundlePrice, string collectionName);
    event NFTSold(uint256 indexed listingId, address indexed seller, address indexed buyer, uint256 price, ListingType listingType);
    event CollectionBundleSold(uint256 indexed collectionId, address indexed seller, address indexed buyer, uint256[] tokenIds, uint256 bundlePrice);
    event ListingCancelled(uint256 indexed listingId, address indexed seller, ListingType listingType);
    event CollectionCancelled(uint256 indexed collectionId, address indexed seller, ListingType listingType);
    event PriceUpdated(uint256 indexed listingId, uint256 oldPrice, uint256 newPrice);
    event BundlePriceUpdated(uint256 indexed collectionId, uint256 oldPrice, uint256 newPrice);

    constructor(address initialOwner) Ownable(initialOwner) {}

    function listSingleNFT(address nftContract, uint256 tokenId, uint256 price) external nonReentrant {
        require(price > 0, "Price must be greater than 0");
        require(IERC721(nftContract).ownerOf(tokenId) == msg.sender, "Not owner");
        require(tokenToListingId[nftContract][tokenId] == 0, "NFT already listed");
        require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) || 
                IERC721(nftContract).getApproved(tokenId) == address(this), "Not approved");

        uint256 listingId = _listingIdCounter++;
        listings[listingId] = Listing(tokenId, nftContract, msg.sender, price, true);
        tokenToListingId[nftContract][tokenId] = listingId;

        emit NFTListed(listingId, nftContract, tokenId, msg.sender, price, ListingType.SINGLE);
    }

    function listCollectionBundle(address nftContract, uint256[] calldata tokenIds, uint256 bundlePrice, string calldata collectionName) external nonReentrant {
        require(tokenIds.length > 1, "Bundle must have at least 2 NFTs");
        require(tokenIds.length <= MAX_COLLECTION_SIZE, "Collection too large");
        require(bundlePrice > 0, "Bundle price must be greater than 0");
        require(bytes(collectionName).length > 0, "Collection name required");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            require(IERC721(nftContract).ownerOf(tokenIds[i]) == msg.sender, "Not owner");
            require(tokenToListingId[nftContract][tokenIds[i]] == 0, "NFT already listed");
            require(IERC721(nftContract).isApprovedForAll(msg.sender, address(this)) || 
                    IERC721(nftContract).getApproved(tokenIds[i]) == address(this), "Not approved");
        }

        uint256 collectionId = _collectionIdCounter++;
        collectionListings[collectionId] = CollectionListing(collectionId, nftContract, msg.sender, tokenIds, bundlePrice, true, collectionName, ListingType.COLLECTION_BUNDLE);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            tokenToListingId[nftContract][tokenIds[i]] = collectionId;
        }

        emit CollectionBundleListed(collectionId, nftContract, msg.sender, tokenIds, bundlePrice, collectionName);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];
        require(listing.isActive, "This listing is not active");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own NFT");
        require(IERC721(listing.nftContract).ownerOf(listing.tokenId) == listing.seller, "Seller no longer owns this NFT");

        listing.isActive = false;
        _processPayment(listing.seller, listing.price);
        IERC721(listing.nftContract).safeTransferFrom(listing.seller, msg.sender, listing.tokenId);
        delete tokenToListingId[listing.nftContract][listing.tokenId];

        emit NFTSold(listingId, listing.seller, msg.sender, listing.price, ListingType.SINGLE);
    }

    function buyCollectionBundle(uint256 collectionId) external payable nonReentrant {
        CollectionListing storage collection = collectionListings[collectionId];
        require(collection.isActive, "Collection is not active");
        require(msg.value >= collection.bundlePrice, "Insufficient payment");
        require(msg.sender != collection.seller, "Cannot buy your own collection");

        for (uint256 i = 0; i < collection.tokenIds.length; i++) {
            require(IERC721(collection.nftContract).ownerOf(collection.tokenIds[i]) == collection.seller, "Seller no longer owns all NFTs");
        }

        collection.isActive = false;
        _processPayment(collection.seller, collection.bundlePrice);

        for (uint256 i = 0; i < collection.tokenIds.length; i++) {
            IERC721(collection.nftContract).safeTransferFrom(collection.seller, msg.sender, collection.tokenIds[i]);
            delete tokenToListingId[collection.nftContract][collection.tokenIds[i]];
        }

        emit CollectionBundleSold(collectionId, collection.seller, msg.sender, collection.tokenIds, collection.bundlePrice);
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller || msg.sender == owner(), "Not authorized to cancel this listing");
        require(listing.isActive, "Listing already inactive");

        listing.isActive = false;
        delete tokenToListingId[listing.nftContract][listing.tokenId];

        emit ListingCancelled(listingId, listing.seller, ListingType.SINGLE);
    }

    function cancelCollection(uint256 collectionId) external nonReentrant {
        CollectionListing storage collection = collectionListings[collectionId];
        require(msg.sender == collection.seller || msg.sender == owner(), "Not authorized to cancel this collection");
        require(collection.isActive, "Collection already inactive");

        collection.isActive = false;
        for (uint256 i = 0; i < collection.tokenIds.length; i++) {
            delete tokenToListingId[collection.nftContract][collection.tokenIds[i]];
        }

        emit CollectionCancelled(collectionId, collection.seller, ListingType.COLLECTION_BUNDLE);
    }

    function updatePrice(uint256 listingId, uint256 newPrice) external nonReentrant {
        Listing storage listing = listings[listingId];
        require(msg.sender == listing.seller, "Only seller can update price");
        require(listing.isActive, "Listing not active");
        require(newPrice > 0, "Price must be greater than 0");

        uint256 oldPrice = listing.price;
        listing.price = newPrice;

        emit PriceUpdated(listingId, oldPrice, newPrice);
    }

    function updateBundlePrice(uint256 collectionId, uint256 newBundlePrice) external nonReentrant {
        CollectionListing storage collection = collectionListings[collectionId];
        require(msg.sender == collection.seller, "Only seller can update price");
        require(collection.isActive, "Collection not active");
        require(newBundlePrice > 0, "Price must be greater than 0");

        uint256 oldPrice = collection.bundlePrice;
        collection.bundlePrice = newBundlePrice;

        emit BundlePriceUpdated(collectionId, oldPrice, newBundlePrice);
    }

    function _processPayment(address seller, uint256 price) private {
        uint256 feeAmount = (price * FEE) / 10000;
        uint256 sellerAmount = price - feeAmount;
        payable(seller).transfer(sellerAmount);
        if (feeAmount > 0) {
            payable(owner()).transfer(feeAmount);
        }
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }
    }
}