// experiments/scripts/measure_ipfs_upload.mjs

import fs from "fs";
import { connectIPFS, uploadFile } from "../../lib/ipfs_client.mjs";
import { makeMetricsFilename, appendCsvLine, measureMs } from "../../lib/metrics.mjs";

(async () => {
  console.log("\n===============================================");
  console.log("📊 IPFS アップロード計測: 20回ループ");
  console.log("===============================================\n");

  const outDir = "experiments/output/raw";
  fs.mkdirSync(outDir, { recursive: true });

  const csvName = makeMetricsFilename("ipfs_upload");
  const csvPath = `${outDir}/${csvName}`;

  // ヘッダ
  appendCsvLine(csvPath, ["run", "bytes", "duration_ms", "throughput_MBps", "cid"]);

  // IPFS接続
  console.log("① IPFS ノードへ接続中...");
  const ipfs = connectIPFS();
  console.log("   → 接続成功\n");

  const targetFile = "experiments/data/iot-data.json";
  const fileBuf = fs.readFileSync(targetFile);
  const bytes = fileBuf.length;

  console.log("② 計測対象ファイル:", targetFile);
  console.log("   サイズ:", bytes, "bytes\n");

  const LOOP = 20;
  let totalMs = 0;

  for (let i = 1; i <= LOOP; i++) {
    console.log(`③ [${i}/${LOOP}] アップロード開始`);

    const { result: cid, durationMs } = await measureMs(async () => {
      return await uploadFile(ipfs, targetFile);
    });

    const throughput = (bytes / 1024 / 1024) / (durationMs / 1000); // MB/s
    totalMs += durationMs;

    console.log(`   → CID       : ${cid}`);
    console.log(`   → duration  : ${durationMs.toFixed(2)} ms`);
    console.log(`   → throughput: ${throughput.toFixed(3)} MB/s\n`);

    appendCsvLine(csvPath, [
      i,
      bytes,
      durationMs.toFixed(3),
      throughput.toFixed(6),
      cid
    ]);
  }

  const avg = totalMs / LOOP;

  console.log("===============================================");
  console.log("🎉 IPFS アップロード計測 完了");
  console.log("📄 保存先:", csvPath);
  console.log(`📈 平均 duration: ${avg.toFixed(2)} ms (${LOOP}回平均)`);
  console.log("===============================================\n");
})();
