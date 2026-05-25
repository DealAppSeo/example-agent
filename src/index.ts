/** Entrypoint: a tiny Express server exposing the trust-gated agent. */
import express from 'express';
import { handleAgentRequest, modeBanner } from './agent.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/agent/query', async (req, res) => {
  const query = typeof req.body?.query === 'string' ? req.body.query.trim() : '';
  if (!query) return res.status(400).json({ error: 'body must be { "query": "..." }' });
  try {
    res.json(await handleAgentRequest(query));
  } catch (err: any) {
    res.status(502).json({ error: err?.message ?? 'agent error' });
  }
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
  console.log(`Example agent on http://localhost:${PORT}`);
  console.log(modeBanner());
  console.log(`Try: curl -X POST http://localhost:${PORT}/agent/query -H "Content-Type: application/json" -d '{"query":"The Eiffel Tower is in Paris"}'`);
});
