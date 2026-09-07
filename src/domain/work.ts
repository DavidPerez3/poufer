import { grantMapocoins, type EconomyState } from '@/domain/economy';
import type { NeedEffects } from '@/domain/gameBalance';
import { advanceNeeds, applyNeedEffects, type TimedNeeds } from '@/domain/gameEngine';

export type WorkJobId = 'cashier' | 'forklift';

export type WorkJob = {
  id: WorkJobId;
  name: string;
  description: string;
  icon: string;
  baseReward: number;
  rewardPerCorrect: number;
  mistakePenalty: number;
  speedTargetSeconds: number;
  speedBonus: number;
  effects: NeedEffects;
};

export const WORK_JOBS: Readonly<Record<WorkJobId, WorkJob>> = {
  cashier: {
    id: 'cashier',
    name: 'Cajero de supermercado',
    description: 'Escanea precios sin regalar el carro entero al cliente.',
    icon: '🛒',
    baseReward: 14,
    rewardPerCorrect: 5,
    mistakePenalty: 3,
    speedTargetSeconds: 24,
    speedBonus: 10,
    effects: { energy: -10, hunger: -7, boredom: 7, sleep: -3, bladder: 4 },
  },
  forklift: {
    id: 'forklift',
    name: 'Carretillero de almacén',
    description: 'Recoge palés, cruza el pasillo y evita liarla con la carretilla.',
    icon: '🏗️',
    baseReward: 18,
    rewardPerCorrect: 3,
    mistakePenalty: 4,
    speedTargetSeconds: 32,
    speedBonus: 12,
    effects: { energy: -14, hunger: -9, boredom: 9, sleep: -4, sweat: 6, hygiene: -3 },
  },
};

export type WorkPerformance = {
  correct: number;
  mistakes: number;
  elapsedSeconds: number;
};

export type WorkResult = WorkPerformance & {
  jobId: WorkJobId;
  score: number;
  reward: number;
  completedAt: number;
};

export type WorkState = TimedNeeds & EconomyState;

export function calculateWorkResult(
  jobId: WorkJobId,
  performance: WorkPerformance,
  completedAt: number,
): WorkResult {
  const job = WORK_JOBS[jobId];
  const correct = Math.max(0, Math.floor(performance.correct));
  const mistakes = Math.max(0, Math.floor(performance.mistakes));
  const elapsedSeconds = Math.max(1, Math.floor(performance.elapsedSeconds));
  const speedBonus = elapsedSeconds <= job.speedTargetSeconds ? job.speedBonus : 0;
  const reward = Math.max(
    job.baseReward,
    job.baseReward + correct * job.rewardPerCorrect - mistakes * job.mistakePenalty + speedBonus,
  );
  const score = Math.max(0, correct * 100 - mistakes * 45 + Math.max(0, job.speedTargetSeconds - elapsedSeconds) * 5);

  return { jobId, correct, mistakes, elapsedSeconds, score, reward, completedAt };
}

export function completeWorkShift(
  state: WorkState,
  jobId: WorkJobId,
  performance: WorkPerformance,
  now: number,
  hygieneDecayPerHour = 0,
): { state: WorkState; result: WorkResult } {
  const job = WORK_JOBS[jobId];
  const result = calculateWorkResult(jobId, performance, now);
  const current = advanceNeeds(state, now, { hygieneDecayPerHour });
  const needs = applyNeedEffects(current, job.effects);
  const economy = grantMapocoins(
    state,
    result.reward,
    `Curro: ${job.name}`,
    `work-${jobId}-${now}`,
    now,
  );

  return {
    result,
    state: { ...state, ...economy, ...needs, lastUpdatedAt: current.lastUpdatedAt },
  };
}
