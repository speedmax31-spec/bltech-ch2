// api/inventory.js — 재고 입출고 내역 (Vercel 서버리스 → Supabase)
//   GET  /api/inventory?scope=fin           → 최근 거래내역 목록 (현재고는 클라이언트가 합산)
//   POST /api/inventory  {scope,code,kind,qty,who,note}  → 입출고 1건 추가
// 비밀키는 Vercel 환경변수에만: SUPABASE_URL, SUPABASE_SERVICE_KEY
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_KEY;

module.exports = async function handler(req, res) {
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return res.status(503).json({ error: 'DB 미설정', need: ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY'] });
  }
  const base = `${SUPABASE_URL}/rest/v1/inventory_tx`;
  const headers = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json' };

  try {
    if (req.method === 'GET') {
      const scope = (req.query && req.query.scope) || 'fin';
      const r = await fetch(`${base}?scope=eq.${encodeURIComponent(scope)}&select=*&order=id.desc&limit=5000`, { headers });
      if (!r.ok) return res.status(502).json({ error: await r.text() });
      return res.status(200).json({ tx: await r.json() });
    }

    if (req.method === 'POST') {
      const b = (req.body && typeof req.body === 'object') ? req.body : JSON.parse(req.body || '{}');
      const qty = Math.abs(parseInt(b.qty, 10) || 0);
      if (!b.code || !['in', 'out'].includes(b.kind) || qty <= 0) {
        return res.status(400).json({ error: '입력 오류 (code/kind(in|out)/qty 필요)' });
      }
      const row = [{ scope: b.scope === 'raw' ? 'raw' : 'fin', code: String(b.code), kind: b.kind, qty,
                     who: (b.who || '').slice(0, 40), note: (b.note || '').slice(0, 200) }];
      const r = await fetch(base, {
        method: 'POST',
        headers: { ...headers, Prefer: 'return=representation' },
        body: JSON.stringify(row),
      });
      if (!r.ok) return res.status(502).json({ error: await r.text() });
      const saved = await r.json();
      return res.status(200).json({ ok: true, tx: saved[0] || null });
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
