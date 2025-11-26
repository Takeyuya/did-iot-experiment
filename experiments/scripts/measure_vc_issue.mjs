// experiments/scripts/measure_vc_issue.mjs

import fs from "fs"; // 使わないが、他と揃えるなら残してもOK（不要なら削除してよい）
import {
  createWeb3,
  getAccounts
} from "../../lib/registry.mjs";
import {
  makeMetricsFilename,
  appendCsvLine,
  measureMs
} from "../../lib/metrics.mjs";
import { signWithPrivateKey } from "../../lib/crypto.mjs";

(async () => {
  console.log("\n====================================================");
  console.log("📊 VC 発行（署名付与）遅延計測: 20回ループ");
  console.log("====================================================\n");

  const outDir = "experiments/output/raw";
  fs.mkdirSync(outDir, { recursive: true });

  const csvName = makeMetricsFilename("vc_issue");
  const csvPath = `${outDir}/${csvName}`;

  appendCsvLine(csvPath, ["run", "duration_ms", "signature"]);

  // Web3 & アカウント
  const web3 = createWeb3();
  const accounts = await getAccounts(web3);

  const company = accounts[1];
  const userA = accounts[0];

  console.log("① Company アドレス:", company);
  console.log("   UserA アドレス:", userA, "\n");

  const didUserA = "did:example:metrics-userA";
  const didCompany = "did:example:metrics-company";
  const cidForMetrics = "cid:metrics-dummy-1";

  console.log("② 計測用 DID / CID:");
  console.log("   → UserA DID   :", didUserA);
  console.log("   → Company DID :", didCompany);
  console.log("   → CID         :", cidForMetrics, "\n");

  const LOOP = 20;
  let totalMs = 0;

  for (let i = 1; i <= LOOP; i++) {
    console.log(`③ [${i}/${LOOP}] VC生成＋署名開始...`);

    const vc = {
      id: "vc:device-auth:userA:metrics",
      issuer: didCompany,
      subject: didUserA,
      claim: {
        cid: cidForMetrics,
        verifiedByDevice: "company-original"
      },
      proof: {}
    };

    const { result: signed, durationMs } = await measureMs(async () => {
      return await signWithPrivateKey(company, vc);
    });

    totalMs += durationMs;

    console.log(`   → signature: ${signed.signature}`);
    console.log(`   → duration : ${durationMs.toFixed(2)} ms\n`);

    appendCsvLine(csvPath, [
      i,
      durationMs.toFixed(3),
      signed.signature
    ]);
  }

  const avg = totalMs / LOOP;

  console.log("====================================================");
  console.log("🎉 VC 発行（署名処理）計測 完了");
  console.log("📄 出力先:", csvPath);
  console.log(`📈 平均 duration: ${avg.toFixed(2)} ms (${LOOP}回平均)`);
  console.log("====================================================\n");
})();
