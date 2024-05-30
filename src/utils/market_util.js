import {ethers} from "ethers";
import marketAbi from '../contractAbi/market.json'
import config from '../config.json'

let provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
const marketAddress=config.ERC20Address
const marketContract=new ethers.Contract(marketAddress,marketAbi,provider.getSigner())

export async function getAllNFTs(){
    return await marketContract.getAllNFTs();
}

export async function getMyNFTs(){
    return await marketContract.getMyNFTs();
}

export async function buyNFT(tokenID){
    return await marketContract.buy(tokenID);
}
