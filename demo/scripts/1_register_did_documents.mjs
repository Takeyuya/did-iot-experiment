
import fs from "fs";
import { createWeb3, getAccounts, getRegistryContract, registerIoTData, registerIoTDocument } from "../../lib/registry.mjs";

(async () => {
  console.log("\n==========================================");
  console.log("🟦 Step1: DID ドキュメント生成 & 登録");
  console.log("==========================================\n");

  // --- Web3・アカウント・Registry接続(共通化)　---
  const web3 = createWeb3();
  const accounts = await getAccounts(web3);
  const registry = await getRegistryContract(web3);

  const userA = accounts[0];
  const company = accounts[1];

  // --- DID Document 作成 ---
  const didUserA = "did:example:userA";
  const didDocUserA = {
    id: didUserA,
    controller: userA
  };

  const didCompany = "did:example:company";
  const didDocCompany = {
    id: didCompany,
    controller: company
  };

  console.log("① UserA と Company の DID Document を作成しました。\n");
  console.log("📄 UserA DID Document:");
  console.log(JSON.stringify(didDocUserA, null, 2), "\n");

  console.log("📄 Company DID Document:");
  console.log(JSON.stringify(didDocCompany, null, 2), "\n");

  // ファイル保存
  fs.writeFileSync("demo/output/userA_did.json", JSON.stringify(didDocUserA, null, 2));
  fs.writeFileSync("demo/output/company_did.json", JSON.stringify(didDocCompany, null, 2));

  console.log("② DID Document をファイルに保存しました。");
  console.log("   保存先: demo/output/*.json\n");

  // --- UserA の DID 登録 ---
  console.log("④ UserA の DID をブロックチェーンへ登録中...");
  await registerIoTDocument(registry, userA, didUserA, didDocUserA);
  console.log("   → UserA の DID を登録しました。\n");

  // --- Company の DID 登録 ---
  console.log("⑤ Company の DID をブロックチェーンへ登録中...");
  await registerIoTDocument(registry, company, didCompany, didDocCompany);
  console.log("   → Company の DID を登録しました。\n");

  console.log("==========================================");
  console.log("🎉 DID ドキュメント登録 完了");
  console.log("==========================================\n");
})();
