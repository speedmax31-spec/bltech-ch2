# 공유 DB 설정 가이드 (Supabase + Vercel)

목표: 모든 팀원이 **같은 실시간 데이터**(할 일·발주서·재고·알림·KPI)를 보게 합니다.
참조 데이터(품목코드·BOM·내수재고)는 코드에 그대로 두고 월 1회 엑셀로 갱신합니다.

비밀키는 **Vercel 환경변수에만** 저장합니다 — 코드·깃에는 절대 들어가지 않습니다.

---

## 차훈님이 할 일 (1회, 약 10분)

### 1) Supabase 프로젝트 만들기
1. https://supabase.com 가입 (GitHub 계정으로 가능, 무료)
2. **New project** → 이름 `bltech-board`, DB 비밀번호 아무거나(메모) → Create
3. 1~2분 대기 (프로비저닝)

### 2) 테이블 생성
1. 좌측 **SQL Editor** → **New query**
2. 이 저장소의 `db/schema.sql` 내용을 붙여넣고 **RUN**
3. "Success" 확인

### 3) 키 2개 확인
좌측 **Project Settings → API** 에서:
- **Project URL**  (예: `https://abcd.supabase.co`)
- **service_role** 키 (`Project API keys` 섹션, "service_role" — ⚠️ 비밀, 공개 금지)

### 4) Vercel 환경변수 등록
1. https://vercel.com → 이 프로젝트(bltech-ch2) → **Settings → Environment Variables**
2. 두 개 추가 (Production/Preview/Development 전부 체크):
   - `SUPABASE_URL`         = 위 Project URL
   - `SUPABASE_SERVICE_KEY` = 위 service_role 키
3. Save

### 5) 완료 신호
여기까지 하고 **"DB 준비 됐어"** 라고 알려주세요.
→ 그 다음은 제가 합니다: 앱이 `/api/state`로 읽고/쓰게 수정 + 현재 데이터 이관 + 동작 검증.

---

## 제가 준비해 둔 것 (이미 저장소에 있음)
- `db/schema.sql` — 공유 상태 테이블
- `api/state.js`  — 서버리스 함수 (GET 읽기 / POST 저장), service_role 키는 환경변수로만 사용
