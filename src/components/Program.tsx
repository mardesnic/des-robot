import type { Card } from '../lib/robot';
import type { Strings } from '../lib/i18n';
import { Arrow } from './Sprite';

// The row of cards the robot will play, with empty slots showing how
// much room is left.
export function Program({
  program,
  slots,
  counts,
  active,
  bumped,
  disabled,
  onTap,
  t,
}: {
  program: Card[];
  slots: number;
  counts: boolean;
  active?: number;
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
        const cls = [
          'step',
          i === active && 'step--active',
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
              <Arrow dir={c.dir} />
              {counts && c.times > 1 && (
                <span className='step__times'>×{c.times}</span>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
