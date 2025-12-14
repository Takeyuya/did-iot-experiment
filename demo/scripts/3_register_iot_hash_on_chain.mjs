import fs from "fs";
import { createWeb3, getAccounts, getRegistryContract, registerIoTData } from "../../lib/registry.mjs";
import { register } from "module";

(async () => {
  console.log("\n==========================================");
  console.log("🟦 Step3: IoTデータ(CID) をブロックチェーンへ登録");
  console.log("==========================================\n");

  const web3 = createWeb3();
  const accounts = await getAccounts(web3);
  const registry = await getRegistryContract(web3);

  const userA = accounts[0];
  console.log("[1] UserA の Ethereum アドレス:", userA, "\n");

  // --- CID 読み込み ---
  const cid = fs.readFileSync("demo/output/ipfs_cid.txt", "utf8").trim();

  console.log("[2] IPFS から取得した CID:");
  console.log(`   → ${cid}\n`);

  // --- DID 読み込み ---
  const didJson = fs.readFileSync("demo/output/userA_did.json", "utf8");
  const didA = JSON.parse(didJson).id;

  console.log("[3] UserA の DID:");
  console.log(`   → ${didA}\n`);

  console.log("[4] ブロックチェーンへ登録処理を送信中...\n");

  // --- CID をチェーンへ登録 ---
  await registerIoTData(registry, userA, didA, cid);

  console.log("[5] 登録完了！");
  console.log("   → IoTデータ (DID, CID) をブロックチェーンに保存しました。\n");

  console.log("==========================================");
  console.log("🎉 Step3 完了: IoT データ登録成功");
  console.log("==========================================\n");
})();
