export const DIFFICULTIES = ['tiny', 'easy', 'medium', 'hard'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

export const DIRS = ['up', 'right', 'down', 'left'] as const;
export type Dir = (typeof DIRS)[number];

const DELTA: Record<Dir, [number, number]> = {
  up: [-1, 0],
  right: [0, 1],
  down: [1, 0],
  left: [0, -1],
};

// One card in the program: move this way, this many times.
export type Card = { dir: Dir; times: number };

export type Level = {
  difficulty: Difficulty;
  size: number;
  start: number;
  goal: number;
  rocks: number[];
  stars: number[]; // all must be picked up before the goal counts
  key?: number; // the door is a wall until the robot has the key
  door?: number;
  counts: boolean; // cards can repeat 2 or 3 times
  slots: number; // most cards the program can hold
  solution: Card[]; // one shortest program, for hints
};

// Where the robot is and what it has picked up so far.
export type State = { pos: number; stars: number; key: boolean };

export type Tick = State & {
  card: number; // the card being played, -1 before the first
  bump?: Dir; // tried to move this way and hit something
};

export type Run = { ticks: Tick[]; won: boolean; bumpedAt?: number };

export const startState = (level: Level): State => ({
  pos: level.start,
  stars: 0,
  key: false,
});

export const allStars = (level: Level) => (1 << level.stars.length) - 1;

export const hasWon = (level: Level, s: State) =>
  s.pos === level.goal && s.stars === allStars(level);

// One step in a direction, or undefined when an edge, rock or locked door
// is in the way.
export function step(level: Level, s: State, dir: Dir): State | undefined {
  const { size } = level;
  const r = Math.floor(s.pos / size) + DELTA[dir][0];
  const c = (s.pos % size) + DELTA[dir][1];
  if (r < 0 || r >= size || c < 0 || c >= size) return undefined;
  const pos = r * size + c;
  if (level.rocks.includes(pos)) return undefined;
  if (pos === level.door && !s.key) return undefined;
  const star = level.stars.indexOf(pos);
  return {
    pos,
    stars: star < 0 ? s.stars : s.stars | (1 << star),
    key: s.key || pos === level.key,
  };
}

// Plays a program from the start. It stops at the first bump, or as soon
// as the robot reaches the goal with every star.
export function simulate(level: Level, program: Card[]): Run {
  let s = startState(level);
  const ticks: Tick[] = [{ ...s, card: -1 }];
  for (let k = 0; k < program.length; k++) {
    const { dir, times } = program[k];
    for (let t = 0; t < times; t++) {
      const next = step(level, s, dir);
      if (!next) {
        ticks.push({ ...s, card: k, bump: dir });
        return { ticks, won: false, bumpedAt: k };
      }
      s = next;
      ticks.push({ ...s, card: k });
      if (hasWon(level, s)) return { ticks, won: true };
    }
  }
  return { ticks, won: false };
}

// The shortest program from a state to the goal: fewest steps, or fewest
// cards when cards can repeat. Undefined when there is no way through.
export function solve(
  level: Level,
  from: State = startState(level),
  counts = level.counts
): Card[] | undefined {
  const cells = level.size * level.size;
  const id = (s: State) => s.pos + cells * (s.stars * 2 + Number(s.key));
  const prev = new Map<number, { from: State; card: Card } | null>();
  prev.set(id(from), null);
  const trace = (s: State) => {
    const cards: Card[] = [];
    for (let p = prev.get(id(s)); p; p = prev.get(id(p.from))) {
      cards.unshift(p.card);
    }
    return cards;
  };
  if (hasWon(level, from)) return [];

  let frontier = [from];
  while (frontier.length) {
    const next: State[] = [];
    for (const s of frontier) {
      for (const dir of DIRS) {
        let at: State | undefined = s;
        for (let times = 1; times <= (counts ? 3 : 1); times++) {
          at = step(level, at, dir);
          if (!at) break;
          if (prev.has(id(at))) continue;
          prev.set(id(at), { from: s, card: { dir, times } });
          if (hasWon(level, at)) return trace(at);
          next.push(at);
        }
      }
    }
    frontier = next;
  }
  return undefined;
}

// Number of times the path changes direction.
export const turns = (cards: Card[]) =>
  cards.filter((c, i) => i > 0 && c.dir !== cards[i - 1].dir).length;

type Config = {
  size: number;
  rocks: [number, number];
  stars: number;
  moves: [number, number]; // shortest path length in steps
  turns: number;
  detour?: boolean; // rocks must be in the way of the straight route
  counts: boolean;
  slots: number | 'tight'; // tight: one more than the fewest cards needed
  door?: boolean;
};

const CONFIG: Record<Difficulty, Config> = {
  tiny: {
    size: 4,
    rocks: [0, 2],
    stars: 0,
    moves: [3, 5],
    turns: 1,
    counts: false,
    slots: 8,
  },
  easy: {
    size: 5,
    rocks: [3, 5],
    stars: 0,
    moves: [5, 8],
    turns: 2,
    detour: true,
    counts: false,
    slots: 10,
  },
  medium: {
    size: 6,
    rocks: [6, 9],
    stars: 2,
    moves: [9, 13],
    turns: 3,
    counts: true,
    slots: 8,
  },
  hard: {
    size: 6,
    rocks: [3, 5],
    stars: 1,
    moves: [11, 16],
    turns: 4,
    counts: true,
    slots: 'tight',
    door: true,
  },
};

type Rng = () => number;

const pick = <T>(items: T[], rng: Rng) =>
  items.splice(Math.floor(rng() * items.length), 1)[0];

const between = ([lo, hi]: [number, number], rng: Rng) =>
  lo + Math.floor(rng() * (hi - lo + 1));

// The cells of a wall across the board, with a door in it. Everything on
// the start's side of the wall comes first.
function wall(size: number, rng: Rng) {
  const across = 2 + Math.floor(rng() * (size - 4));
  const gap = Math.floor(rng() * size);
  const vertical = rng() < 0.5;
  const cell = (a: number, b: number) =>
    vertical ? b * size + a : a * size + b;
  const flip = rng() < 0.5; // which side the robot starts on
  const near: number[] = [];
  const far: number[] = [];
  for (let a = 0; a < size; a++) {
    for (let b = 0; b < size; b++) {
      if (a === across) continue;
      (a < across !== flip ? near : far).push(cell(a, b));
    }
  }
  const rocks = Array.from({ length: size }, (_, b) => cell(across, b));
  const door = rocks.splice(gap, 1)[0];
  return { rocks, door, near, far };
}

function attempt(difficulty: Difficulty, rng: Rng): Level | undefined {
  const cfg = CONFIG[difficulty];
  const { size } = cfg;
  const all = Array.from({ length: size * size }, (_, i) => i);
  let level: Level;

  if (cfg.door) {
    const w = wall(size, rng);
    const start = pick(w.near, rng);
    const key = pick(w.near, rng);
    const goal = pick(w.far, rng);
    const free = [...w.near, ...w.far];
    const rocks = [...w.rocks];
    for (let n = between(cfg.rocks, rng); n > 0; n--)
      rocks.push(pick(free, rng));
    const stars = Array.from({ length: cfg.stars }, () => pick(free, rng));
    level = {
      difficulty,
      size,
      start,
      goal,
      rocks,
      stars,
      key,
      door: w.door,
      counts: cfg.counts,
      slots: 0,
      solution: [],
    };
  } else {
    const free = [...all];
    const start = pick(free, rng);
    const goal = pick(free, rng);
    const rocks = Array.from({ length: between(cfg.rocks, rng) }, () =>
      pick(free, rng)
    );
    const stars = Array.from({ length: cfg.stars }, () => pick(free, rng));
    level = {
      difficulty,
      size,
      start,
      goal,
      rocks,
      stars,
      counts: cfg.counts,
      slots: 0,
      solution: [],
    };
  }

  const path = solve(level, undefined, false);
  if (!path) return undefined;
  if (path.length < cfg.moves[0] || path.length > cfg.moves[1])
    return undefined;
  if (turns(path) < cfg.turns) return undefined;

  if (cfg.detour) {
    const dr = Math.abs(
      Math.floor(level.start / size) - Math.floor(level.goal / size)
    );
    const dc = Math.abs((level.start % size) - (level.goal % size));
    if (path.length < dr + dc + 2) return undefined;
  }

  const solution = cfg.counts ? solve(level, undefined, true)! : path;
  const slots = cfg.slots === 'tight' ? solution.length + 1 : cfg.slots;
  if (solution.length > slots || slots > 10) return undefined;
  return { ...level, slots, solution };
}

// Makes a random level. Almost every attempt is thrown away, but each one
// is a tiny search, so this still takes only a few milliseconds.
export function generate(difficulty: Difficulty, rng: Rng): Level {
  for (;;) {
    const level = attempt(difficulty, rng);
    if (level) return level;
  }
}

// What a hint does to the program: cut it back to just before a bump,
// or add the next card of a shortest way to the goal. If that way won't
// fit in the slots left, it starts over with the first card.
export function hint(level: Level, program: Card[]): Card[] {
  const run = simulate(level, program);
  if (run.won) return program;
  if (run.bumpedAt !== undefined) return program.slice(0, run.bumpedAt);
  const rest = solve(level, run.ticks.at(-1))!;
  if (program.length + rest.length <= level.slots) {
    return [...program, rest[0]];
  }
  return [level.solution[0]];
}
