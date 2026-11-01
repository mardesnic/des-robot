import { describe, expect, it } from 'vitest';

import { STRINGS } from './i18n';

const shape = (o: object): string[] =>
  Object.entries(o).flatMap(([k, v]) =>
    v && typeof v === 'object' ? shape(v).map((s) => `${k}.${s}`) : [k]
  );

describe('translations', () => {
  it('have the same keys in every language', () => {
    const [first, ...rest] = Object.values(STRINGS);
    for (const strings of rest) expect(shape(strings)).toEqual(shape(first));
  });

  it('use Croatian plural forms', () => {
    const { tries } = STRINGS.hr;
    expect([1, 2, 5, 21].map(tries)).toEqual([
      '1 pokušaj',
      '2 pokušaja',
      '5 pokušaja',
      '21 pokušaj',
    ]);
  });
});
