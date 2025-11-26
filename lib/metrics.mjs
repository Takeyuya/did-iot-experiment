// lib/metrics.mjs
import fs from "fs";
import { performance } from "node:perf_hooks";

// ファイル名生成: prefix_YYYY-MM-DD_HH-mm.csv
export function makeMetricsFilename(prefix) {
  const now = new Date();
  const y = now.getFullYear();
  const M = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  return `${prefix}_${y}-${M}-${d}_${h}-${m}.csv`;
}

export function appendCsvLine(path, rowArray) {
  const line = rowArray.join(",") + "\n";
  fs.appendFileSync(path, line);
}

// ms計測
export async function measureMs(fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, durationMs: end - start };
}

// μs計測
export async function measureUs(fn) {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, durationUs: (end - start) * 1000 };
}
