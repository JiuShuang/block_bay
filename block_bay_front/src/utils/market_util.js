import {ethers} from "ethers";
import marketAbi from '../contractAbi/auction.json'
import config from '../config.json'
import erc721Abi from "@/contractAbi/nft.json";
import erc20Abi from '../contractAbi/currency.json'

let provider= new ethers.providers.JsonRpcProvider(" http://127.0.0.1:8545/")

const currencyAddress=config.currencyAddress
const auctionAddress=config.auctionAddress
const nftAddress =config.nftAddress


export async function getAllNFTsInMarket(){
    const auctionContract=new ethers.Contract(auctionAddress,marketAbi,await provider.getSigner())
    const nftContract =new ethers.Contract(nftAddress,erc721Abi,await provider.getSigner())
    const nftResult= await auctionContract.getAllNFTs();
    if(nftResult.length>0){
        let nftList=[]
        let sellerList=[]
        let tokenIDList=[]
        console.log(nftResult[0][6].toString())
        for(let i=0; i<nftResult.length; i++){
            if(nftResult[i][1]===false){
                const tokenInfo=await nftContract.tokenURI(nftResult[i][6].toString())
                tokenIDList.push(nftResult[i][6].toString())
                nftList.push(tokenInfo)
                sellerList.push(nftResult[i][0])
            }
        }
        return {nftList,sellerList,tokenIDList}
    }
}

export async function getAllNFTsInAuction(){
    const auctionContract=new ethers.Contract(auctionAddress,marketAbi,await provider.getSigner())
    const nftContract =new ethers.Contract(nftAddress,erc721Abi,await provider.getSigner())
    const nftResult= await auctionContract.getAllNFTs();
    if(nftResult.length>0){
        let tokenIDList=[]
        let nftList=[]
        let sellerList=[]
        let highestBid=[]
        for(let i=0; i<nftResult.length; i++){
            if(nftResult[i][1]===true){
                // await marketContract.finishAuction(nftResult[i][6].toNumber())
                const tokenInfo=await nftContract.tokenURI(nftResult[i][6].toString())
                const orderInfo=await auctionContract.orderOfId(nftResult[i][6].toString())
                // eslint-disable-next-line no-undef
                const priceInWei = BigInt(orderInfo[4]) / BigInt(10**18);
                tokenIDList.push(nftResult[i][6].toString())
                nftList.push(tokenInfo)
                sellerList.push(nftResult[i][0])
                highestBid.push(priceInWei.toString())
            }
        }
        return {nftList,sellerList,tokenIDList,highestBid}
    }
}

export async function getMyNFTs(){
    const auctionContract=new ethers.Contract(auctionAddress,marketAbi,await provider.getSigner())
    return await auctionContract.getMyNFTs();
}

export async function buyNFT(tokenID,tokenPrice){
    const auctionContract=new ethers.Contract(auctionAddress,marketAbi,await provider.getSigner())
    const currencyContract=new ethers.Contract(currencyAddress,erc20Abi,await provider.getSigner())
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18);
    console.log(priceInWei)
    await currencyContract["approve(address,uint256)"](config.auctionAddress,priceInWei)
    return await auctionContract.buy(tokenID);
}

export async function auctionNFT(tokenID,value){
    const auctionContract=new ethers.Contract(auctionAddress,marketAbi,await provider.getSigner())
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(value) * BigInt(10**18); // Convert to wei
    return await auctionContract.auction(tokenID,{
        value:priceInWei
    })
}
