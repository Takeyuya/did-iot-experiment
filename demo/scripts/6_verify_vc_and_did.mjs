import fs from "fs";
import { createWeb3, getAccounts, getRegistryContract, findDIDDocument, findIoTRecord } from "../../lib/registry.mjs";

(async () => {
  const web3 = createWeb3();

  // --- VCの読み込み ---
  const vc = JSON.parse(fs.readFileSync("demo/output/vc_user_signed.json", "utf8"));

  console.log("\n=====================================");
  console.log("Step6: Verifiable Credential(VC)の検証");
  console.log("=======================================\n");

  // VC の内容を表示
  console.log("[1] 検証対象の VC:");
  console.log(JSON.stringify(vc, null, 2), "\n");

  // --- DID Registry 接続 ---
  const registry = await getRegistryContract(web3);
  const accounts = await getAccounts(web3);

  const issuerDid = vc.issuer;
  const subjectDid = vc.subject;
  const cid = vc.claim.cid;

  // ============================================================
  // 1. Issuer DID の存在確認 + 内容一致チェック
  // ============================================================
  console.log("[2] Issuer の DID Document を検索...");
  
  const issuerResult = await findDIDDocument(registry, accounts, issuerDid);

  if (!issuerResult) {
    console.log("❌ Issuer DID がブロックチェーン上に存在しません:", issuerDid);
    return;
  }

  // console.log("✅ Issuer DID をブロックチェーンで確認:", issuerDid);
  console.log("   ▶ 所有者アドレス:", issuerResult.owner);
  console.log("   ▶ DID Document:", issuerResult.document, "\n");

  // ============================================================
  // 2. Subject DID の存在+一致チェック
  // ============================================================

  console.log("[3] Subject(UserA) の DID Document を検索...");
  
  const subjectResult = await findDIDDocument(registry, accounts, subjectDid);

  if (!subjectResult) {
    console.log("❌ Subject DID がブロックチェーン上に存在しません:", subjectDid);
    return;
  }

  // console.log("✅ Subject DID をブロックチェーンで確認:", subjectDid);
  console.log("   ▶ 所有者アドレス:", subjectResult.owner);
  console.log("   ▶ DID Document:", subjectResult.document, "\n");

  // ============================================================
  // 3. IoT データ CID の存在+一致チェック
  // ============================================================

  console.log("[4] IoTデータの記録を検索...");
  
  const iotResult = await findIoTRecord(registry, accounts, subjectDid ,cid);

  if (!iotResult) {
    console.log("❌ IoTデータ (DID, CID) がブロックチェーンに存在しません");
    return;
  }

  // console.log("✅ IoTデータをブロックチェーンで確認:");
  console.log("   ▶ DID:", iotResult.record.did);
  console.log("   ▶ CID:", iotResult.record.cid, "\n");

  // ============================================================
  // 4. Issuer の署名検証
  // ============================================================

  console.log("[5] Issuer の署名を検証中...");

  const issuerRecovered = web3.eth.accounts.recover(vc.proof.hash, vc.proof.signature);

  console.log("   ▶ recover結果:", issuerRecovered);
  console.log("   ▶ 登録Issuerアドレス     :", issuerResult.owner);

  if (issuerRecovered.toLowerCase() === issuerResult.owner.toLowerCase()) {
    console.log("   ✅ Issuer の署名は正しい\n");
  } else {
    console.log("   ❌ Issuer の署名が不正です\n");
  }

  // ============================================================
  // 5. UserA の署名検証
  // ============================================================

  console.log("[6] UserA の署名を検証中...");

  const userRecovered = web3.eth.accounts.recover(vc.userProof.hash, vc.userProof.signature);

  console.log("   ▶ recover結果:", userRecovered);
  console.log("   ▶ UserAアドレス", subjectResult.owner);

  if (userRecovered.toLowerCase() === subjectResult.owner.toLowerCase()) {
    console.log("   ✅ UserA の署名は正しい\n");
  } else {
    console.log("   ❌ UserA の署名が不正です\n");
  }

  console.log("===============================");
  console.log("Step6 完了: VC検証処理が正常に終了しました");
  console.log("===============================\n");
})();
