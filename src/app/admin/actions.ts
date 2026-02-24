"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { InquiryRow, MockupImageRow } from "@/types/mockup";

const ADMIN_COOKIE = "admin_secret";
const BUCKET = "mockup-layers";

async function getAdminCookie() {
  const store = await cookies();
  return store.get(ADMIN_COOKIE)?.value;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || password !== secret) return false;
  const store = await cookies();
  store.set(ADMIN_COOKIE, secret, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });
  return true;
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookie = await getAdminCookie();
  return cookie === process.env.ADMIN_SECRET;
}

export async function getInquiries(): Promise<InquiryRow[]> {
  if ((await isAdminAuthenticated()) !== true) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data as InquiryRow[]) ?? [];
}

export async function getMockupImages(): Promise<MockupImageRow[]> {
  if ((await isAdminAuthenticated()) !== true) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("mockup_images")
    .select("*")
    .order("layer_key");
  if (error) return [];
  return (data as MockupImageRow[]) ?? [];
}

export async function updateInquiryStatus(
  id: string,
  status: "pending" | "contacted" | "done",
  adminMemo?: string
) {
  if ((await isAdminAuthenticated()) !== true) return { error: "Unauthorized" };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("inquiries")
    .update({
      status,
      ...(adminMemo !== undefined && { admin_memo: adminMemo }),
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function uploadMockupImage(
  layerKey: string,
  label: string | null,
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  if ((await isAdminAuthenticated()) !== true) {
    return { error: "Unauthorized" };
  }
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "파일이 없습니다." };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() || "png";
  const path = `${layerKey}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  const { error: dbError } = await supabase.from("mockup_images").upsert(
    {
      layer_key: layerKey,
      image_url: publicUrl,
      label: label || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "layer_key" }
  );

  if (dbError) return { error: dbError.message };
  return { url: publicUrl };
}

const MEMO_BUCKET = "memo-images";

export async function createCaseStudy(title: string): Promise<{ error?: string; id?: string }> {
  if ((await isAdminAuthenticated()) !== true) return { error: "Unauthorized" };
  if (!title?.trim()) return { error: "제목을 입력하세요." };
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("case_studies")
    .insert({ title: title.trim() })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data.id };
}

export async function uploadCaseStudyPhoto(
  caseStudyId: string,
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  if ((await isAdminAuthenticated()) !== true) return { error: "Unauthorized" };
  const file = formData.get("file") as File | null;
  if (!file?.size) return { error: "파일이 없습니다." };
  const supabase = createAdminClient();
  const ext = file.name.split(".").pop() || "png";
  const path = `case_studies/${caseStudyId}/${Date.now()}.${ext}`;
  const { error: uploadError } = await supabase.storage
    .from(MEMO_BUCKET)
    .upload(path, file, { upsert: true });
  if (uploadError) return { error: uploadError.message };
  const { data: { publicUrl } } = supabase.storage.from(MEMO_BUCKET).getPublicUrl(path);
  const { data: photos } = await supabase
    .from("case_study_photos")
    .select("sort_order")
    .eq("case_study_id", caseStudyId)
    .order("sort_order", { ascending: false })
    .limit(1);
  const sortOrder = (photos?.[0]?.sort_order ?? -1) + 1;
  const { error: dbError } = await supabase.from("case_study_photos").insert({
    case_study_id: caseStudyId,
    image_url: publicUrl,
    sort_order: sortOrder,
  });
  if (dbError) return { error: dbError.message };
  return { url: publicUrl };
}

export async function getCaseStudies(): Promise<{ id: string; title: string; created_at: string }[]> {
  if ((await isAdminAuthenticated()) !== true) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("case_studies")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as { id: string; title: string; created_at: string }[];
}

export async function getInquiryBoardPostsAdmin(): Promise<
  { id: string; title: string; author_name: string; contact: string; created_at: string }[]
> {
  if ((await isAdminAuthenticated()) !== true) return [];
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("inquiry_board_posts")
    .select("id, title, author_name, contact, created_at")
    .order("created_at", { ascending: false });
  if (error) return [];
  return (data ?? []) as { id: string; title: string; author_name: string; contact: string; created_at: string }[];
}
