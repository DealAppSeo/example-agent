/**
 * Fact-check through TrustShell BEFORE responding. VETO refuses.
 */
import { checkTrust, type TrustVerdict } from './trust-wrapper.js';

export interface AgentResult {
  agent_response: string;
  trust_metadata: TrustVerdict & { checked_at: string };
}

export async function handleAgentRequest(
  query: string,
  client?: Parameters<typeof checkTrust>[1],
): Promise<AgentResult> {
  const verdict = await checkTrust(query, client);
  const meta = { ...verdict, checked_at: new Date().toISOString() };

  if (verdict.decision === 'vetoed') {
    return {
      agent_response: "I can't make that claim — it failed the trust layer's fact-check.",
      trust_metadata: meta,
    };
  }

  const flag = verdict.decision === 'flagged' ? ' (note: flagged for review)' : '';
  return {
    agent_response: `Response to: "${query}"${flag}`,
    trust_metadata: meta,
  };
}

export function modeBanner(): string {
  return '[trust] keyless TrustShell.verifyOutput (github:DealAppSeo/trustshell until F-PUBLISH)';
}
