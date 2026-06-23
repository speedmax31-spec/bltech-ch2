-- BL-Tech 통합 보드 · 공유 상태 테이블
-- Supabase SQL Editor 에 그대로 붙여넣고 RUN 하세요.

create table if not exists app_state (
  id          text primary key,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

-- RLS 켬: anon 키로 직접 접근 불가. 서버리스(service_role)만 접근 → 키가 브라우저에 노출 안 됨.
alter table app_state enable row level security;

-- 메인 보드 행 1개 초기화 (비어있으면 생성)
insert into app_state (id, data) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;

-- ── 재고 입출고 내역 (append-only 거래 로그) ──────────────────────────────
-- 현재고 = 기준재고(코드 내장, 월말 엑셀) + 입고합 − 출고합
create table if not exists inventory_tx (
  id          bigserial   primary key,
  scope       text        not null default 'fin',   -- 'fin'(완제품) / 'raw'(원부자재)
  code        text        not null,                 -- 품목코드
  kind        text        not null check (kind in ('in','out')),  -- 입고/출고
  qty         integer     not null check (qty > 0),
  who         text,                                  -- 입력자 이름
  note        text,
  created_at  timestamptz not null default now()
);
create index if not exists inventory_tx_code_idx on inventory_tx (scope, code);
create index if not exists inventory_tx_time_idx on inventory_tx (created_at desc);

alter table inventory_tx enable row level security;  -- 서버리스(service_role)만 접근
