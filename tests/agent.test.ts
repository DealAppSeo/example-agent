/**
 * Tests run in DEMO mode (no AGENT_ID/key set), so checkTrust uses fetch — we mock it.
 * Run: npm test  (node --import tsx --test)
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { handleAgentRequest } from '../src/agent.ts';

function mockHal(decision: string, hal_score: number, mode = 'fact-check') {
  (globalThis as any).fetch = async () => ({
    ok: true,
    json: async () => ({ decision, hal_score, mode }),
  });
}

test('clean claim → agent responds, metadata clean', async () => {
  mockHal('clean', 0);
  const r = await handleAgentRequest('The Eiffel Tower is in Paris');
  assert.equal(r.trust_metadata.decision, 'clean');
  assert.match(r.agent_response, /Response to/);
});

test('vetoed claim → agent refuses', async () => {
  mockHal('vetoed', 0.95);
  const r = await handleAgentRequest('The Eiffel Tower is in Tokyo');
  assert.equal(r.trust_metadata.decision, 'vetoed');
  assert.match(r.agent_response, /can.?t make that claim/i);
});

test('flagged claim → responds with a review note', async () => {
  mockHal('flagged', 0.4);
  const r = await handleAgentRequest('Some borderline statement');
  assert.equal(r.trust_metadata.decision, 'flagged');
  assert.match(r.agent_response, /flagged for review/);
});
