const {expect} = require('chai')
const {ethers} = require('hardhat')

describe("Market", function(){
    let usdt, myNft, market, account1, account2, account3;
    beforeEach(async() =>{
        // through this way to get external accounts
        // if don't use connect(), account1(the first argument) will always be used as the arguments for functions
        [account1, account2, account3] = await ethers.getSigners();
        //实例化
        const USDT = await ethers.getContractFactory("cUSTD");
        //deploy
        usdt = await USDT.deploy();

        const MyNFT = await ethers.getContractFactory("MyNFT");
        myNft = await MyNFT.deploy();
        const Market = await ethers.getContractFactory("Market");
        market = await Market.deploy(usdt.target, myNft.target);

        baseUri = "test/"
        // mint 2 NFTs to account1, internal function
        await myNft.safeMint(account1.address, baseUri + "0");
        await myNft.safeMint(account1.address, baseUri + "1");
        //approve

        //transfer usdt to account2
        await usdt.transfer(account2.address, "10000000000000000000000");
        await usdt.transfer(account3.address, "10000000000000000000000");
        //** connect */
    });

    it("the erc20 address should be usdt", async() =>{
        expect(await market.erc20()).to.equal(usdt.target);
    });

    it("the erc721 address should be MyNft", async() =>{
        expect(await market.erc721()).to.equal(myNft.target);
    });

    it("account1 should have 2 NFTs", async() =>{
        expect(await myNft.balanceOf(account1.address)).to.equal(2)
    });

    it("acount2 should have 10000 usdt", async() =>{
        expect(await usdt.balanceOf(account2.address)).to.equal("10000000000000000000000");
    });

    it("accoun2 should have no NFT", async() =>{
        expect(await myNft.balanceOf(account2.address)).to.equal(0)
    });

    it("should set seller preferences on auction and list NFT to market", async()=>{
        // set the good can be on auction
        await market.connect(account1).setSellerPreferences(true, 36000);
        // List the NFT to the market
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        // here we use market.target, not market.address
        expect(await myNft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewAuctionOrder");
        expect(await market.changePrice(0, "10000000000000000000001")).to.emit(market, "ChangePrice");

        await market.connect(account1).setSellerPreferences(false, 36000);
        expect(await myNft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price)).to.emit(market, "NewNormalOrder");
        expect(await market.changePrice(0, "10000000000000000000001")).to.emit(market, "ChangePrice");

        expect((await market.getMyNFTs()).length).to.equal(2);
        expect((await market.getMyNFTs())[0][1]).to.equal(true);
        expect((await market.getMyNFTs())[1][1]).to.equal(false);
    })

    it("should be able on auction on goods", async() =>{
        // first list the good
        await market.connect(account1).setSellerPreferences(true, 36000);
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        expect(await myNft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewAuctionOrder");
        expect(await market.changePrice(0, "9000000000000000000000")).to.emit(market, "ChangePrice");
        // then try auction
        expect(await market.connect(account2).auction(0, { value: "9000000000000000000001" })).to.emit(market, "SomeBidden");
        expect(await market.connect(account3).auction(0, { value: "9000000000000000000002" })).to.emit(market, "SomeBidden");
        // try the highest bid
        const order = await market.orderOfId(0);
        expect(order.highestBid).to.equal("9000000000000000000002");
        expect(order.highestBidder).to.equal(account3.address);
    })

    it("should be able to finish the auction", async() =>{
        await market.connect(account1).setSellerPreferences(true, 5);
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        expect(await myNft.connect(account1)['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewAuctionOrder");
        expect(await market.changePrice(0, "9000000000000000000000")).to.emit(market, "ChangePrice");
        expect(await market.connect(account2).auction(0, { value: "9000000000000000000001" })).to.emit(market, "SomeBidden");
        expect(setTimeout(()=> market.finfishAuction(0), 5000)).to.emit(market, "Deal")
    })

    it('account1 can unlist one nft from market', async function() {
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        await market.connect(account1).setSellerPreferences(false, 0);
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewOrder");
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price)).to.emit(market, "NewOrder");
        expect(await market.cancelOrder(0)).to.emit(market, "CancelOrder");
        expect(await market.getOrderLength()).to.equal(1);
        expect(await market.isListed(0)).to.equal(false);
        expect((await market.getMyNFTs()).length).to.equal(1);
      })

      it('account1 can change price of nft from market', async function() {
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        await market.connect(account1).setSellerPreferences(false, 0);
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewOrder");
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price)).to.emit(market, "NewOrder");
        expect(await market.changePrice(1, "10000000000000000000000")).to.emit(market, "ChangePrice");
        expect((await market.getMyNFTs()).length).to.equal(2);
        expect((await market.getMyNFTs())[1][7]).to.equal("10000000000000000000000");
      })

    it("account2 can buy NFT from market", async() =>{
        const price = "0x0000000000000000000000000000000000000000000000000001c6bf52634000";
        await market.connect(account1).setSellerPreferences(false, 0);
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 0, price)).to.emit(market, "NewOrder");
        expect(await myNft['safeTransferFrom(address,address,uint256,bytes)'](account1.address, market.target, 1, price)).to.emit(market, "NewOrder");
        //use account2 to approve, only then account2's usdt can be used in contract market
        await usdt.connect(account2).approve(market.target, "10000000000000000000000");
        //use connect to use account2 to buy NFT
        //buy() is a independent function for connect, not an element for it
        expect(await market.connect(account2).buy(1)).to.emit(market, "Deal");
        expect(await market.getOrderLength()).to.equal(1);
        expect(await usdt.balanceOf(account1.address)).to.equal("99980000000500000000000000");
        expect(await usdt.balanceOf(account2.address)).to.equal("9999999500000000000000");
        expect(await myNft.ownerOf(1)).to.equal(account2.address);
    });
})