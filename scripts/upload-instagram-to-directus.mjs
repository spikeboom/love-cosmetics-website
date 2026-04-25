#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DIRECTUS_URL = "https://directus.lovecosmeticos.xyz";
const DIRECTUS_TOKEN = "love-directus-api-token-2025-static";
const COLLECTION = "instagram_posts";

const posts = JSON.parse(
  fs.readFileSync(path.join(__dirname, "instagram-media-urls.json"), "utf8")
);

async function downloadBuffer(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      Referer: "https://www.instagram.com/",
    },
  });
  if (!res.ok) {
    throw new Error(`Download falhou ${res.status}: ${url.slice(0, 80)}...`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") || "application/octet-stream";
  return { buf, contentType };
}

async function uploadToDirectus(buffer, filename, contentType) {
  const form = new FormData();
  const blob = new Blob([buffer], { type: contentType });
  form.append("file", blob, filename);

  const res = await fetch(`${DIRECTUS_URL}/files`, {
    method: "POST",
    headers: { Authorization: `Bearer ${DIRECTUS_TOKEN}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload Directus falhou ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data.id;
}

async function createItem(fields) {
  const res = await fetch(`${DIRECTUS_URL}/items/${COLLECTION}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${DIRECTUS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fields),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Create item falhou ${res.status}: ${text.slice(0, 200)}`);
  }
  const json = await res.json();
  return json.data;
}

async function main() {
  const results = [];
  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    console.log(`\n[${i + 1}/${posts.length}] ${post.shortcode} (${post.tipo})`);

    try {
      console.log("  baixando thumbnail...");
      const thumb = await downloadBuffer(post.thumbnail);
      console.log(`  thumb ${(thumb.buf.length / 1024).toFixed(1)} KB, ${thumb.contentType}`);

      console.log("  upload thumb pro Directus...");
      const thumbId = await uploadToDirectus(
        thumb.buf,
        `ig-${post.shortcode}-thumb.jpg`,
        thumb.contentType
      );
      console.log(`  thumb id: ${thumbId}`);

      let videoId = null;
      if (post.video) {
        console.log("  baixando video...");
        const vid = await downloadBuffer(post.video);
        console.log(`  video ${(vid.buf.length / 1024 / 1024).toFixed(2)} MB, ${vid.contentType}`);

        console.log("  upload video pro Directus...");
        videoId = await uploadToDirectus(
          vid.buf,
          `ig-${post.shortcode}.mp4`,
          vid.contentType
        );
        console.log(`  video id: ${videoId}`);
      }

      console.log("  criando item na collection...");
      const item = await createItem({
        status: "published",
        sort: i + 1,
        instagram_url: post.url,
        tipo: post.tipo,
        video: videoId,
        thumbnail: thumbId,
      });
      console.log(`  item criado id=${item.id}`);

      results.push({ shortcode: post.shortcode, itemId: item.id, thumbId, videoId });
    } catch (err) {
      console.error(`  ERRO em ${post.shortcode}:`, err.message);
      results.push({ shortcode: post.shortcode, error: err.message });
    }
  }

  console.log("\n\n=== RESULTADO FINAL ===");
  console.log(JSON.stringify(results, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
