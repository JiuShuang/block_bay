
var priceInEther = "1"; // Set your price here
var priceInWei = BigInt(priceInEther) * BigInt(10**18); // Convert to wei
var priceInHex = priceInWei.toString(16).padStart(64, '0'); // Convert to hex and pad with zeros
var priceInBytes = "0x" + priceInHex; // Add '0x' prefix
console.log(priceInBytes);
