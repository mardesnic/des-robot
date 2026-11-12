import { useEffect, useState } from 'react';

import { Board } from './components/Board';
import { HomeLink } from './components/HomeLink';
import { Confetti } from './components/Confetti';
import { Icon } from './components/Icon';
import { NewGame, SettingsView } from './components/Menu';
import { Program } from './components/Program';
import { Arrow } from './components/Sprite';
import {
  addCard,
  canAdd,
  clearProgram,
  finishRun,
  initialStats,
  newGame,
  recordWin,
  removeCard,
  removeLast,
  STEP_MS,
  type Game,
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
import { popMenu, pushMenu, useBackButton } from './lib/use-back-button';
import { useCheer } from './lib/use-cheer';
import { useLanguage, useSound } from './lib/use-shared-settings';
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
  const [stats, setStats] = useStoredState<Stats>('robot-stats', initialStats);
  const [view, setViewState] = useState<View>(game ? 'play' : 'new');
  // Menus open over the game, so the phone's Back button closes them.
  const setView = (next: View) => {
    if (next === 'play') popMenu();
    else pushMenu();
    setViewState(next);
  };
  useBackButton(() => {
    if (game) setViewState('play');
  });
  const [run, setRun] = useState<{ trace: Run; tick: number }>();
  const [attempt, setAttempt] = useState(0);
  const [celebrating, setCelebrating] = useState(false);
  useWakeLock();
  const [sound, setSound] = useSound();
  const cheer = useCheer(sound);

  const [language, setLanguage] = useLanguage();
  const lang = language === 'auto' ? detectLang() : language;
  const t = STRINGS[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  const stepMs = STEP_MS;
  const running = !!run;
  const playing = view === 'play' && !!game && !game.solved;

  const update = (next: Game) => {
    if (!game || next === game) return;
    if (next.solved && !game.solved) {
      setStats(recordWin(stats, next));
      setCelebrating(true);
      cheer();
    }
    setStore({ game: next });
  };

  const start = (difficulty: Difficulty) => {
    // The last level, if it was the same size, so the new one isn't alike.
    const previous =
      game?.level.difficulty === difficulty ? game.level : undefined;
    setStore({ game: newGame(generate(difficulty, Math.random, previous)) });
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

  const edit = (f: (g: Game) => Game) => {
    if (game && !running) update(f(game));
  };
  const add = (dir: Dir) => edit((g) => addCard(g, dir));
  const tapCard = (i: number) => edit((g) => removeCard(g, i));

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
      at = { ...startState(game.level), card: -1, arrow: 0 };
    }
  }

  return (
    <main className={view === 'play' && game ? 'app app--play' : 'app'}>
      <header className='header'>
        <div className='header__title'>
          <HomeLink label={t.allGames} />
          <h1>{t.title}</h1>
        </div>
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
                className='button button--small button--icon'
                onClick={() => setView('settings')}
                aria-label={t.settings}
              >
                <Icon name='settings' />
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

      {view === 'new' && <NewGame onStart={start} t={t} />}
      {view === 'settings' && (
        <SettingsView
          language={language}
          setLanguage={setLanguage}
          sound={sound}
          setSound={setSound}
          stats={stats}
          t={t}
        />
      )}

      {view === 'play' && game && at && (
        <>
          <div className='stage'>
            <Board
              level={game.level}
              at={at}
              confused={confused}
              stepMs={stepMs}
              attempt={attempt}
            />
          </div>

          {game.solved ? (
            <section className='card solved'>
              <h2>{t.solved}</h2>
              <p className='muted'>
                {game.tries ? t.tries(game.tries + 1) : t.firstTry}
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
                active={
                  run && at.card >= 0
                    ? { card: at.card, arrow: at.arrow }
                    : undefined
                }
                bumped={run && at.bump ? at.card : undefined}
                disabled={running}
                onTap={tapCard}
                t={t}
              />
              <div className='controls'>
                <div className='dpad'>
                  {(['up', 'left', 'right', 'down'] as const).map((dir) => (
                    <button
                      key={dir}
                      className={`dpad__key dpad__key--${dir}`}
                      onClick={() => add(dir)}
                      disabled={running || !canAdd(game, dir)}
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
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {view === 'settings' && (
        <footer className='footer'>
          <a href='/des-kids-games/'>{t.allGames}</a>
          <a href='https://github.com/mardesnic/des-robot'>{t.source}</a>
        </footer>
      )}
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
