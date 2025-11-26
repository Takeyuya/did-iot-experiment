// experiments/scripts/measure_vc_verify.mjs

import fs from "fs"; // 必須ではないが他と揃えるなら残してOK
import {
  createWeb3,
  getAccounts,
  getRegistryContract,
  registerIoTDocument,
  registerIoTData,
  findDIDDocument,
  findIoTRecord
} from "../../lib/registry.mjs";
import {
  makeMetricsFilename,
  appendCsvLine,
  measureUs
} from "../../lib/metrics.mjs";
import { signWithPrivateKey } from "../../lib/crypto.mjs";

(async () => {
  console.log("\n====================================================");
  console.log("📊 VC 検証遅延（マイクロ秒）計測: 20回ループ");
  console.log("====================================================\n");

  const outDir = "experiments/output/raw";
  fs.mkdirSync(outDir, { recursive: true });

  const csvName = makeMetricsFilename("vc_verify");
  const csvPath = `${outDir}/${csvName}`;

  appendCsvLine(csvPath, ["run", "duration_us", "ok"]);

  // Web3 & Registry
  const web3 = createWeb3();
  const accounts = await getAccounts(web3);
  const registry = await getRegistryContract(web3);

  const userA = accounts[0];
  const company = accounts[1];

  console.log("① DIDRegistry 接続成功");
  console.log("   UserA  :", userA);
  console.log("   Company:", company, "\n");

  const didUserA = "did:example:metrics-userA";
  const didCompany = "did:example:metrics-company";
  const cidForMetrics = "cid:metrics-dummy-1";

  // --- 検証に必要な前準備（1回だけ） ---
  console.log("② 前準備: DID Document と IoTデータ登録、VC生成＋署名");

  const didDocUserA = { id: didUserA, controller: userA };
  const didDocCompany = { id: didCompany, controller: company };

  await registerIoTDocument(registry, userA, didUserA, didDocUserA);
  await registerIoTDocument(registry, company, didCompany, didDocCompany);

  await registerIoTData(registry, userA, didUserA, cidForMetrics);

  // VC生成
  let vc = {
    id: "vc:device-auth:userA:metrics",
    issuer: didCompany,
    subject: didUserA,
    claim: {
      cid: cidForMetrics,
      verifiedByDevice: "company-original"
    },
    proof: {},
    userProof: {}
  };

  // Issuer署名
  const issuerSigned = await signWithPrivateKey(company, vc);
  vc.proof = {
    type: "EcdsaSecp256k1",
    created: new Date().toISOString(),
    verificationMethod: `${didCompany}#key-1`,
    hash: issuerSigned.messageHash,
    signature: issuerSigned.signature
  };

  // UserA署名
  const userSigned = await signWithPrivateKey(userA, vc);
  vc.userProof = {
    type: "EcdsaSecp256k1",
    created: new Date().toISOString(),
    verificationMethod: `${didUserA}#key-1`,
    hash: userSigned.messageHash,
    signature: userSigned.signature
  };

  console.log("   → VC 準備完了\n");

  const issuerDid = vc.issuer;
  const subjectDid = vc.subject;
  const cid = vc.claim.cid;

  const LOOP = 20;
  let totalUs = 0;

  for (let i = 1; i <= LOOP; i++) {
    console.log(`③ [${i}/${LOOP}] VC 検証開始...`);

    const { result: ok, durationUs } = await measureUs(async () => {
      // A. Issuer DID 検索
      const issuerDoc = await findDIDDocument(registry, accounts, issuerDid);
      if (!issuerDoc) return false;

      // B. Subject DID 検索
      const subjectDoc = await findDIDDocument(registry, accounts, subjectDid);
      if (!subjectDoc) return false;

      // C. IoTデータ(DID+CID) 検索
      const iotRecord = await findIoTRecord(registry, accounts, subjectDid, cid);
      if (!iotRecord) return false;

      // D. Issuer署名検証
      const issuerRecovered = web3.eth.accounts.recover(
        vc.proof.hash,
        vc.proof.signature
      );
      if (issuerRecovered.toLowerCase() !== issuerDoc.owner.toLowerCase()) {
        return false;
      }

      // E. UserA署名検証
      const userRecovered = web3.eth.accounts.recover(
        vc.userProof.hash,
        vc.userProof.signature
      );
      if (userRecovered.toLowerCase() !== subjectDoc.owner.toLowerCase()) {
        return false;
      }

      return true;
    });

    totalUs += durationUs;

    console.log(`   → duration: ${durationUs.toFixed(0)} μs`);
    console.log(`   → ok      : ${ok}\n`);

    appendCsvLine(csvPath, [
      i,
      durationUs.toFixed(0),
      ok
    ]);
  }

  const avgUs = totalUs / LOOP;

  console.log("====================================================");
  console.log("🎉 VC 検証遅延計測 完了");
  console.log("📄 出力先:", csvPath);
  console.log(`📈 平均 duration: ${avgUs.toFixed(0)} μs`);
  console.log("====================================================\n");
})();
