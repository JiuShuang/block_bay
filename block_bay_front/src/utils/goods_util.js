import {ethers} from "ethers";
import nftAbi from '../contractAbi/nft.json'
import config from '../config.json'
import auctionAbi from "../contractAbi/auction.json";

let provider= new ethers.providers.JsonRpcProvider(" http://127.0.0.1:8545/")
const nftAddress =config.nftAddress
const auctionAddress=config.auctionAddress

export async function safeMint(address,tokenUrl){
    const nftContract =new ethers.Contract(nftAddress,nftAbi,await provider.getSigner())
    const result= await nftContract.safeMint(address,tokenUrl)
    console.log(result)
}

export async function cancelNFT(tokenID){
    const auctionContract=new ethers.Contract(auctionAddress,auctionAbi,await provider.getSigner())
    return await auctionContract.cancelOrder(tokenID)
}

export async function myNFTs(address){
    const nftContract =new ethers.Contract(nftAddress,nftAbi,await provider.getSigner())
    const auctionContract=new ethers.Contract(auctionAddress,auctionAbi,await provider.getSigner())
    let nftBalance=await nftContract.balanceOf(address);
    let nftInMarketOrAuction=await auctionContract.getMyNFTs()
    let tokenList=[]
    let tokenIndexList=[]
    let isListedList=[]
    if(nftBalance.toString()>0){
        for(let i=0; i<nftBalance.toString(); i++)
        {
            let tokenIndex=await nftContract.tokenOfOwnerByIndex(address,i)
            const tokenURI=await nftContract.tokenURI(tokenIndex.toString())
            const isListed=await auctionContract.isListed(tokenIndex.toString())
            isListedList.push(isListed.toString())
            tokenIndexList.push(tokenIndex.toString())
            tokenList.push(tokenURI)
        }
    }
    if(nftInMarketOrAuction.length>0){
        for(let i=0; i<nftInMarketOrAuction.length; i++)
        {
            const tokenURI=await nftContract.tokenURI(nftInMarketOrAuction[i][6].toString())
            const isListed=await auctionContract.isListed(nftInMarketOrAuction[i][6].toString())
            console.log(isListed)
            isListedList.push(isListed.toString())
            tokenIndexList.push(nftInMarketOrAuction[i][6].toString())
            tokenList.push(tokenURI)
        }
    }
    return {tokenIndexList, tokenList,isListedList}
}

export async function addNFTtoMarket(address,tokenID,tokenPrice){
    const nftContract =new ethers.Contract(nftAddress,nftAbi,await provider.getSigner())
    const auctionContract=new ethers.Contract(auctionAddress,auctionAbi,await provider.getSigner())
    const isAuction=await auctionContract.setSellerPreferences(false,0)
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18); // Convert to wei
    const priceInHex = priceInWei.toString(16).padStart(64, '0'); // Convert to hex and pad with zeros
    const priceInBytes = "0x" + priceInHex; // A
    return await nftContract["safeTransferFrom(address,address,uint256,bytes)"](address, config.auctionAddress, tokenID,priceInBytes);
}

export async function addNFTtoAuction(address,tokenID,tokenPrice){
    const nftContract =new ethers.Contract(nftAddress,nftAbi,await provider.getSigner())
    const auctionContract=new ethers.Contract(auctionAddress,auctionAbi,await provider.getSigner())
    const isAuction=await auctionContract.setSellerPreferences(true,3600)
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18);
    const priceInHex = priceInWei.toString(16).padStart(64, '0');
    const priceInBytes = "0x" + priceInHex;
    return nftContract["safeTransferFrom(address,address,uint256,bytes)"](address, config.auctionAddress, tokenID,priceInBytes);
}


