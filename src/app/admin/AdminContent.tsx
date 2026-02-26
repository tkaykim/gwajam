"use client";

import { useEffect, useState } from "react";
import {
  getInquiries,
  adminLogout,
  updateInquiryStatus,
  getCaseStudies,
  createCaseStudy,
  uploadCaseStudyPhoto,
  getInquiryBoardPostsAdmin,
  getMockupImages,
} from "./actions";
import type { InquiryRow, MockupImageRow } from "@/types/mockup";
import { UploadMockupForm } from "./UploadMockupForm";
import { AdminInquiryDetail } from "./AdminInquiryDetail";

type MainTab = "mockup" | "inquiry";
type InquirySubTab = "inquiries" | "board" | "cases";

export function AdminContent() {
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [mainTab, setMainTab] = useState<MainTab>("inquiry");
  const [inquirySubTab, setInquirySubTab] = useState<InquirySubTab>("inquiries");
  const [caseStudies, setCaseStudies] = useState<{ id: string; title: string; created_at: string }[]>([]);
  const [newCaseTitle, setNewCaseTitle] = useState("");
  const [caseStudyCreating, setCaseStudyCreating] = useState(false);
  const [boardPosts, setBoardPosts] = useState<
    { id: string; title: string; author_name: string; contact: string; created_at: string }[]
  >([]);
  const [mockupImages, setMockupImages] = useState<MockupImageRow[]>([]);

  async function loadInquiries() {
    setLoading(true);
    const data = await getInquiries();
    setInquiries(data);
    setLoading(false);
  }

  useEffect(() => {
    if (mainTab === "inquiry" && inquirySubTab === "inquiries") {
      loadInquiries();
      getMockupImages().then(setMockupImages);
    }
  }, [mainTab, inquirySubTab]);

  useEffect(() => {
    if (mainTab === "inquiry" && inquirySubTab === "cases") {
      getCaseStudies().then(setCaseStudies);
    }
  }, [mainTab, inquirySubTab]);

  useEffect(() => {
    if (mainTab === "inquiry" && inquirySubTab === "board") {
      getInquiryBoardPostsAdmin().then(setBoardPosts);
    }
  }, [mainTab, inquirySubTab]);

  async function handleLogout() {
    await adminLogout();
    window.location.reload();
  }

  async function handleCreateCaseStudy(e: React.FormEvent) {
    e.preventDefault();
    if (!newCaseTitle.trim()) return;
    setCaseStudyCreating(true);
    const res = await createCaseStudy(newCaseTitle.trim());
    setCaseStudyCreating(false);
    if (res.error) alert(res.error);
    else if (res.id) {
      setNewCaseTitle("");
      setCaseStudies(await getCaseStudies());
    }
  }

  async function handleCasePhotoUpload(caseStudyId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const form = new FormData();
    form.set("file", file);
    const res = await uploadCaseStudyPhoto(caseStudyId, form);
    if (res.error) alert(res.error);
    else setCaseStudies(await getCaseStudies());
    e.target.value = "";
  }

  async function handleStatusChange(id: string, status: "pending" | "contacted" | "done") {
    await updateInquiryStatus(id, status);
    loadInquiries();
  }

  async function handleAdminMemoChange(id: string, adminMemo: string) {
    const row = inquiries.find((r) => r.id === id);
    if (!row) return;
    await updateInquiryStatus(id, row.status, adminMemo);
    loadInquiries();
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <header className="flex items-center justify-between py-4 border-b border-white/10">
        <h1 className="text-xl font-bold text-white">관리자</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-white/60 hover:text-white"
        >
          로그아웃
        </button>
      </header>

      {/* 상단: 목업관리 | 문의 관리 */}
      <div className="flex gap-2 py-4 border-b border-white/10">
        <button
          type="button"
          onClick={() => setMainTab("mockup")}
          className={`px-4 py-2 rounded-lg font-medium ${
            mainTab === "mockup" ? "bg-accent text-white" : "bg-white/10 text-white/80"
          }`}
        >
          목업관리
        </button>
        <button
          type="button"
          onClick={() => setMainTab("inquiry")}
          className={`px-4 py-2 rounded-lg font-medium ${
            mainTab === "inquiry" ? "bg-accent text-white" : "bg-white/10 text-white/80"
          }`}
        >
          문의 관리
        </button>
      </div>

      {/* 목업관리: 레이어 이미지 업로드 */}
      {mainTab === "mockup" && <UploadMockupForm />}

      {/* 문의 관리: 서브탭 */}
      {mainTab === "inquiry" && (
        <>
          <div className="flex flex-wrap gap-2 py-3">
            <button
              type="button"
              onClick={() => setInquirySubTab("inquiries")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                inquirySubTab === "inquiries" ? "bg-white/25 text-white" : "bg-white/10 text-white/80"
              }`}
            >
              제작 문의
            </button>
            <button
              type="button"
              onClick={() => setInquirySubTab("board")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                inquirySubTab === "board" ? "bg-white/25 text-white" : "bg-white/10 text-white/80"
              }`}
            >
              일반 문의게시판
            </button>
            <button
              type="button"
              onClick={() => setInquirySubTab("cases")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                inquirySubTab === "cases" ? "bg-white/25 text-white" : "bg-white/10 text-white/80"
              }`}
            >
              제작사례 관리
            </button>
          </div>

          {/* 제작 문의: 단체복 목업 문의 목록 */}
          {inquirySubTab === "inquiries" && (
            <div className="space-y-4">
              {loading ? (
                <p className="text-white/60">로딩 중…</p>
              ) : inquiries.length === 0 ? (
                <p className="text-white/60">제작 문의가 없습니다.</p>
              ) : (
                <ul className="space-y-4">
                  {inquiries.map((row) => (
                    <li
                      key={row.id}
                      className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="font-medium text-white">{row.group_name}</p>
                          <p className="text-sm text-white/60">
                            {row.representative_name} · {row.contact}
                          </p>
                          <p className="text-xs text-white/50 mt-1">
                            {new Date(row.created_at).toLocaleString("ko-KR")}
                          </p>
                        </div>
                        <select
                          value={row.status}
                          onChange={(e) =>
                            handleStatusChange(row.id, e.target.value as "pending" | "contacted" | "done")
                          }
                          className="text-sm rounded-lg bg-white/10 border border-white/20 px-2 py-1"
                        >
                          <option value="pending">대기</option>
                          <option value="contacted">연락함</option>
                          <option value="done">완료</option>
                        </select>
                      </div>
                      <p className="text-sm text-white/80">
                        제작 수량: <strong>{row.quantity}</strong>벌
                      </p>
                      <details className="text-sm text-white/70">
                        <summary className="cursor-pointer py-2">상세 보기</summary>
                        <AdminInquiryDetail
                          row={row}
                          images={mockupImages}
                          onStatusChange={handleStatusChange}
                          onAdminMemoChange={handleAdminMemoChange}
                        />
                      </details>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 일반 문의게시판 */}
          {inquirySubTab === "board" && (
            <div className="space-y-3">
              <p className="text-white/60 text-sm">
                글을 클릭하면 상세 페이지에서 관리자 답변을 달 수 있습니다.
              </p>
              {boardPosts.length === 0 ? (
                <p className="text-white/60">등록된 글이 없습니다.</p>
              ) : (
                <ul className="space-y-2">
                  {boardPosts.map((p) => (
                    <li key={p.id}>
                      <a
                        href={`/inquiry-board/${p.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/10"
                      >
                        <p className="font-medium text-white">{p.title}</p>
                        <p className="text-sm text-white/60">
                          {p.author_name} · {p.contact}
                        </p>
                        <p className="text-xs text-white/50 mt-1">
                          {new Date(p.created_at).toLocaleString("ko-KR")}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 제작사례 관리 */}
          {inquirySubTab === "cases" && (
            <div className="space-y-4">
              <form onSubmit={handleCreateCaseStudy} className="flex gap-2">
                <input
                  type="text"
                  value={newCaseTitle}
                  onChange={(e) => setNewCaseTitle(e.target.value)}
                  placeholder="제작사례 제목"
                  className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder:text-white/50"
                />
                <button
                  type="submit"
                  disabled={caseStudyCreating}
                  className="rounded-lg bg-white/20 px-4 py-2 text-white hover:bg-white/30"
                >
                  {caseStudyCreating ? "등록 중…" : "추가"}
                </button>
              </form>
              <ul className="space-y-3">
                {caseStudies.map((cs) => (
                  <li key={cs.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <p className="font-medium text-white">{cs.title}</p>
                    <p className="text-xs text-white/50 mt-1">
                      {new Date(cs.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    <label className="mt-2 inline-block">
                      <span className="cursor-pointer rounded bg-white/20 px-2 py-1 text-xs text-white">
                        사진 추가
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleCasePhotoUpload(cs.id, e)}
                      />
                    </label>
                  </li>
                ))}
              </ul>
              {caseStudies.length === 0 && (
                <p className="text-white/60 text-sm">제작사례를 추가한 뒤 사진을 올려주세요.</p>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
