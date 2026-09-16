/**
 * Trust wrapper — keyless TrustShell.verifyOutput (main API).
 * github:DealAppSeo/trustshell until F-PUBLISH. Dynamic import so unit tests
 * that inject a verifier do not load the SDK.
 */
export interface TrustVerdict {
  decision: 'clean' | 'flagged' | 'vetoed';
  verdict: string;
  hal_score: number;
  source: 'sdk';
}

type Verifier = { verifyOutput: (text: string) => Promise<{ verdict: string; halScore?: number }> };

export async function checkTrust(text: string, client?: Verifier): Promise<TrustVerdict> {
  const shell =
    client ??
    new (await import('@hyperdag/trustshell')).TrustShell();
  const r = await shell.verifyOutput(text);
  const decision =
    r.verdict === 'VETO' ? 'vetoed' : r.verdict === 'FLAG' ? 'flagged' : 'clean';
  return {
    decision,
    verdict: r.verdict,
    hal_score: typeof r.halScore === 'number' ? r.halScore : 0,
    source: 'sdk',
  };
}
