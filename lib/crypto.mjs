import Web3 from "web3";

export async function signWithPrivateKey(account, messageObj) {
    const web3 = new Web3("http://127.0.0.1:8545");

    const serialized = JSON.stringify(messageObj);

    const messageHash = web3.utils.keccak256(serialized);

    const signature = await web3.eth.sign(messageHash, account);

    return { signature, messageHash };
}