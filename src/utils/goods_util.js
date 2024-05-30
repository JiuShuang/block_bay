import {ethers} from "ethers";
import erc20Abi from '../contractAbi/erc20-usdt.json'
import erc721Abi from '../contractAbi/erc721-nft.json'
import config from '../config.json'

let provider=new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545")
const erc20Address=config.ERC20Address
const erc20Contract=new ethers.Contract(erc20Address,erc20Abi,provider.getSigner())

const erc721Address =config.NFTAddress
const erc721Contract =new ethers.Contract(erc721Address,erc721Abi,provider.getSigner())

export async function safeMint(address,tokenUrl){
    const result= await erc721Contract.safeMint(address,tokenUrl)
    console.log(result)
    console.log(erc20Contract)
}

export async function myNFTs(address){
    let nftBalance=await erc721Contract.balanceOf(address);
    if(nftBalance.toNumber()>0){
        let tokenList=[]
        for(let i=0; i<nftBalance.toNumber(); i++)
        {
            let tokenIndex=await erc721Contract.tokenOfOwnerByIndex(address,i)
            const tokenURI=await erc721Contract.tokenURI(tokenIndex.toNumber())
            tokenList.push(tokenURI)
        }
        return tokenList
    }else {
        return null
    }
}

export async function addNFTtoMarket(address,tokenID,tokenPrice){
    const isAuction=await erc721Contract.setSellerPreferences(false,0).send({from: address})
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18); // Convert to wei
    const priceInHex = priceInWei.toString(16).padStart(64, '0'); // Convert to hex and pad with zeros
    const priceInBytes = "0x" + priceInHex; // A
    return await erc721Contract.safeTransferFrom(address,config.marketAddress,tokenID,priceInBytes).send({from: address})
}

export async function addNFTtoAuction(address,tokenID,tokenPrice){
    const isAuction=await erc721Contract.setSellerPreferences(true,3600).send({from: address})
    console.log(isAuction)
    // eslint-disable-next-line no-undef
    const priceInWei = BigInt(tokenPrice) * BigInt(10**18); // Convert to wei
    const priceInHex = priceInWei.toString(16).padStart(64, '0'); // Convert to hex and pad with zeros
    const priceInBytes = "0x" + priceInHex; // A
    return await erc721Contract.safeTransferFrom(address,config.marketAddress,tokenID,priceInBytes).send({from: address})
}

export async function unListNFT(tokenID){
    return await erc721Contract.cancelOrder(tokenID)
}

// export async function buyNFY(tokenID){
//
// }


