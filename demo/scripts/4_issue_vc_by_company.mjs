import fs from "fs";
import { createWeb3, getAccounts } from "../../lib/registry.mjs";
import { signWithPrivateKey } from "../../lib/crypto.mjs";

(async () => {
  console.log("\n==========================================");
  console.log("🟦 Step4: 企業が IoT データの真正性を保証する VC を発行");
  console.log("==========================================\n");

  const web3 = new createWeb3();
  const accounts = await getAccounts(web3);
  const company = accounts[1];

  console.log("① Company の Ethereum アドレス:");
  console.log(`   → ${company}\n`);

  // --- 入力データ ---
  const cid = fs.readFileSync("demo/output/ipfs_cid.txt", "utf8").trim();
  const didUserA = JSON.parse(fs.readFileSync("demo/output/userA_did.json")).id;
  const didCompany = JSON.parse(fs.readFileSync("demo/output/company_did.json")).id;

  console.log("② VC に埋め込む情報を確認:");
  console.log(`   CID        → ${cid}`);
  console.log(`   User DID   → ${didUserA}`);
  console.log(`   Company DID→ ${didCompany}\n`);

  // --- VC を作成 ---
  console.log("③ VC オブジェクトを生成中...\n");
  const vc = {
    id: "vc:device-auth:userA",
    issuer: didCompany,
    subject: didUserA,
    claim: {
      cid: cid,
      verifiedByDevice: "company-original"
    },
    proof: {}
  };

  // --- VC に署名 ---
  console.log("④ VC 内容に対して Company が署名を付与...\n");
  const { signature, messageHash } = await signWithPrivateKey(company, vc);

  vc.proof = {
    type: "EcdsaSecp256k1",
    created: new Date().toISOString(),
    verificationMethod: `${didCompany}#key-1`,
    hash: messageHash,
    signature: signature
  };

  // 保存
  fs.writeFileSync("demo/output/vc_device_auth.json", JSON.stringify(vc, null, 2));

  console.log("⑤ VC の発行が完了しました！");
  console.log("   以下が企業によって発行された VC の内容です：\n");
  console.log("===== 🔍 発行された VC の内容 =====");
  console.log(JSON.stringify(vc, null, 2));
  console.log("==================================\n");

  console.log("🎉 Step4 完了: VC 発行成功\n");
})();
