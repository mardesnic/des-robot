import { useEffect, useState } from 'react';

import { Board } from './components/Board';
import { Confetti } from './components/Confetti';
import { Icon } from './components/Icon';
import { NewGame, SettingsView } from './components/Menu';
import { Program } from './components/Program';
import { Arrow } from './components/Sprite';
import {
  addCard,
  clearProgram,
  cycleTimes,
  finishRun,
  hintsLeft,
  initialSettings,
  initialStats,
  isFull,
  newGame,
  recordWin,
  removeCard,
  removeLast,
  STEP_MS,
  takeHint,
  type Game,
  type Settings,
  type Stats,
} from './lib/game';
import { STRINGS, detectLang } from './lib/i18n';
import {
  generate,
  simulate,
  startState,
  type Difficulty,
  type Dir,
  type Run,
  type Tick,
} from './lib/robot';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

type View = 'play' | 'new' | 'settings';

// Bumping or running out of cards is shown for this long before the
// robot goes back to the start.
const OOPS_MS = 1300;

export default function App() {
  // Keys are prefixed: other apps on the same GitHub Pages origin share
  // this storage.
  const [store, setStore] = useStoredState<{ game?: Game }>('robot', {});
  const { game } = store;
  const [settings, setSettings] = useStoredState<Settings>(
    'robot-settings',
    initialSettings
  );
  const [stats, setStats] = useStoredState<Stats>('robot-stats', initialStats);
  const [view, setView] = useState<View>(game ? 'play' : 'new');
  const [run, setRun] = useState<{ trace: Run; tick: number }>();
  const [attempt, setAttempt] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  useWakeLock();

  const lang = settings.language === 'auto' ? detectLang() : settings.language;
  const t = STRINGS[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  const stepMs = STEP_MS[settings.speed];
  const running = !!run;
  const playing = view === 'play' && !!game && !game.solved;

  const update = (next: Game) => {
    if (!game || next === game) return;
    if (next.solved && !game.solved) {
      setStats(recordWin(stats, next));
      setCelebrating(true);
    }
    setStore({ game: next });
  };

  const start = (difficulty: Difficulty) => {
    setStore({ game: newGame(generate(difficulty, Math.random)) });
    setRun(undefined);
    setAttempt((a) => a + 1);
    setView('play');
  };

  const go = () => {
    if (!game || running || !game.program.length) return;
    setRun({ trace: simulate(game.level, game.program), tick: 0 });
  };

  const stop = () => {
    setRun(undefined);
    setAttempt((a) => a + 1);
  };

  // Plays the run one step at a time, then wins or goes back to the start.
  useEffect(() => {
    if (!run || !game) return;
    const last = run.trace.ticks.length - 1;
    if (run.tick < last) {
      const id = setTimeout(
        () => setRun({ ...run, tick: run.tick + 1 }),
        stepMs
      );
      return () => clearTimeout(id);
    }
    const { won } = run.trace;
    const id = setTimeout(
      () => {
        setRun(undefined);
        if (!won) setAttempt((a) => a + 1);
        update(finishRun(game, won));
      },
      won ? stepMs : stepMs + OOPS_MS
    );
    return () => clearTimeout(id);
  });

  const limit = settings.hintLimit;
  const left = game ? hintsLeft(game, limit) : 0;

  const edit = (f: (g: Game) => Game) => {
    if (game && !running) update(f(game));
  };
  const add = (dir: Dir) => edit((g) => addCard(g, dir));
  const tapCard = (i: number) =>
    edit((g) => (g.level.counts ? cycleTimes(g, i) : removeCard(g, i)));
  const showHint = () => {
    if (left > 0) edit(takeHint);
  };

  // Keyboard play for computers: arrows add cards, Backspace takes the
  // last one away, Enter or Space runs the program.
  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const dir = KEYS[e.key];
      if (dir) {
        e.preventDefault();
        add(dir);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        edit(removeLast);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (running) stop();
        else go();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  let at: Tick | undefined;
  let confused = false;
  if (game) {
    if (run) {
      at = run.trace.ticks[run.tick];
      confused =
        run.tick === run.trace.ticks.length - 1 &&
        !run.trace.won &&
        run.trace.bumpedAt === undefined;
    } else if (game.solved) {
      at = simulate(game.level, game.program).ticks.at(-1);
    } else {
      at = { ...startState(game.level), card: -1 };
    }
  }

  const goal = !game
    ? ''
    : game.level.key !== undefined
      ? t.goals.key
      : game.level.stars.length
        ? t.goals.stars
        : t.goals.battery;

  return (
    <main className='app'>
      <header className='header'>
        <h1>{t.title}</h1>
        <div className='header__actions'>
          {view === 'play' ? (
            <>
              <button
                className='button button--small'
                onClick={() => setView('new')}
              >
                {t.newGame}
              </button>
              <button
                className='button button--small'
                onClick={() => setView('settings')}
              >
                {t.settings}
              </button>
            </>
          ) : (
            game && (
              <button
                className='button button--small'
                onClick={() => setView('play')}
              >
                {view === 'new' ? t.cancel : t.done}
              </button>
            )
          )}
        </div>
      </header>

      {view === 'new' && <NewGame onStart={start} stats={stats} t={t} />}
      {view === 'settings' && (
        <SettingsView
          settings={settings}
          setSettings={setSettings}
          stats={stats}
          t={t}
        />
      )}

      {view === 'play' && game && at && (
        <>
          <div className='status'>
            <span>{t.levels[game.level.difficulty]}</span>
            <span className='muted'>{goal}</span>
          </div>

          <Board
            level={game.level}
            at={at}
            confused={confused}
            stepMs={stepMs}
            attempt={attempt}
          />

          {game.solved ? (
            <section className='card solved'>
              <h2>{t.solved}</h2>
              <p className='muted'>
                {game.tries ? t.tries(game.tries + 1) : t.firstTry} ·{' '}
                {game.hints ? t.hintsUsed(game.hints) : t.noHints}
              </p>
              <div className='solved__actions'>
                <button
                  className='button'
                  onClick={() => start(game.level.difficulty)}
                >
                  {t.next}
                </button>
                <button
                  className='button button--secondary'
                  onClick={() => setView('new')}
                >
                  {t.changeLevel}
                </button>
              </div>
            </section>
          ) : (
            <>
              <Program
                program={game.program}
                slots={game.level.slots}
                counts={game.level.counts}
                active={run && at.card >= 0 ? at.card : undefined}
                bumped={run && at.bump ? at.card : undefined}
                disabled={running}
                onTap={tapCard}
                t={t}
              />
              {game.level.counts && <p className='tip muted'>{t.repeatTip}</p>}

              <div className='controls'>
                <div className='dpad'>
                  {(['up', 'left', 'right', 'down'] as const).map((dir) => (
                    <button
                      key={dir}
                      className={`dpad__key dpad__key--${dir}`}
                      onClick={() => add(dir)}
                      disabled={running || isFull(game)}
                      aria-label={t.dirs[dir]}
                    >
                      <Arrow dir={dir} />
                    </button>
                  ))}
                </div>

                <div className='actions'>
                  <button
                    className={running ? 'go go--stop' : 'go'}
                    onClick={running ? stop : go}
                    disabled={!running && !game.program.length}
                  >
                    <Icon name={running ? 'stop' : 'go'} />
                    {running ? t.stop : t.go}
                  </button>
                  <div className='tools'>
                    <button
                      className='tool'
                      onClick={() => edit(removeLast)}
                      disabled={running || !game.program.length}
                      aria-label={t.back}
                    >
                      <Icon name='back' />
                    </button>
                    <button
                      className='tool'
                      onClick={() => edit(clearProgram)}
                      disabled={running || !game.program.length}
                      aria-label={t.clear}
                    >
                      <Icon name='clear' />
                    </button>
                    {limit !== 0 && (
                      <button
                        className='tool'
                        onClick={showHint}
                        disabled={running || left <= 0}
                        aria-label={t.hint}
                      >
                        <Icon name='hint' />
                        <span className='tool__count'>
                          {left === Infinity ? '∞' : left}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      <footer className='footer'>
        <a href='https://github.com/mardesnic/des-robot'>{t.source}</a>
      </footer>
      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </main>
  );
}

const KEYS: Record<string, Dir> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
};
