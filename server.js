import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '25mb' }));
app.use(express.static(__dirname));

const KEY = process.env.CARDGRADER_API_KEY || 'cgk_nbYNQ8FxFyBkwHCnMINbM4YuhUn0FKKWD0JME0YJ';
const BASE = 'https://cardgrader.ai/v1';

function dataURLtoBlob(d) {
  const comma = d.indexOf(',');
  const meta = d.slice(0, comma);
  const b64 = d.slice(comma + 1);
  const mime = (meta.match(/data:(.*?);/) || [])[1] || 'image/jpeg';
  return new Blob([Buffer.from(b64, 'base64')], { type: mime });
}

// Route a front+back card photo through CardGrader: identify + grade + price
app.post('/api/grade', async (req, res) => {
  try {
    if (!KEY) return res.status(500).json({ error: 'Server missing CARDGRADER_API_KEY env var.' });
    const { front, back, modules } = req.body || {};
    if (!front || !back) return res.status(400).json({ error: 'Front and back photos are both required.' });

    const fd = new FormData();
    fd.append('front', dataURLtoBlob(front), 'front.jpg');
    fd.append('back', dataURLtoBlob(back), 'back.jpg');
    fd.append('modules', modules || 'full');

    const sub = await fetch(BASE + '/scans', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + KEY, 'Idempotency-Key': 'sch-' + Date.now() },
      body: fd,
    });
    const started = await sub.json();
    if (!sub.ok) return res.status(sub.status).json({ error: started.detail || started.code || 'Scan failed', raw: started });

    const id = started.id;
    let result = null;
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      const pr = await fetch(BASE + '/scans/' + id, { headers: { Authorization: 'Bearer ' + KEY } });
      const pj = await pr.json();
      if (pj.status === 'completed') { result = pj; break; }
      if (pj.status === 'failed') return res.status(502).json({ error: 'Grading failed for this photo — try clearer front & back shots.', raw: pj });
    }
    if (!result) return res.status(504).json({ error: 'Timed out waiting for the grade — try again.' });
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: String((e && e.message) || e) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Sports Card Hub live on ' + PORT));
