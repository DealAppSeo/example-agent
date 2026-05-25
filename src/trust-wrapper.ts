/**
 * Trust wrapper — the single place this example talks to the HyperDAG trust layer.
 *
 * Two modes, chosen automatically:
 *   1. DEMO (default, zero setup): keyless POST to the public HAL fact-check endpoint
 *      (`/api/v1/hal/evaluate`). Runs immediately — no API key needed.
 *   2. SDK (when AGENT_ID + TRUSTSHELL_API_KEY are set): uses `@hyperdag/trustshell`'s
 *      `evaluate(text, certainty)` — the full loop (HAL verdict + RepID delta for your agent).
 *
 * Both return a normalized verdict so the agent code doesn't care which path ran.
 */
import { TrustShell } from '@hyperdag/trustshell';

const ENGINE = process.env.TRUSTSHELL_ENGINE || 'https://repid-engine-production.up.railway.app';
const AGENT_ID = process.env.AGENT_ID;
const API_KEY = process.env.TRUSTSHELL_API_KEY;

export interface TrustVerdict {
  decision: 'clean' | 'flagged' | 'vetoed';
  hal_score: number;
  mode: string; // 'fact-check' | 'extractor' | 'sdk' ...
  source: 'demo-public-hal' | 'sdk';
  repid_delta?: number; // only in SDK mode
}

/** SDK mode is used only when both an agent id and a key are present. */
export const usingSdk = Boolean(AGENT_ID && API_KEY);

const shell = usingSdk
  ? new TrustShell({ agentId: AGENT_ID!, apiKey: API_KEY!, engineUrl: ENGINE })
  : null;

export async function checkTrust(text: string, certainty = 0.9): Promise<TrustVerdict> {
  if (shell) {
    // SDK mode: full loop (writes a score-event + returns RepID delta).
    const r = await shell.evaluate(text, certainty);
    return {
      decision: r.approved ? 'clean' : 'vetoed',
      hal_score: r.hal_score,
      mode: 'sdk',
      source: 'sdk',
      repid_delta: r.repid_delta,
    };
  }

  // Demo mode: keyless public HAL fact-check.
  const res = await fetch(`${ENGINE}/api/v1/hal/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, certainty }),
  });
  if (!res.ok) throw new Error(`HAL evaluate failed: HTTP ${res.status}`);
  const d: any = await res.json();
  return {
    decision: d.decision,
    hal_score: d.hal_score,
    mode: d.mode,
    source: 'demo-public-hal',
  };
}
