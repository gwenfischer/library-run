# Library Run

A 2D side-scrolling action game about a student racing from school to the library while dodging quirky neighborhood hazards and keeping their confidence high. See the full creative brief in [CONTEXT.md](CONTEXT.md).

## Premise
- Make it from school to the library before closing while managing a confidence meter instead of health.
- Confidence drops when obstacles hit; it rises when you dodge hazards or grab power-ups.
- Reach the library with any confidence left to win.

## World and Obstacles
- Newspaper-throwing old man: arcing projectiles that chip confidence.
- Sidewalk squirrels: fast, erratic runners that trip you up.
- Bullying kids: stationary groups launching word-bubble insults.
- Pooping bird: overhead drops that hurt confidence the most.
- Power-ups: candy and treats that restore confidence.

## Core Mechanic: Confidence Meter
- Functions as HP; depletes to game over, arrives >0 for victory.
- Gains on successful dodges, checkpoints, and power-ups; losses on hits.

## Tech Stack
- Phaser 3 from CDN (no installs needed).
- Plain HTML + JavaScript (ES6+) loaded directly in the browser.

## Project Layout
```
index.html          # Launch point that wires Phaser and game scripts
CONTEXT.md          # Full game design/context document
README.md           # This file
js/
  Background.js
  managers/PowerUpManager.js
  sprites/
    Player.js
    OldMan.js
    Bully.js
    PowerUp.js
    FallingCandyBar.js
    obstacles/
      Newspaper.js
      Squirrel.js
      WordBubble.js
  ui/ConfidenceMeter.js
  zones/
    DottieBaconSchool.js
    BlueberrydaleLibrary.js
```

## How to Run
### Quick launch (no install)
1) Open a file explorer to this folder.
2) Double-click `index.html` to open it in your browser.

### Local web server (avoids browser file-permission quirks)
1) Open a terminal at the project root.
2) Run `python -m http.server 8000` (Python comes with most systems).
3) In your browser, visit `http://localhost:8000/` and the game will load.

## Tips for Iteration
- Edit scripts under `js/` and refresh the browser to see changes.
- If assets or future scenes are added, include their scripts in `index.html` in the correct order (dependencies first).
- Use Phaser's arcade physics debug flag (`physics.arcade.debug: true`) in `index.html` config if you need to visualize hitboxes while tuning collisions.
