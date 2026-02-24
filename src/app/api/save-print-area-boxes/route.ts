import { NextRequest, NextResponse } from "next/server";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";

const PRINT_AREA_KEYS = [
  "front_left_chest",
  "front_right_chest",
  "front_left_sleeve",
  "front_right_sleeve",
  "back_top",
  "back_top2",
  "back_mid",
  "back_bottom",
] as const;

type Box = { left: number; top: number; width: number; height: number };

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "개발 환경에서만 사용 가능합니다." }, { status: 403 });
  }
  try {
    const body = await request.json();
    const boxes = body.boxes as Record<string, Box> | undefined;
    if (!boxes || typeof boxes !== "object") {
      return NextResponse.json({ error: "boxes 객체가 필요합니다." }, { status: 400 });
    }

    const filePath = join(process.cwd(), "src", "components", "mockup", "LayerPreview.tsx");
    let content = readFileSync(filePath, "utf-8");

    const lines: string[] = [];
    for (const key of PRINT_AREA_KEYS) {
      const b = boxes[key];
      if (!b) continue;
      const left = Math.round(b.left);
      const top = Math.round(b.top);
      const width = Math.round(b.width);
      const height = Math.round(b.height);
      lines.push(`  ${key}: { left: "${left}%", top: "${top}%", width: "${width}%", height: "${height}%" },`);
    }
    if (lines.length === 0) {
      return NextResponse.json({ error: "유효한 영역 데이터가 없습니다." }, { status: 400 });
    }

    const newBlock = [
      "/** 인쇄 영역별 캔버스 내 상대 위치 (%, 점선 테두리용). 사용자 입장 왼/오른 = 의류 거울모드이므로 반대로 매핑 */",
      "const PRINT_AREA_BOXES: Record<string, { left: string; top: string; width: string; height: string }> = {",
      ...lines,
      "};",
    ].join("\n");

    const startMarker = "/** 인쇄 영역별 캔버스 내 상대 위치";
    const startIdx = content.indexOf(startMarker);
    if (startIdx === -1) {
      return NextResponse.json({ error: "PRINT_AREA_BOXES 주석을 찾을 수 없습니다." }, { status: 500 });
    }
    const afterStart = content.slice(startIdx);
    const endRel = afterStart.indexOf("\n};");
    if (endRel === -1) {
      return NextResponse.json({ error: "PRINT_AREA_BOXES 끝을 찾을 수 없습니다." }, { status: 500 });
    }
    const endIdx = startIdx + endRel + 3; // include "\n};"
    content = content.slice(0, startIdx) + newBlock + content.slice(endIdx);

    writeFileSync(filePath, content, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "저장 실패" },
      { status: 500 }
    );
  }
}
