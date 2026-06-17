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
