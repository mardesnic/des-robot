import type { Difficulty, Dir } from './robot';

export const LANGS = ['en', 'hr'] as const;
export type Lang = (typeof LANGS)[number];
export type Language = 'auto' | Lang;

// Each language's name in that language, for the picker.
export const LANG_NAMES: Record<Lang, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

export function detectLang(): Lang {
  const preferred = navigator.languages ?? [navigator.language];
  return preferred.some((l) => l.toLowerCase().startsWith('hr')) ? 'hr' : 'en';
}

type Forms = { one: string; few?: string; other: string };

// Croatian has three plural forms: 1 pokušaj, 2 pokušaja, 5 pokušaja.
const count = (lang: Lang, n: number, forms: Forms) => {
  const form = new Intl.PluralRules(lang).select(n) as keyof Forms;
  return `${n} ${forms[form] ?? forms.other}`;
};

const en = {
  title: 'Robot',
  newGame: 'New game',
  settings: 'Settings',
  cancel: 'Cancel',
  done: 'Done',
  levels: {
    tiny: 'Very easy',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  } as Record<Difficulty, string>,
  dirs: {
    up: 'Up',
    right: 'Right',
    down: 'Down',
    left: 'Left',
  } as Record<Dir, string>,
  card: (dir: string, times: number) => (times > 1 ? `${dir} ×${times}` : dir),
  emptySlot: 'Empty',
  program: 'Program',
  go: 'Go',
  stop: 'Stop',
  back: 'Remove last',
  clear: 'Clear',
  tries: (n: number) => count('en', n, { one: 'try', other: 'tries' }),
  firstTry: 'First try!',
  solved: 'Well done!',
  next: 'Next level',
  changeLevel: 'Change level',
  language: 'Language',
  automatic: 'Automatic',
  sound: 'Sound and vibration',
  on: 'On',
  off: 'Off',
  statistics: 'Statistics',
  solvedColumn: 'Solved',
  source: 'Source',
};

export type Strings = typeof en;

const hr: Strings = {
  title: 'Robot',
  newGame: 'Nova igra',
  settings: 'Postavke',
  cancel: 'Odustani',
  done: 'Gotovo',
  levels: {
    tiny: 'Vrlo lagano',
    easy: 'Lagano',
    medium: 'Srednje',
    hard: 'Teško',
  },
  dirs: {
    up: 'Gore',
    right: 'Desno',
    down: 'Dolje',
    left: 'Lijevo',
  },
  card: (dir, times) => (times > 1 ? `${dir} ×${times}` : dir),
  emptySlot: 'Prazno',
  program: 'Program',
  go: 'Kreni',
  stop: 'Stani',
  back: 'Makni zadnju',
  clear: 'Očisti',
  tries: (n) =>
    count('hr', n, { one: 'pokušaj', few: 'pokušaja', other: 'pokušaja' }),
  firstTry: 'Iz prve!',
  solved: 'Bravo!',
  next: 'Sljedeća razina',
  changeLevel: 'Promijeni razinu',
  language: 'Jezik',
  automatic: 'Automatski',
  sound: 'Zvuk i vibracija',
  on: 'Uključeno',
  off: 'Isključeno',
  statistics: 'Statistika',
  solvedColumn: 'Riješeno',
  source: 'Izvorni kod',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
