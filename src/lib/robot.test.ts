import { describe, expect, it } from 'vitest';

import {
  DIFFICULTIES,
  generate,
  hint,
  simulate,
  solve,
  startState,
  turns,
  type Card,
  type Level,
} from './robot';

// Deterministic stand-in for Math.random.
function seeded(seed = 1) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const steps = (cards: Card[]) => cards.reduce((n, c) => n + c.times, 0);

// A 4×4 board:
//   S . # .
//   . * # .
//   . . . G
//   . . . .
const sample: Level = {
  difficulty: 'tiny',
  size: 4,
  start: 0,
  goal: 11,
  rocks: [2, 6],
  stars: [5],
  counts: true,
  slots: 8,
  solution: [],
};

const card = (dir: Card['dir'], times = 1): Card => ({ dir, times });

describe('simulate', () => {
  it('wins on reaching the goal with every star', () => {
    const run = simulate(sample, [
      card('down'),
      card('right'),
      card('down'),
      card('right', 2),
    ]);
    expect(run.won).toBe(true);
    expect(run.ticks.at(-1)?.pos).toBe(11);
    expect(run.ticks.map((t) => t.card)).toEqual([-1, 0, 1, 2, 3, 3]);
  });

  it('does not win at the goal while a star is left', () => {
    const run = simulate(sample, [card('down', 2), card('right', 3)]);
    expect(run.won).toBe(false);
    expect(run.ticks.at(-1)?.pos).toBe(11);
  });

  it('stops at the first bump and says which card', () => {
    const run = simulate(sample, [card('right'), card('right'), card('down')]);
    expect(run.bumpedAt).toBe(1);
    expect(run.ticks.at(-1)).toMatchObject({ pos: 1, bump: 'right' });
  });

  it('bumps into the edge of the board', () => {
    expect(simulate(sample, [card('up')]).bumpedAt).toBe(0);
  });

  it('stops playing once won', () => {
    const run = simulate(sample, [
      card('down'),
      card('right'),
      card('down'),
      card('right', 3),
    ]);
    expect(run.won).toBe(true);
    expect(run.bumpedAt).toBeUndefined();
  });

  it('opens the door only with the key', () => {
    const level: Level = { ...sample, stars: [], key: 4, door: 1, rocks: [] };
    expect(simulate(level, [card('right')]).bumpedAt).toBe(0);
    const run = simulate(level, [card('down'), card('up'), card('right')]);
    expect(run.bumpedAt).toBeUndefined();
    expect(run.ticks.at(-1)).toMatchObject({ pos: 1, key: true });
  });
});

describe('solve', () => {
  it('finds the fewest steps', () => {
    expect(steps(solve(sample, undefined, false)!)).toBe(5);
  });

  it('finds the fewest cards when cards repeat', () => {
    const cards = solve({ ...sample, stars: [] })!;
    expect(cards).toHaveLength(2);
    expect(simulate({ ...sample, stars: [] }, cards).won).toBe(true);
  });

  it('gives up when the goal is walled off', () => {
    expect(solve({ ...sample, rocks: [7, 10, 15] })).toBeUndefined();
  });
});

describe('generate', () => {
  const levels = DIFFICULTIES.flatMap((d) =>
    Array.from({ length: 40 }, (_, n) => generate(d, seeded(n + 1)))
  );

  it('makes levels that can be won with their own solution', () => {
    for (const level of levels) {
      expect(simulate(level, level.solution).won).toBe(true);
      expect(level.solution.length).toBeLessThanOrEqual(level.slots);
    }
  });

  it('keeps start, goal, stars and key off rocks and each other', () => {
    for (const level of levels) {
      const items = [level.start, level.goal, ...level.stars];
      if (level.key !== undefined) items.push(level.key, level.door!);
      expect(new Set(items).size).toBe(items.length);
      expect(items.some((i) => level.rocks.includes(i))).toBe(false);
      expect(new Set(level.rocks).size).toBe(level.rocks.length);
    }
  });

  it('only repeats cards from medium up', () => {
    for (const level of levels) {
      const repeats =
        level.difficulty === 'medium' || level.difficulty === 'hard';
      expect(level.counts).toBe(repeats);
    }
  });

  it('gets longer and twistier with difficulty', () => {
    const avg = (d: string, f: (l: Level) => number) => {
      const of = levels.filter((l) => l.difficulty === d);
      return of.reduce((n, l) => n + f(l), 0) / of.length;
    };
    const length = (l: Level) => steps(solve(l, undefined, false)!);
    const bends = (l: Level) => turns(solve(l, undefined, false)!);
    for (let i = 1; i < DIFFICULTIES.length; i++) {
      const [a, b] = [DIFFICULTIES[i - 1], DIFFICULTIES[i]];
      expect(avg(b, length)).toBeGreaterThan(avg(a, length));
      expect(avg(b, bends)).toBeGreaterThanOrEqual(avg(a, bends));
    }
  });

  it('needs the key on hard levels', () => {
    for (const level of levels.filter((l) => l.difficulty === 'hard')) {
      const locked = { ...level, rocks: [...level.rocks, level.door!] };
      expect(
        solve(locked, { ...startState(level), key: true })
      ).toBeUndefined();
    }
  });
});

describe('hint', () => {
  it('builds up a winning program one card at a time', () => {
    for (const d of DIFFICULTIES) {
      const level = generate(d, seeded(7));
      let program: Card[] = [];
      for (let n = 0; n < 30 && !simulate(level, program).won; n++) {
        program = hint(level, program);
        expect(program.length).toBeLessThanOrEqual(level.slots);
      }
      expect(simulate(level, program).won).toBe(true);
    }
  });

  it('cuts the program back to just before a bump', () => {
    const program = [card('down'), card('right'), card('right'), card('up')];
    expect(hint(sample, program)).toEqual(program.slice(0, 2));
  });

  it('starts over when the rest will not fit', () => {
    const level = { ...sample, slots: 3, solution: [card('down')] };
    const program = [card('right'), card('left'), card('right')];
    expect(hint(level, program)).toEqual([card('down')]);
  });
});
