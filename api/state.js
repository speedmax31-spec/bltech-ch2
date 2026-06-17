// api/state.js — 공유 보드 상태 읽기/쓰기 (Vercel 서버리스 함수 → Supabase)
// 비밀키는 Vercel 환경변수에만 둡니다 (코드/깃에 없음):
//   SUPABASE_URL          예) https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY  Supabase service_role 키 (절대 공개 금지)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;
const ROW_ID = 'main';

export default async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(500).json({ error: '서버 환경변수 미설정 (SUPABASE_URL / SUPABASE_SERVICE_KEY)' });
  }
  const base = `${SUPABASE_URL}/rest/v1/app_state`;
  const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const r = await fetch(`${base}?id=eq.${ROW_ID}&select=data,updated_at`, { headers });
      if (!r.ok) return res.status(502).json({ error: await r.text() });
      const rows = await r.json();
      return res.status(200).json(rows[0] || null);
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      const body = (req.body && typeof req.body === 'object') ? req.body : JSON.parse(req.body || '{}');
      const payload = [{ id: ROW_ID, data: body, updated_at: new Date().toISOString() }];
      const r = await fetch(base, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=minimal' },
        body: JSON.stringify(payload),
      });
      if (!r.ok) return res.status(502).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}
