import fs from "fs";
import { connectIPFS, uploadFile } from "../../lib/ipfs_client.mjs";

(async () => {
  console.log("\n==========================================");
  console.log("🟦 Step2: IoTデータをIPFSへアップロード");
  console.log("==========================================\n");

  // --- IPFS 接続 ---
  console.log("① ローカル IPFS ノードへ接続しています...");
  const ipfs = connectIPFS();
  console.log("   → 接続成功\n");

  // --- アップロードするファイル読み込み ---
 const filePath = "demo/data/iot-data.json";
 const content = fs.readFileSync(filePath);

  console.log("② アップロードする IoT データ（JSON）の内容を表示します：\n");

  try {
    console.log(JSON.stringify(JSON.parse(content), null, 2), "\n");
  } catch {
    console.log("(JSON パース失敗のため raw content を表示)");
    console.log(content.toString(), "\n");
  }

  // --- IPFS アップロード ---
  console.log("③ IPFS へデータをアップロード中...\n");

  const cid = await uploadFile(ipfs, filePath);

  // --- 出力 ---
  fs.writeFileSync("demo/output/ipfs_cid.txt", cid);

  console.log("④ アップロード完了！");
  console.log("   → 取得した IPFS CID:", cid, "\n");

  console.log("⑤ CID を demo/output/ipfs_cid.txt に保存しました。\n");

  console.log("==========================================");
  console.log("🎉 IPFS アップロード処理 完了");
  console.log("==========================================\n");
})();
