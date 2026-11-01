import type { Language } from './i18n';
import type { Card, Difficulty, Dir, Level } from './robot';

export type Game = {
  level: Level;
  program: Card[];
  tries: number; // times Go was pressed without winning
  solved: boolean;
};

export const SPEEDS = ['slow', 'normal', 'fast'] as const;
export type Speed = (typeof SPEEDS)[number];

// Milliseconds per step. Slow enough to follow with a finger.
export const STEP_MS: Record<Speed, number> = {
  slow: 850,
  normal: 550,
  fast: 320,
};

export type Settings = {
  speed: Speed;
  language: Language;
};

export const initialSettings: Settings = {
  speed: 'normal',
  language: 'auto',
};

export type Stats = { [D in Difficulty]: { solved: number } };

export const initialStats: Stats = {
  tiny: { solved: 0 },
  easy: { solved: 0 },
  medium: { solved: 0 },
  hard: { solved: 0 },
};

export const newGame = (level: Level): Game => ({
  level,
  program: [],
  tries: 0,
  solved: false,
});

const edit = (game: Game, program: Card[]): Game =>
  game.solved ? game : { ...game, program };

export const isFull = (game: Game) => game.program.length >= game.level.slots;

export const addCard = (game: Game, dir: Dir) =>
  isFull(game) ? game : edit(game, [...game.program, { dir, times: 1 }]);

export const removeCard = (game: Game, i: number) =>
  edit(game, game.program.toSpliced(i, 1));

export const removeLast = (game: Game) =>
  removeCard(game, game.program.length - 1);

export const clearProgram = (game: Game) => edit(game, []);

// Tapping a card on levels with repeats steps it through 1, 2 and 3.
export const cycleTimes = (game: Game, i: number) =>
  edit(
    game,
    game.program.map((c, k) =>
      k === i ? { ...c, times: (c.times % 3) + 1 } : c
    )
  );

export const finishRun = (game: Game, won: boolean): Game =>
  won ? { ...game, solved: true } : { ...game, tries: game.tries + 1 };

export const recordWin = (stats: Stats, game: Game): Stats => ({
  ...stats,
  [game.level.difficulty]: { solved: stats[game.level.difficulty].solved + 1 },
});
