import { describe, expect, it } from 'vitest';

import {
  addCard,
  canAdd,
  newGame,
  removeCard,
  removeLast,
  type Game,
} from './game';
import type { Dir, Level } from './robot';

const level = (counts: boolean, slots = 3): Level => ({
  difficulty: counts ? 'medium' : 'tiny',
  size: 4,
  start: 0,
  goal: 15,
  rocks: [],
  stars: [],
  counts,
  slots,
  solution: [],
});

const press = (game: Game, ...dirs: Dir[]) => dirs.reduce(addCard, game);

describe('adding arrows', () => {
  it('groups the same arrows onto one card, three at most', () => {
    const g = press(newGame(level(true)), 'right', 'right', 'right', 'right');
    expect(g.program).toEqual([
      { dir: 'right', times: 3 },
      { dir: 'right', times: 1 },
    ]);
  });

  it('starts a new card when the arrow changes', () => {
    const g = press(newGame(level(true)), 'up', 'right', 'up');
    expect(g.program.map((c) => c.times)).toEqual([1, 1, 1]);
  });

  it('keeps one arrow per card on levels without repeats', () => {
    const g = press(newGame(level(false)), 'right', 'right');
    expect(g.program).toEqual([
      { dir: 'right', times: 1 },
      { dir: 'right', times: 1 },
    ]);
  });

  it('still adds to the last card when every slot is taken', () => {
    const g = press(newGame(level(true, 2)), 'up', 'right');
    expect(canAdd(g, 'right')).toBe(true);
    expect(canAdd(g, 'down')).toBe(false);
    expect(addCard(g, 'down')).toBe(g);
    expect(addCard(g, 'right').program[1].times).toBe(2);
  });
});

describe('taking arrows back', () => {
  it('removes one arrow from the last card', () => {
    let g = press(newGame(level(true)), 'up', 'right', 'right');
    g = removeLast(g);
    expect(g.program).toEqual([
      { dir: 'up', times: 1 },
      { dir: 'right', times: 1 },
    ]);
    g = removeLast(g);
    expect(g.program).toEqual([{ dir: 'up', times: 1 }]);
  });

  it('removes a whole card when it is tapped', () => {
    const g = press(newGame(level(true)), 'up', 'right', 'right');
    expect(removeCard(g, 1).program).toEqual([{ dir: 'up', times: 1 }]);
  });
});
