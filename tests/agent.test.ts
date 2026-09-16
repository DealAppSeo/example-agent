/**
 * Agent tests inject a fake verifyOutput — no live network.
 */
import { test } from 'node:test';
import assert from 'node:assert';
import { handleAgentRequest } from '../src/agent.ts';

function fake(verdict: string, halScore = 0) {
  return { verifyOutput: async () => ({ verdict, halScore }) };
}

test('PASS → agent responds, metadata clean', async () => {
  const r = await handleAgentRequest('The Eiffel Tower is in Paris', fake('PASS'));
  assert.equal(r.trust_metadata.decision, 'clean');
  assert.match(r.agent_response, /Response to/);
});

test('VETO → agent refuses', async () => {
  const r = await handleAgentRequest('The Eiffel Tower is in Tokyo', fake('VETO', 1));
  assert.equal(r.trust_metadata.decision, 'vetoed');
  assert.match(r.agent_response, /can.?t make that claim/i);
});

test('FLAG → responds with a review note', async () => {
  const r = await handleAgentRequest('Some borderline statement', fake('FLAG', 0.4));
  assert.equal(r.trust_metadata.decision, 'flagged');
  assert.match(r.agent_response, /flagged for review/);
});
