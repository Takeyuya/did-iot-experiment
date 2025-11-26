// experiments/scripts/measure_chain_write.mjs

import fs from "fs";
import {
  createWeb3,
  getAccounts,
  getRegistryContract,
  registerIoTData
} from "../../lib/registry.mjs";
import {
  makeMetricsFilename,
  appendCsvLine,
  measureMs
} from "../../lib/metrics.mjs";

(async () => {
  console.log("\n====================================================");
  console.log("📊 チェーン書き込み遅延計測: registerIoTData を20回実行");
  console.log("====================================================\n");

  const outDir = "experiments/output/raw";
  fs.mkdirSync(outDir, { recursive: true });

  const csvName = makeMetricsFilename("chain_write");
  const csvPath = `${outDir}/${csvName}`;

  appendCsvLine(csvPath, ["run", "duration_ms", "tx_hash", "gas_used"]);

  // Web3 & コントラクト
  const web3 = createWeb3();
  const accounts = await getAccounts(web3);
  const registry = await getRegistryContract(web3);

  const userA = accounts[0];
  console.log("① UserA アドレス:", userA, "\n");

  // 計測用の固定 DID / CID
  const didForMetrics = "did:example:metrics-userA";
  const cidForMetrics = "cid:metrics-dummy-1";

  console.log("② 計測用 DID / CID:");
  console.log("   → DID:", didForMetrics);
  console.log("   → CID:", cidForMetrics, "\n");

  const LOOP = 20;
  let totalMs = 0;

  for (let i = 1; i <= LOOP; i++) {
    console.log(`③ [${i}/${LOOP}] トランザクション送信開始...`);

    const { result: receipt, durationMs } = await measureMs(async () => {
      return await registerIoTData(registry, userA, didForMetrics, cidForMetrics);
    });

    totalMs += durationMs;

    const txHash = receipt.transactionHash;
    const gasUsed = receipt.gasUsed;

    console.log(`   → txHash  : ${txHash}`);
    console.log(`   → gasUsed : ${gasUsed}`);
    console.log(`   → duration: ${durationMs.toFixed(2)} ms\n`);

    appendCsvLine(csvPath, [
      i,
      durationMs.toFixed(3),
      txHash,
      gasUsed
    ]);
  }

  const avg = totalMs / LOOP;

  console.log("====================================================");
  console.log("🎉 チェーン書き込み遅延計測 完了");
  console.log("📄 保存先:", csvPath);
  console.log(`📈 平均 duration: ${avg.toFixed(2)} ms (${LOOP}回平均)`);
  console.log("====================================================\n");
})();
