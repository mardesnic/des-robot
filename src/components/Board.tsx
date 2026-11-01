import type { CSSProperties } from 'react';

import type { Level, Tick } from '../lib/robot';
import { Sprite, type SpriteName } from './Sprite';

// What sits on a cell, given what the robot has picked up so far.
function item(level: Level, at: Tick, i: number): SpriteName | undefined {
  if (level.rocks.includes(i)) return 'rock';
  if (i === level.goal) return 'battery';
  const star = level.stars.indexOf(i);
  if (star >= 0) return at.stars & (1 << star) ? undefined : 'star';
  if (i === level.key) return at.key ? undefined : 'key';
  if (i === level.door) return at.key ? undefined : 'door';
}

export function Board({
  level,
  at,
  confused,
  stepMs,
  attempt,
}: {
  level: Level;
  at: Tick;
  confused: boolean; // the program ran out before the goal
  stepMs: number;
  attempt: number; // a new attempt puts the robot back without sliding
}) {
  const { size } = level;
  const robot = [
    'robot',
    at.bump && `robot--bump-${at.bump}`,
    confused && 'robot--confused',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className='board'
      style={{ '--size': size, '--step': `${stepMs}ms` } as CSSProperties}
    >
      {Array.from({ length: size * size }, (_, i) => {
        const name = item(level, at, i);
        return (
          <div
            key={i}
            className={
              (Math.floor(i / size) + (i % size)) % 2
                ? 'cell cell--alt'
                : 'cell'
            }
          >
            {name && <Sprite name={name} />}
          </div>
        );
      })}
      <div
        key={attempt}
        className={robot}
        style={
          {
            '--r': Math.floor(at.pos / size),
            '--c': at.pos % size,
          } as CSSProperties
        }
      >
        <Sprite name='robot' />
        {confused && <span className='robot__bubble'>?</span>}
      </div>
    </div>
  );
}
