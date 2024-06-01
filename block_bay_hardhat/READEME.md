How to use these contracts
##
Please read this document patiently and carefully if you haven't got to know about the mechanism of these contrcats, this will help you avoid 99% of the problems instead of spending numerous time on those low-level mistakes and annoying others.
##
Please make sure the settings of Remix IDE should be the following:
compiler: 0.8.20
Remix VM(Shanghai)
##
First, you need AT LEAST 3 accounts to finish the whole process. Assume that there are seller(also the deployer of market), buyer1, buyer2, I recommend add an account4 to make the whole clear.
##
Use account4 to deploy the contract cUSTD, which means 1 * 10 ** 8 of cUSTD(equal to 1 * 10 ** 8 * 10 ** 18 wei) will be transferred to account4 automatically.
Then use account4 to call the function of contract cUSTD: transfer(), the first argument should be buyer1 and buyer2, the second argument should be at least 1 * 10 ** 20(which means 100 cUSTD for each buyer to make sure their balances are enough).
Now both buyer1 and buyer2 have 100 cUSTD(equal to 1 * 10 ** 2 * 10 ** 18 wei).
##
Use seller to deploy the contract MyNFT, then call the function safeMint(), the first argument should be the seller's address, for the second argument you can type in like "test/0". After this, seller should have a nft.
##
Use seller to deploy the contract Market, when deploying, you need to type in the contract cUSTD's address and contract MyNFT separately.
Use seller to call the function setSellerPreferences() to set the seller's preference. For example, we want to make the nft on auction, so we type in like (true, 30000) for the arguments. The 30000 means after being listed in the market, the nft will be on auction for 30000ms.
Once your nft is on auction, if you want to make it just for selling, you should call the function cancelOrder() first, then change the references by calling setSellerPreferences(), then transfer the nft to the market again, also the same for the reverse situation.
##
Use the seller to call the function safeTransferFrom() which NEEDS 4 ARGUMENTS. You should type in: the seller's address, the market's address, the tokenId, the data which is the price in bytes. 
For example, type in for each argument: 
seller's address, market's address, 0, 0x0000000000000000000000000000000000000000000000000001c6bf52634000.
You can use the encode.js file to print the price you want in bytes.
Now you have listed you nft(on auction or just for sell) in the market.
##
Recommend: use the seller to call the function changePrice() to change price, this time you just need to input the new price as uint256, like: (0, 1000000000000000000), which means new price is 1 ETH. 
Try calling function like isListed() to make sure the nft is in market exactly.
##
Use the buyer1 and buyer2 to call the function approve() in contract cUSTD, type in like (market's address, 100000000000000000000) to allow market to spend their token.
##
Use the buyer1 or buyer2 to call the function auction() in contract Market.
For example, we have used the seller to change the price into 1 ETH(1 * 10 ** 18 wei) before; thus buyer need a higher price to call the auction() function, we can use buyer1 to call like (0), the msg.value is 1000000000000000001 (1 wei higher than the initial price); then use buyer2 to call the same function: (0), msg.value is 1000000000000000002(should be higher than buyer1).
##
It's hard to test the function finishAuction() of contract Market in Remix IDE, because controlling exact time is difficult.
You can try calling the function finishAuction() by using any of these address, after finishing the steps above; you will always get the error: "time not valid", actually, this means the function is OK.
The test of this function is in the test file market.js, go and view them carefully.


