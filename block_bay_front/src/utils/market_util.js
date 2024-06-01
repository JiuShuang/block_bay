import {ethers} from "ethers";
import marketAbi from '../contractAbi/market.json'
import config from '../config.json'
import erc721Abi from "@/contractAbi/erc721-nft.json";

let provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")

const erc20Address=config.ERC20Address
const erc20Contract=new ethers.Contract(erc20Address,marketAbi,provider.getSigner())

const marketAddress=config.marketAddress
const marketContract=new ethers.Contract(marketAddress,marketAbi,provider.getSigner())

const erc721Address =config.NFTAddress
const erc721Contract =new ethers.Contract(erc721Address,erc721Abi,provider.getSigner())

export async function getAllNFTsInMarket(){
    const nftResult= await marketContract.getAllNFTs();
    if(nftResult.length>0){
        let nftList=[]
        let sellerList=[]
        let tokenIDList=[]
        console.log(nftResult[0][6].toNumber())
        for(let i=0; i<nftResult.length; i++){
            if(nftResult[i][1]===false){
                const tokenInfo=await erc721Contract.tokenURI(nftResult[i][6].toNumber())
                tokenIDList.push(nftResult[i][6].toNumber())
                nftList.push(tokenInfo)
                sellerList.push(nftResult[i][0])
            }
        }
        return {nftList,sellerList,tokenIDList}
    }
}

export async function getAllNFTsInAuction(){
    const nftResult= await marketContract.getAllNFTs();
    if(nftResult.length>0){
        let nftList=[]
        let sellerList=[]
        let tokenIDList=[]
        console.log(nftResult[0][6].toNumber())
        for(let i=0; i<nftResult.length; i++){
            if(nftResult[i][1]===true){
                const tokenInfo=await erc721Contract.tokenURI(nftResult[i][6].toNumber())
                tokenIDList.push(nftResult[i][6].toNumber())
                nftList.push(tokenInfo)
                sellerList.push(nftResult[i][0])
            }
        }
        return {nftList,sellerList,tokenIDList}
    }
}

export async function getMyNFTs(){
    return await marketContract.getMyNFTs();
}

export async function buyNFT(tokenID,tokenPrice){
    await erc20Contract.approve(config.marketAddress,tokenPrice)
    return await marketContract.buy(tokenID);
}

export async function auctionNFT(tokenID,value){
    return await marketContract.auction(tokenID,{
        value:value
    })
}
