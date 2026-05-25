/**
 * Agent logic: fact-check a query through the trust layer BEFORE responding.
 * If HAL vetoes the claim, the agent refuses instead of asserting something false.
 */
import { checkTrust, usingSdk, type TrustVerdict } from './trust-wrapper.js';

export interface AgentResult {
  agent_response: string;
  trust_metadata: TrustVerdict & { checked_at: string };
}

export async function handleAgentRequest(query: string): Promise<AgentResult> {
  console.log(`[AGENT] query: ${query}`);

  // Step 1 — trust gate (HAL fact-check; SDK loop if a key is configured).
  const verdict = await checkTrust(query);
  console.log(`[AGENT] HAL ${verdict.decision} (score ${verdict.hal_score}, via ${verdict.source})`);

  const meta = { ...verdict, checked_at: new Date().toISOString() };

  if (verdict.decision === 'vetoed') {
    return {
      agent_response: "I can't make that claim — it failed the trust layer's fact-check.",
      trust_metadata: meta,
    };
  }

  // Step 2 — generate the response. (Drop your real LLM call here; this is a placeholder so the
  // example runs with zero credentials. The point is that the trust gate ran FIRST.)
  const flag = verdict.decision === 'flagged' ? ' (note: flagged for review)' : '';
  return {
    agent_response: `Response to: "${query}"${flag}`,
    trust_metadata: meta,
  };
}

export function modeBanner(): string {
  return usingSdk
    ? '[trust] SDK mode — HAL + RepID loop (AGENT_ID + TRUSTSHELL_API_KEY set)'
    : '[trust] DEMO mode — keyless public HAL fact-check (set AGENT_ID + TRUSTSHELL_API_KEY for the full RepID loop)';
}
