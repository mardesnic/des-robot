import type { Dir } from '../lib/robot';

export type SpriteName = 'robot' | 'battery' | 'star' | 'rock' | 'key' | 'door';

// Board pictures, drawn on a 100×100 canvas so they scale with the cell.
const SPRITES: Record<SpriteName, React.ReactNode> = {
  robot: (
    <>
      <path
        d='M50 8v10'
        stroke='#5b6472'
        strokeWidth='4'
        strokeLinecap='round'
      />
      <circle cx='50' cy='8' r='6' fill='#ef4444' />
      <rect x='14' y='18' width='72' height='56' rx='16' fill='#f08a24' />
      <rect x='22' y='27' width='56' height='34' rx='10' fill='#fff7ed' />
      <circle className='robot__eye' cx='38' cy='44' r='7' fill='#1f2937' />
      <circle className='robot__eye' cx='62' cy='44' r='7' fill='#1f2937' />
      <path
        d='M42 54q8 6 16 0'
        stroke='#1f2937'
        strokeWidth='3.5'
        fill='none'
        strokeLinecap='round'
      />
      <rect x='6' y='36' width='8' height='20' rx='4' fill='#c96a12' />
      <rect x='86' y='36' width='8' height='20' rx='4' fill='#c96a12' />
      <rect x='26' y='74' width='14' height='16' rx='5' fill='#5b6472' />
      <rect x='60' y='74' width='14' height='16' rx='5' fill='#5b6472' />
    </>
  ),
  battery: (
    <>
      <rect x='40' y='10' width='20' height='10' rx='3' fill='#2e7d4f' />
      <rect x='24' y='18' width='52' height='74' rx='10' fill='#34a865' />
      <path d='M54 30 38 58h12l-4 22 16-30H50Z' fill='#fff' />
    </>
  ),
  star: (
    <path
      d='m50 8 12.6 26.4 28.9 3.7-21.2 20 5.4 28.6L50 72.8 24.3 86.7l5.4-28.6-21.2-20 28.9-3.7Z'
      fill='#facc15'
      stroke='#d4a106'
      strokeWidth='4'
      strokeLinejoin='round'
    />
  ),
  rock: (
    <>
      <path d='M14 82 22 46l20-20 26 4 18 24 2 28Z' fill='#8b939e' />
      <path
        d='M42 26 52 46l-8 16 22 20M52 46l16-16'
        stroke='#6b7380'
        strokeWidth='3'
        fill='none'
        strokeLinejoin='round'
      />
    </>
  ),
  key: (
    <>
      <circle
        cx='32'
        cy='50'
        r='18'
        fill='none'
        stroke='#eab308'
        strokeWidth='10'
      />
      <path
        d='M50 50h38M78 50v14M66 50v10'
        stroke='#eab308'
        strokeWidth='10'
        strokeLinecap='round'
      />
    </>
  ),
  door: (
    <>
      <rect x='18' y='8' width='64' height='86' rx='6' fill='#9a5b2b' />
      <rect x='26' y='16' width='48' height='70' rx='3' fill='#b8743f' />
      <rect x='40' y='44' width='20' height='18' rx='3' fill='#eab308' />
      <path
        d='M44 44v-6a6 6 0 0 1 12 0v6'
        stroke='#eab308'
        strokeWidth='4'
        fill='none'
      />
    </>
  ),
};

export function Sprite({ name }: { name: SpriteName }) {
  return (
    <svg
      className={`sprite sprite--${name}`}
      viewBox='0 0 100 100'
      aria-hidden='true'
    >
      {SPRITES[name]}
    </svg>
  );
}

const ROTATION: Record<Dir, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

export function Arrow({ dir }: { dir: Dir }) {
  return (
    <svg
      className='arrow'
      viewBox='0 0 24 24'
      style={{ rotate: `${ROTATION[dir]}deg` }}
      aria-hidden='true'
    >
      <path
        d='M12 20V5M5 11l7-7 7 7'
        fill='none'
        stroke='currentColor'
        strokeWidth='3.2'
        strokeLinecap='round'
        strokeLinejoin='round'
      />
    </svg>
  );
}
