import type { Card } from '../lib/robot';
import type { Strings } from '../lib/i18n';
import { Arrow } from './Sprite';

// The row of cards the robot will play, with empty slots showing how
// much room is left. A card shows one arrow for each step, so a child can
// count them; while the robot plays, the arrow for its step lights up.
export function Program({
  program,
  slots,
  active,
  bumped,
  disabled,
  onTap,
  t,
}: {
  program: Card[];
  slots: number;
  active?: { card: number; arrow: number };
  bumped?: number;
  disabled: boolean;
  onTap: (i: number) => void;
  t: Strings;
}) {
  return (
    <ol className='program' aria-label={t.program}>
      {Array.from({ length: slots }, (_, i) => {
        const c = program[i];
        if (!c) {
          return (
            <li key={`empty-${i}`} className='slot' aria-label={t.emptySlot} />
          );
        }
        const playing = active?.card === i;
        const cls = [
          'step',
          c.times > 1 && `step--many step--${c.times}`,
          playing && 'step--active',
          i === bumped && 'step--bumped',
        ]
          .filter(Boolean)
          .join(' ');
        return (
          <li key={`${i}-${c.dir}`} className='slot slot--filled'>
            <button
              className={cls}
              onClick={() => onTap(i)}
              disabled={disabled}
              aria-label={t.card(t.dirs[c.dir], c.times)}
            >
              {Array.from({ length: c.times }, (_, k) => (
                <span
                  key={k}
                  className={
                    playing && c.times > 1 && active.arrow === k
                      ? 'step__arrow step__arrow--now'
                      : 'step__arrow'
                  }
                >
                  <Arrow dir={c.dir} />
                </span>
              ))}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
