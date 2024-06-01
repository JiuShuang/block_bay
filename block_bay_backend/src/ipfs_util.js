const create=require('kubo-rpc-client')


const ipfs = create("http://localhost:5001/") // (/ (the default in Node.js)


export async function uploadJSONToIPFS(json) {
    return await ipfs.add(JSON.stringify(json));
}
