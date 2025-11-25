// lib/registry.mjs
import Web3 from "web3";
import DIDRegistryArticact from "../build/contracts/DIDRegistry.json" assert { type: "json" };

// --- Web3インスタンス生成 ---
export function createWeb3() {
    return new Web3("http://127.0.0.1:8545");
}

// --- アカウント一覧取得 ---
export async function getAccounts(web3) {
    return await web3.eth.getAccounts();
}

export async function getRegistryContract(web3) {
    const networkId = (await web3.eth.net.getId()).toString();
    const deployed = DIDRegistryArticact.networks[networkId];

    return new web3.eth.Contract(DIDRegistryArticact.abi, deployed.address);
}

// --- DID DocumentをDID文字列から検索 ---
export async function findDIDDocument(registry, accounts, did) {
    for(const acc of accounts) {
        const count = await registry.methods.getDIDCount(acc).call();
        for(let i = 0; i < count; i++) {
            const doc = await registry.methods.getDIDDocument(acc, i).call();
            if(doc.did === did) {
                return {
                    owner: acc,
                    document: doc
                };
            }
        }
    }
    return null;
}

// --- IoTデータ(DID + CiD)を検索　---
export async function findIoTRecord(registry, accounts, did, cid) {
    for(const acc of accounts) {
        const count = await registry.methods.getIoTDataCount(acc).call();
        for(let i = 0; i < count; i++) {
            const rec = await registry.methods.getIoTData(acc, i).call();
            if(rec.did === did && rec.cid === cid) {
                return {
                    owner: acc,
                    record: rec
                };
            }
        }
    }
    return null;
}

// --- DIDのみ一致するIoTデータを検索 ---
export async function findIoTByDID(registry, accounts, did) {
    for(const acc of accounts) {
        const count = await registry.methods.getIoTDataCount(acc).call();
        for(let i = 0; i < count; i++) {
            const rec = await registry.methods.getIoTData(acc, i).call();
            if(rec.did === did) {
                return {
                    owner: acc,
                    record: rec
                };
            }
        }
    }
    return null;
}

// --- IoTデータ登録 ---
export async function registerIoTData(registry, from, did, cid) {
    return await registry.methods
        .registerIoTData(did, cid)
        .send({ from, gas: 300000 });
}

// --- DID Documentを登録 ---
export async function registerIoTDocument(registry, from, did, didDoc) {
    return await registry.methods
        .registerDIDDocument(did, JSON.stringify(didDoc))
        .send({ from, gas: 300000 });
}