import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata = {
  title: "제작사례 | 단체복 목업",
  description: "관리자가 등록한 제작 사례를 확인하세요.",
};

interface CaseStudyPhotoRow {
  id: string;
  case_study_id: string;
  image_url: string;
  sort_order: number;
}

interface CaseStudyRow {
  id: string;
  title: string;
  created_at: string;
  photos?: CaseStudyPhotoRow[];
}

export default async function CasesPage() {
  const supabase = await createServerSupabaseClient();

  const { data: studies } = await supabase
    .from("case_studies")
    .select("id, title, created_at")
    .order("created_at", { ascending: false });

  if (!studies?.length) {
    return (
      <main className="min-h-dvh bg-background">
        <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
          <Link href="/" className="text-lg font-bold text-foreground">
            ← 제작사례
          </Link>
        </header>
        <div className="p-4">
          <p className="text-muted-foreground text-sm">등록된 제작 사례가 없습니다.</p>
        </div>
      </main>
    );
  }

  const { data: allPhotos } = await supabase
    .from("case_study_photos")
    .select("id, case_study_id, image_url, sort_order")
    .order("sort_order", { ascending: true });

  const photosByStudy = (allPhotos || []).reduce(
    (acc, p) => {
      if (!acc[p.case_study_id]) acc[p.case_study_id] = [];
      acc[p.case_study_id].push(p);
      return acc;
    },
    {} as Record<string, CaseStudyPhotoRow[]>
  );

  return (
    <main className="min-h-dvh bg-background pb-24">
      <header className="sticky top-0 z-10 border-b border-border bg-background/98 px-4 py-3">
        <Link href="/" className="text-lg font-bold text-foreground">
          ← 제작사례
        </Link>
      </header>
      <div className="p-4 space-y-6">
        <h1 className="text-xl font-bold text-foreground">제작사례</h1>
        <ul className="space-y-6">
          {(studies as CaseStudyRow[]).map((study) => {
            const photos = photosByStudy[study.id] || [];
            return (
              <li key={study.id} className="rounded-2xl border border-border bg-card overflow-hidden">
                <h2 className="px-4 py-3 font-semibold text-foreground">{study.title}</h2>
                {photos.length > 0 ? (
                  <div className="flex gap-2 overflow-x-auto p-4 pt-0">
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        className="h-48 w-48 shrink-0 overflow-hidden rounded-xl bg-muted"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
