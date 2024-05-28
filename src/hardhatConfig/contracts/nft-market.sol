// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/interfaces/IERC721Receiver.sol";
import "@openzeppelin/contracts/interfaces/IERC721.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

/**
 * @title NFTMarket contract that allows atomic swaps of ERC20 and ERC721
 */
contract Market is IERC721Receiver {
    IERC20 public erc20;
    IERC721 public erc721;

    // used as an necessary arguement to return in the onERC721Receive() function
    bytes4 internal constant MAGIC_ON_ERC721_RECEIVED = 0x150b7a02;

    struct Order {
        address seller;

        bool isAuction;
        uint256 startTime;
        uint256 endTime;
        uint256 highestBid;
        address highestBidder;

        uint256 tokenId;
        uint256 price;
    }

    // Add a new struct to store seller preferences
    struct SellerPreferences {
       bool isAuction;
       uint256 duration;
    }

    mapping(uint256 => Order) public orderOfId; // tokenId to order
    Order[] public orders;
    mapping(uint256 => uint256) public idToOrderIndex; // tokenId to order index
    // Add a new mapping to store preferences by seller address
    mapping(address => SellerPreferences) private sellerPreferences;

    event Deal(address buyer, address seller, uint256 tokenId, uint256 price);
    event NewNormalOrder(address seller, uint256 tokenId, uint256 price);
    // add a new kind of event here
    event NewAuctionOrder(address seller, uint256 tokenId, uint256 startPrice, uint256 startTime, uint256 Endtime);
    event CancelOrder(address seller, uint256 tokenId);
    event ChangePrice(
        address seller,
        uint256 tokenId,
        uint256 previousPrice,
        uint256 price
    );
    event SomeBidden(address bidder, uint256 tokenId, uint256 price);

    // use the other two contracts as erc20 and erc721 so operations like transferFrom() would be more convenient
    constructor(IERC20 _erc20, IERC721 _erc721) {
        require(
            address(_erc20) != address(0),
            "Market: IERC20 contract address must be non-null"
        );
        require(
            address(_erc721) != address(0),
            "Market: IERC721 contract address must be non-null"
        );
        erc20 = _erc20;
        erc721 = _erc721;
    }

    //you can bid for several times until the time ends
    function auction(uint256 _tokenID)external payable{
        require(isListed(_tokenID), "Market: Token ID is not listed");
        require(orderOfId[_tokenID].isAuction == true, "this one is not on auction");
        require(orderOfId[_tokenID].startTime < block.timestamp, "time not valid");
        require(orderOfId[_tokenID].endTime > block.timestamp, "time not valid");
        require(orderOfId[_tokenID].highestBid < msg.value, "must be higher that the bid before");
        require(orderOfId[_tokenID].seller != msg.sender, "you can't bid your own good");
        // if someone has bidden before
        if(orderOfId[_tokenID].highestBidder != address(0)){
            payable(orderOfId[_tokenID].highestBidder).transfer(orderOfId[_tokenID].highestBid);
        }
        // lock the eth inside and update the state of order
        orderOfId[_tokenID].highestBid = msg.value;
        orderOfId[_tokenID].highestBidder = msg.sender;
        //event
        emit SomeBidden(msg.sender, _tokenID, msg.value);
    }
    
    //this can only be called after the bid ends, any one can call this function
    function finishAuction(uint256 _tokenID)external {
        require(isListed(_tokenID), "Market: Token ID is not listed");
        require(orderOfId[_tokenID].isAuction == true, "this one is not on auction");
        require(orderOfId[_tokenID].endTime <= block.timestamp, "time not valid");
        // if someone bids
        if(orderOfId[_tokenID].highestBidder != address(0)){
            // transfer the eth to the seller
            payable(orderOfId[_tokenID].seller).transfer(orderOfId[_tokenID].highestBid);
            // transfer the NFT to the highest bidder
            erc721.safeTransferFrom(address(this), orderOfId[_tokenID].highestBidder, _tokenID);
            // remove the NFT from Order[]
            removeListing(_tokenID);
            emit Deal(orderOfId[_tokenID].highestBidder, orderOfId[_tokenID].seller, _tokenID, orderOfId[_tokenID].highestBid);
        }else {
            // if no one bids, transfer the NFT back to the seller
            erc721.safeTransferFrom(address(this), orderOfId[_tokenID].seller, _tokenID);
            // remove the NFT from Order[]
            removeListing(_tokenID);
            emit CancelOrder(orderOfId[_tokenID].seller, _tokenID);
        }
    }

    function buy(uint256 _tokenId) external {
        require(isListed(_tokenId), "Market: Token ID is not listed");
        require(orderOfId[_tokenId].isAuction == false, "this one is on auction");

        // id => order's seller
        address seller = orderOfId[_tokenId].seller;
        address buyer = msg.sender;
        uint256 price = orderOfId[_tokenId].price;

        require(
            erc20.transferFrom(buyer, seller, price),
            "Market: ERC20 transfer not successful"
        );
        erc721.safeTransferFrom(address(this), buyer, _tokenId);
        //remove the NFT from Order[]
        removeListing(_tokenId);

        emit Deal(buyer, seller, _tokenId, price);
    }

    function cancelOrder(uint256 _tokenId) external {
        require(isListed(_tokenId), "Market: Token ID is not listed");

        address seller = orderOfId[_tokenId].seller;
        require(seller == msg.sender, "Market: Sender is not seller");
        //
        erc721.safeTransferFrom(address(this), seller, _tokenId);
        removeListing(_tokenId);

        emit CancelOrder(seller, _tokenId);
    }

    function changePrice(uint256 _tokenId, uint256 _price) external {
        require(isListed(_tokenId), "Market: Token ID is not listed");
        address seller = orderOfId[_tokenId].seller;
        require(seller == msg.sender, "Market: Sender is not seller");
        //change the price in mapping: orderOfId 
        uint256 previousPrice = orderOfId[_tokenId].price;
        orderOfId[_tokenId].price = _price;
        // also change the price in array orders[]
        // use storage to change the data on blockchain
        Order storage order = orders[idToOrderIndex[_tokenId]];
        order.price = _price;

        emit ChangePrice(seller, _tokenId, previousPrice, _price);
    }

    function getAllNFTs() public view returns (Order[] memory) {
        return orders;
    }

    function getMyNFTs() public view returns (Order[] memory) {
        Order[] memory myOrders = new Order[](orders.length);
        uint256 myOrdersCount = 0;

        for (uint256 i = 0; i < orders.length; i++) {
            if (orders[i].seller == msg.sender) {
                myOrders[myOrdersCount] = orders[i];
                myOrdersCount++;
            }
        }

        Order[] memory myOrdersTrimmed = new Order[](myOrdersCount);
        for (uint256 i = 0; i < myOrdersCount; i++) {
            myOrdersTrimmed[i] = myOrders[i];
        }

        return myOrdersTrimmed;
    }

    function isListed(uint256 _tokenId) public view returns (bool) {
        return orderOfId[_tokenId].seller != address(0);
    }

    function getOrderLength() public view returns (uint256) {
        return orders.length;
    }


    // Add a new function to set preferences, each time before listing a good, the seller should set the preferences
    // you can change your own preference by calling this function again
    function setSellerPreferences(bool _isAuction, uint256 _duration) public {
        if(_isAuction == false){
            sellerPreferences[msg.sender] = SellerPreferences(false, 0);
        }else{
            sellerPreferences[msg.sender] = SellerPreferences(true, _duration);
        }
    }

    /**
     * @dev List a good using a ERC721 receiver hook
     * @param _operator the caller of this function
     * @param _seller the good seller
     * @param _tokenId the good id to list
     * @param _data contains the pricing data as the first 32 bytes
     */
     // receive the function safeTransferFrom in erc721-nft, must has the arguement 'data' to  correspondence '_data'
     // only contract with function Received() can receive NFTs from other contracts
     // hook
    function onERC721Received(
        address _operator, // address called erc721-nft-safeTransferFrom
        address _seller,   // owner of NFT
        uint256 _tokenId,  
        bytes calldata _data
    ) public override returns (bytes4) {
        require(_operator == _seller, "Market: Seller must be operator");
        uint256 _price = toUint256(_data, 0);
        bool _isAuction = sellerPreferences[_seller].isAuction;
        uint256 _duration = sellerPreferences[_seller].duration;
        if(_isAuction == false){
            placeNormalOrder(_seller, _tokenId, _price);
        }else{
            placeAuctionOrder(_seller, _tokenId, _price, _duration);
        }
        return MAGIC_ON_ERC721_RECEIVED;  // will be examined by supportsInterface()
    }

    // https://stackoverflow.com/questions/63252057/how-to-use-bytestouint-function-in-solidity-the-one-with-assembly
    function toUint256(
        bytes memory _bytes,
        uint256 _start
    ) public pure returns (uint256) {
        require(_start + 32 >= _start, "Market: toUint256_overflow");
        require(_bytes.length >= _start + 32, "Market: toUint256_outOfBounds");
        uint256 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x20), _start))
        }

        return tempUint;
    }

    // list NFT , just sell directly
    function placeNormalOrder(
        address _seller,
        uint256 _tokenId,
        uint256 _price
    ) internal {
        require(_price > 0, "Market: Price must be greater than zero");
        orderOfId[_tokenId].seller = _seller;
        orderOfId[_tokenId].price = _price;
        orderOfId[_tokenId].tokenId = _tokenId;
        orderOfId[_tokenId].isAuction = false;
        orderOfId[_tokenId].startTime = 0;
        orderOfId[_tokenId].endTime = 0;
        orderOfId[_tokenId].highestBid = _price;
        orderOfId[_tokenId].highestBidder = address(0);

        orders.push(orderOfId[_tokenId]);
        idToOrderIndex[_tokenId] = orders.length - 1;
        emit NewNormalOrder(_seller, _tokenId, _price);
    }

    // place the order in the auction
    function placeAuctionOrder(
        address _seller,
        uint256 _tokenId,
        uint256 _price,
        uint256 duration
    ) internal {
        require(_price > 0, "Market: Price must be greater than zero");
        orderOfId[_tokenId].seller = _seller;
        orderOfId[_tokenId].price = _price;
        orderOfId[_tokenId].tokenId = _tokenId;
        orderOfId[_tokenId].isAuction = true;
        orderOfId[_tokenId].startTime = block.timestamp;
        orderOfId[_tokenId].endTime = orderOfId[_tokenId].startTime + duration;
        orderOfId[_tokenId].highestBid = _price;
        orderOfId[_tokenId].highestBidder = address(0);

        orders.push(orderOfId[_tokenId]);
        idToOrderIndex[_tokenId] = orders.length - 1;
        emit NewAuctionOrder(_seller, _tokenId, _price, orderOfId[_tokenId].startTime, orderOfId[_tokenId].endTime);
    }

    function removeListing(uint256 _tokenId) internal {
        delete orderOfId[_tokenId];

        uint256 orderToRemoveIndex = idToOrderIndex[_tokenId];
        uint256 lastOrderIndex = orders.length - 1;

        if (lastOrderIndex != orderToRemoveIndex) {
            Order memory lastOrder = orders[lastOrderIndex];
            // change the positions of lastOrder and OrderToRemove, and cover
            orders[orderToRemoveIndex] = lastOrder;
            //change the index of lastOrder to orderToRemoveIndex
            idToOrderIndex[lastOrder.tokenId] = orderToRemoveIndex;
        }
        orders.pop();
    }
}