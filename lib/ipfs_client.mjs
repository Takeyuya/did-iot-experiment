import { create } from "ipfs-http-client";
import fs from "fs";

// --- IPFSに接続 ---
export function connectIPFS() {
    return create({ url: "http://127.0.0.1:5001"});
}

// --- ファイルをIPFSにアップロード ---
export async function uploadFile(ipfs, filePath) {
    const content = fs.readFileSync(filePath);
    const result = await ipfs.add(content);
    return result.cid.toString();
}