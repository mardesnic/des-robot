import type { Speed } from './game';
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
    tiny: 'Little',
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
  } as Record<Difficulty, string>,
  goals: {
    battery: 'Help the robot get to the battery',
    stars: 'Pick up every star, then go to the battery',
    key: 'Get the key to open the door',
  },
  repeatTip: 'Tap a card to make it go 2 or 3 times',
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
  speed: 'Robot speed',
  speeds: { slow: 'Slow', normal: 'Normal', fast: 'Fast' } as Record<
    Speed,
    string
  >,
  language: 'Language',
  automatic: 'Automatic',
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
    tiny: 'Malo',
    easy: 'Lagano',
    medium: 'Srednje',
    hard: 'Teško',
  },
  goals: {
    battery: 'Pomozi robotu doći do baterije',
    stars: 'Skupi sve zvjezdice, pa idi do baterije',
    key: 'Uzmi ključ da otvoriš vrata',
  },
  repeatTip: 'Dodirni karticu da ide 2 ili 3 puta',
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
  speed: 'Brzina robota',
  speeds: { slow: 'Sporo', normal: 'Normalno', fast: 'Brzo' },
  language: 'Jezik',
  automatic: 'Automatski',
  statistics: 'Statistika',
  solvedColumn: 'Riješeno',
  source: 'Izvorni kod',
};

export const STRINGS: Record<Lang, Strings> = { en, hr };
