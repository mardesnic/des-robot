import type { Card, Difficulty, Dir, Level } from './robot';

export type Game = {
  level: Level;
  program: Card[];
  tries: number; // times Go was pressed without winning
  solved: boolean;
};

// Milliseconds per step. Slow enough to follow with a finger.
export const STEP_MS = 550;

export type Settings = { sound: boolean };

export const initialSettings: Settings = { sound: true };

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

// Most arrows one card holds, on levels where the same arrows group.
export const MAX_TIMES = 3;

// Where the next arrow of this way goes: onto the last card when it points
// the same way and has room (levels with repeats only), else a new card.
const groups = (game: Game, dir: Dir) => {
  const last = game.program.at(-1);
  return game.level.counts && last?.dir === dir && last.times < MAX_TIMES;
};

export const canAdd = (game: Game, dir: Dir) =>
  groups(game, dir) || game.program.length < game.level.slots;

export const addCard = (game: Game, dir: Dir) => {
  if (!canAdd(game, dir)) return game;
  const { program } = game;
  return edit(
    game,
    groups(game, dir)
      ? program.with(-1, { dir, times: program.at(-1)!.times + 1 })
      : [...program, { dir, times: 1 }]
  );
};

export const removeCard = (game: Game, i: number) =>
  edit(game, game.program.toSpliced(i, 1));

// Takes back the last arrow pressed: one arrow off the last card.
export const removeLast = (game: Game) => {
  const last = game.program.at(-1);
  if (!last) return game;
  return last.times > 1
    ? edit(game, game.program.with(-1, { ...last, times: last.times - 1 }))
    : removeCard(game, game.program.length - 1);
};

export const clearProgram = (game: Game) => edit(game, []);

export const finishRun = (game: Game, won: boolean): Game =>
  won ? { ...game, solved: true } : { ...game, tries: game.tries + 1 };

export const recordWin = (stats: Stats, game: Game): Stats => ({
  ...stats,
  [game.level.difficulty]: { solved: stats[game.level.difficulty].solved + 1 },
});
