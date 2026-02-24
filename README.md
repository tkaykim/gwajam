# 단체복 목업 생성 웹사이트

모바일 최적화 단체복(야구점퍼) 목업 생성 및 제작 문의 수집 사이트입니다.

## 폴더 구조 (한 단계로 정리됨)

- **프로젝트 루트** = 이 폴더 (`package.json`, `src/`, `next.config.mjs` 등이 여기 있음)
- `npm run dev`는 **이 폴더에서** 실행하세요.
- 예전에 `modoogwajam` 안에 또 `modoogwajam`이 있던 구조였다면, 이제 **루트에 `src/app`이 있으므로** 그 안쪽 `modoogwajam` 폴더는 지워도 됩니다. (필요한 소스는 이미 루트로 복사됨)

## 실행

```bash
npm install
npm run dev
```

- 메인: http://localhost:3000
- 관리자: http://localhost:3000/admin

## 환경 변수

`.env.example`을 복사해 `.env.local`을 만들고 Supabase URL/키, `ADMIN_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`를 설정하세요.

자세한 설정·기능 설명은 `modoogwajam/README.md`(또는 이전 문서)를 참고하세요.
