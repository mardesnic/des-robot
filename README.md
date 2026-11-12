# Robot

A free puzzle game for young kids that works offline. The robot needs to get to its battery: line up arrow cards, press Go, and watch the robot follow them one step at a time. Every level is new, and every level can be solved.

Made for ages 5 and up. There is no timer and no way to lose. When the robot bumps into a rock, the card that bumped turns red, the robot goes back to the start, and you fix the program.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-robot/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- New levels made on your device, in four sizes:
  - **Very easy**: a 4×4 board, a few rocks, 3 to 5 steps
  - **Easy**: a 5×5 board where rocks are in the way
  - **Medium**: a 6×6 board with stars to pick up first, and cards that hold up to three of the same arrow
  - **Hard**: a wall with a locked door, a key to find, and only one spare card slot
- Arrow cards, not turn-left/turn-right, so young kids can play
- From Medium up, pressing the same arrow again puts it on the same card, so a card shows one arrow for each step; while the robot plays, the arrow for its step lights up
- Tap a card to take it away; the back button takes away the last arrow pressed
- The next level never starts and ends in the same place as the one just played
- A count of levels solved at each size
- Keyboard play on a computer: arrow keys add cards, Backspace removes the last, Enter runs
- Picks up where you left off after a reload
- Keeps the screen on while you play
- In English and Croatian, following the phone's language unless you pick one
- Light and dark mode
- No ads, accounts or tracking

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # generator, simulator, solver and translation tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.
