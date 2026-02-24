/**
 * 온보딩 이미지를 Supabase Storage 버킷(public)에 업로드합니다.
 *
 * 1) 프로젝트 루트에서 실행 ( .env.local 에 NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요 ):
 *    npm run upload-onboarding
 *
 * 2) 업로드 후 앱의 온보딩 이미지는 자동으로 Supabase URL 로 로드됩니다.
 *    (NEXT_PUBLIC_SUPABASE_URL 이 있으면 storage/v1/object/public/onboarding/stepN.png 사용)
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

// .env.local 로드
try {
  const envPath = join(root, ".env.local");
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf8");
    content.split("\n").forEach((line) => {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    });
  }
} catch (_) {}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY 필요 (.env.local)");
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

const BUCKET = "onboarding";

async function main() {
  const { data: buckets } = await supabase.storage.listBuckets();
  if (!buckets?.some((b) => b.name === BUCKET)) {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error) {
      console.error("버킷 생성 실패:", error.message);
      process.exit(1);
    }
    console.log("버킷 생성됨:", BUCKET);
  }

  const results = [];
  for (let i = 1; i <= 4; i++) {
    const name = `step${i}.png`;
    const path = join(root, "public", "onboarding", name);
    if (!existsSync(path)) {
      console.error("파일 없음:", path);
      process.exit(1);
    }
    const body = readFileSync(path);
    const { error } = await supabase.storage.from(BUCKET).upload(name, body, {
      contentType: "image/png",
      upsert: true,
    });
    if (error) {
      console.error(name, "업로드 실패:", error.message);
      process.exit(1);
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
    results.push({ step: i, url: data.publicUrl });
    console.log(`STEP ${i}: ${data.publicUrl}`);
  }

  console.log("\n업로드 완료. 앱에서 NEXT_PUBLIC_SUPABASE_URL 이 설정되어 있으면 위 URL 로 이미지가 로드됩니다.");
}

main();
