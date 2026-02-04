import worker from "../src/worker.mjs";

export default worker.fetch;

export const config = {
  runtime: "edge",
  // 代理服务：Brave Search API
  // Brave Search API 是全球可访问的，没有特定的区域限制。
  // Vercel Edge Network Regions
  // https://vercel.com/docs/edge-network/regions#region-list
  regions: [
    "arn1",
    "bom1",
    "cdg1",
    "cle1",
    "cpt1",
    "dub1",
    "fra1",
    "gru1",
    // 可以根据需求取消对某个区域的注释，例如希望节点更靠近亚洲用户：
    // "hkg1",
    "hnd1",
    "iad1",
    "icn1",
    "kix1",
    "pdx1",
    "sfo1",
    "sin1",
    "syd1",
  ],
};
