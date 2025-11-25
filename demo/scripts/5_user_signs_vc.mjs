import fs from "fs";
import { createWeb3, getAccounts } from "../../lib/registry.mjs";
import { signWithPrivateKey } from "../../lib/crypto.mjs";

(async () => {
  console.log("\n==========================================");
  console.log("🟦 Step5: UserA による VC 署名");
  console.log("==========================================\n");

  const web3 = createWeb3();
  const accounts = await getAccounts(web3);
  const userA = accounts[0];

  console.log("① UserA の Ethereum アドレス:");
  console.log(`   → ${userA}\n`);

  // --- VC を読み込み ---
  console.log("② 企業が発行した VC を読み込みます...\n");
  const vc = JSON.parse(
    fs.readFileSync("demo/output/vc_device_auth.json", "utf8")
  );

  console.log("🔍 読み込んだ VC の概要:");
  console.log(`   Issuer DID   → ${vc.issuer}`);
  console.log(`   Subject DID  → ${vc.subject}`);
  console.log(`   CID          → ${vc.claim.cid}\n`);

  // --- UserA が VC 全体に署名 ---
  console.log("③ UserA が VC 内容全体に対して署名します...\n");
  const { signature, messageHash } = await signWithPrivateKey(userA, vc);

  vc.userProof = {
    type: "EcdsaSecp256k1",
    created: new Date().toISOString(),
    verificationMethod: "did:example:userA#key-1",
    hash: messageHash,
    signature: signature
  };

  console.log("④ UserA による署名が完了しました。");
  console.log("   以下が UserA の署名情報です：\n");
  console.log("===== 🔍 UserA の署名情報 =====");
  console.log(JSON.stringify(vc.userProof, null, 2));
  console.log("================================\n");

  // --- 保存 ---
  fs.writeFileSync("demo/output/vc_user_signed.json", JSON.stringify(vc, null, 2));

  console.log("⑤ VC（企業署名＋UserA署名）を保存しました。");
  console.log("   保存先: demo/output/vc_user_signed.json\n");

  console.log("🎉 Step5 完了: UserA による VC 署名が成功しました\n");
})();
