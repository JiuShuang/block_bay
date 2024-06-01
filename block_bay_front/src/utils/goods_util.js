import {ethers} from "ethers";
import erc721Abi from '../contractAbi/erc721-nft.json'
import config from '../config.json'
import marketAbi from "@/contractAbi/market.json";

let provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")

const erc721Address =config.NFTAddress
const erc721Contract =new ethers.Contract(erc721Address,erc721Abi,provider.getSigner())

const marketAddress=config.marketAddress
const marketContract=new ethers.Contract(marketAddress,marketAbi,provider.getSigner())

export async function safeMint(address,tokenUrl){
    const result= await erc721Contract.safeMint(address,tokenUrl)
    console.log(result)
}

export async function myNFTs(address){
    let nftBalance=await erc721Contract.balanceOf(address);
    if(nftBalance.toNumber()>0){
        let tokenList=[]
        let tokenIndexList=[]
        let isListedList=[]
        for(let i=0; i<nftBalance.toNumber(); i++)
        {
            let tokenIndex=await erc721Contract.tokenOfOwnerByIndex(address,i)
            const tokenURI=await erc721Contract.tokenURI(tokenIndex.toNumber())
            const isListed=await marketContract.isListed(tokenIndex.toString())
            console.log(isListed)
            isListedList.push(isListed.toString())
            tokenIndexList.push(tokenIndex.toNumber())
            tokenList.push(tokenURI)
        }
        return {tokenIndexList, tokenList,isListedList}
    }else {
        return null
    }
}

export async function addNFTtoMarket(address,tokenID,tokenPrice){
    const isAuction=await marketContract.setSellerPreferences(false,0)
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18); // Convert to wei
    const priceInHex = priceInWei.toString(16).padStart(64, '0'); // Convert to hex and pad with zeros
    const priceInBytes = "0x" + priceInHex; // A
    return await erc721Contract["safeTransferFrom(address,address,uint256,bytes)"](address, config.marketAddress, tokenID,priceInBytes);
}

export async function addNFTtoAuction(address,tokenID,tokenPrice){
    const isAuction=await marketContract.setSellerPreferences(true,3600)
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18);
    const priceInHex = priceInWei.toString(16).padStart(64, '0');
    const priceInBytes = "0x" + priceInHex;
    return erc721Contract["safeTransferFrom(address,address,uint256,bytes)"](address, config.marketAddress, tokenID,priceInBytes);
}


