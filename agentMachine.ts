import { createMachine, assign } from 'xstate';

interface AgentContext { error?: string; retries: number; }
type AgentEvent =
  | { type: 'SKILLS_READY' } | { type: 'VALIDATE' }
  | { type: 'VALID' } | { type: 'INVALID' } | { type: 'REPAIRED' };

export const agentMachine = createMachine<AgentContext, AgentEvent>({
  id: 'zyntro-agent',
  initial: 'planning',
  context: { retries: 0 },
  states: {
    planning: {
      on: { SKILLS_READY: 'executing' },
      after: { 30000: 'failed' }
    },
    executing: { on: { VALIDATE: 'validating' } },
    validating: {
      on: {
        VALID: 'completing',
        INVALID: { target: 'repairing', actions: assign({ retries: c => c.retries + 1 }) }
      }
    },
    repairing: {
      on: { REPAIRED: 'validating' },
      after: { 30000: 'failed' }
    },
    completing: { type: 'final' },
    failed: { type: 'final' }
  }
});
