# 🏃‍♀️ Library Run - Game Context Document

> *A comprehensive guide for developing "Library Run" - a 2D side-scrolling action game*

---

## 📖 The Premise

**Library Run** follows the journey of a determined student walking from school to the local library to do their homework. What seems like a simple trip becomes an epic adventure filled with unexpected challenges!

The student must navigate through a neighborhood full of quirky obstacles while maintaining their **confidence** to reach their destination. Will they make it to the library with enough self-assurance to tackle their homework? That's up to you!

### Story Hook
> *"It's 3:30 PM. School just ended. You have a big project due tomorrow and the library closes at 6. The sidewalk stretches ahead of you... but the neighborhood has other plans."*

---

## 🎭 The Vibe

### Tone: Humorous, Quirky, and Empowering

| Aspect | Description |
|--------|-------------|
| **Humor** | The obstacles are absurd and exaggerated. An old man with a vendetta against students? Squirrels with attitude? A bird with impeccable aim? It's all meant to make you laugh! |
| **Quirky** | Nothing is taken too seriously. The world is colorful and slightly ridiculous. Characters have personality, even the enemies. |
| **Empowering** | Despite the chaos, our hero perseveres! The game celebrates determination, resilience, and the noble pursuit of doing homework on time. |

### Art Direction (Suggested)
- Bright, cheerful colors
- Cartoonish character designs
- Exaggerated animations (think Saturday morning cartoons)
- Comic-style effects for impacts ("BONK!", "SPLAT!", "EEK!")

### Sound Direction (Suggested)
- Upbeat, playful background music
- Silly sound effects
- Encouraging audio cues when dodging obstacles
- Comical "oof" sounds when hit

---

## 💪 The Core Mechanic: Confidence Meter

### What is the Confidence Meter?

The **Confidence Meter** is this game's version of HP (Health Points). Instead of "health" or "lives," our student has **confidence** — because let's be honest, that's what really gets challenged on the way to do homework!

### How It Works

```
[😊😊😊😊😊😊😊😊😊😊] 100% - "I've GOT this!"
[😊😊😊😊😊😊😊___] 70% - "Still feeling good!"
[😊😊😊😊😊_____] 50% - "Okay, this is harder than I thought..."
[😊😊😊_______] 30% - "Maybe I should just go home..."
[😊_________] 10% - "Why did I even try?!"
[__________] 0% - GAME OVER - "I'll do homework tomorrow..."
```

### Confidence Mechanics

| Event | Effect | Message (Example) |
|-------|--------|-------------------|
| **Hit by newspaper** | -10 Confidence | "Ouch! That headline hurt!" |
| **Tripped by squirrel** | -15 Confidence | "Betrayed by nature!" |
| **Bullied by kids** | -20 Confidence | "Words hurt too..." |
| **Pooped on by bird** | -25 Confidence | "This day just got worse!" |
| **Dodge an obstacle** | +2 Confidence | "Nice moves!" |
| **Collect power-up** | +15 Confidence | "Feeling better!" |
| **Reach checkpoint** | +10 Confidence | "Almost there!" |

### Game Over Condition
When the Confidence Meter reaches **0%**, the student gives up and turns around to go home. The game ends with a humorous "defeated" animation and an encouraging message to try again.

### Victory Condition
Reach the library doors with any amount of confidence remaining! Bonus points for arriving with high confidence.

---

## 🚧 The Obstacles

### 1. 📰 The Newspaper-Throwing Old Man

**Description:** A grumpy elderly gentleman sits on his porch, convinced that "kids these days" are up to no good. His weapon of choice? Rolled-up newspapers thrown with surprising accuracy.

| Property | Value |
|----------|-------|
| Damage | -10 Confidence |
| Pattern | Throws newspapers in an arc at regular intervals |
| Speed | Medium |
| Dodge Strategy | Jump over or duck under |

**Personality Notes:**
- Wears reading glasses and a cardigan
- Mutters things like "Get off my sidewalk!"
- Has an endless supply of newspapers (don't question it)

---

### 2. 🐿️ The Sidewalk Squirrels

**Description:** These aren't your average cute, fluffy squirrels. These are territorial urban squirrels who've claimed the sidewalk as their domain. They dart unpredictably across your path!

| Property | Value |
|----------|-------|
| Damage | -15 Confidence |
| Pattern | Random, erratic movement across the sidewalk |
| Speed | Fast (they're squirrels!) |
| Dodge Strategy | Time your jumps carefully |

**Personality Notes:**
- Tiny but mighty
- Sometimes stop to stare at you menacingly
- May be hoarding acorns (collectible power-ups?)

---

### 3. 👊 The Bullying Kids

**Description:** A group of kids who think they're cooler than everyone else. They stand in clusters and throw mean comments (visualized as speech bubbles) that hurt your confidence.

| Property | Value |
|----------|-------|
| Damage | -20 Confidence |
| Pattern | Stationary groups that throw insults when you're in range |
| Speed | Their words travel medium-fast |
| Dodge Strategy | Jump over the speech bubbles or run past quickly |

**Personality Notes:**
- Travel in groups of 2-3
- Wear "too cool for school" outfits
- Their insults are silly and non-specific ("Nice backpack... NOT!")

---

### 4. 🐦 The Pooping Bird

**Description:** A pigeon flying overhead with impeccable (and unfortunate) timing. It's not personal... or is it?

| Property | Value |
|----------|-------|
| Damage | -25 Confidence (it's really embarrassing!) |
| Pattern | Flies overhead, drops "bombs" at intervals |
| Speed | Drops fall fast! |
| Dodge Strategy | Watch the shadow and move! |

**Personality Notes:**
- Looks innocent but knows exactly what it's doing
- Makes a distinctive cooing sound as a warning
- The poop leaves a splat effect on the ground

---

## 🛠️ Tech Stack

### Core Technologies

| Technology | Version/Source | Purpose |
|------------|----------------|---------|
| **Phaser 3** | CDN (latest stable) | Game framework |
| **HTML5** | - | Page structure & Canvas |
| **JavaScript** | ES6+ | Game logic |

### Why Phaser 3 via CDN?

1. **Simplicity** - No build tools, no npm, no bundlers. Just include a script tag and start coding!
2. **Beginner-Friendly** - Perfect for learning game development
3. **Powerful** - Despite the simple setup, Phaser 3 is a full-featured game engine
4. **Great Documentation** - Extensive examples and community support

### Basic HTML Setup

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Library Run</title>
    <style>
        /* Center the game canvas */
        body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background-color: #2c3e50;
        }
    </style>
</head>
<body>
    <!-- Phaser 3 from CDN - No installation needed! -->
    <script src="https://cdn.jsdelivr.net/npm/phaser@3/dist/phaser.min.js"></script>
    
    <!-- Our game files -->
    <script src="js/scenes/BootScene.js"></script>
    <script src="js/scenes/MenuScene.js"></script>
    <script src="js/scenes/GameScene.js"></script>
    <script src="js/sprites/Player.js"></script>
    <script src="js/sprites/Obstacle.js"></script>
    <script src="js/main.js"></script>
</body>
</html>
```

### Suggested Project Structure

```
Library Run/
│
├── index.html              # Main HTML file
├── CONTEXT.md              # This file!
├── README.md               # Setup instructions
│
├── assets/                 # All game assets
│   ├── images/            
│   │   ├── player/        # Player sprites
│   │   ├── obstacles/     # Obstacle sprites
│   │   ├── background/    # Background layers
│   │   └── ui/            # UI elements
│   │
│   └── audio/             
│       ├── music/         # Background music
│       └── sfx/           # Sound effects
│
└── js/                     # All JavaScript files
    ├── main.js            # Phaser game configuration
    │
    ├── scenes/            # Game scenes
    │   ├── BootScene.js   # Asset loading
    │   ├── MenuScene.js   # Title screen
    │   ├── GameScene.js   # Main gameplay
    │   └── GameOverScene.js
    │
    ├── sprites/           # Game objects
    │   ├── Player.js      # Player class
    │   └── obstacles/     # Obstacle classes
    │       ├── Newspaper.js
    │       ├── Squirrel.js
    │       ├── Bully.js
    │       └── Bird.js
    │
    └── ui/                # UI components
        └── ConfidenceMeter.js
```

---

## 📝 Code Style Guide

### Philosophy

> *"Code is read more often than it is written. Write for your future self and your teammates!"*

Since this is a learning project with a young developer, we prioritize:
1. **Readability** over cleverness
2. **Comments** that explain the "why," not just the "what"
3. **Small functions** that do one thing well
4. **Descriptive names** that tell a story

---

### ES6 Classes

We use ES6 Classes to organize our code. Each game object gets its own class!

```javascript
/**
 * Player Class
 * 
 * This is our hero! The student on their way to the library.
 * 
 * WHY use a class?
 * - Keeps all player-related code in one place
 * - Makes it easy to create the player with 'new Player()'
 * - Lets us use 'this' to access player properties
 */
class Player extends Phaser.Physics.Arcade.Sprite {
    
    /**
     * Create a new player
     * 
     * @param {Phaser.Scene} scene - The scene this player belongs to
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * 
     * WHY these parameters?
     * - scene: We need to know which scene to add the player to
     * - x, y: Every sprite needs a starting position!
     */
    constructor(scene, x, y) {
        // 'super' calls the parent class constructor
        // WHY? Phaser.Physics.Arcade.Sprite needs these to set up properly
        super(scene, x, y, 'player');
        
        // Add this sprite to the scene
        // WHY? Without this, the player would exist but not be visible!
        scene.add.existing(this);
        
        // Enable physics for this sprite
        // WHY? We need physics for jumping, collisions, and gravity
        scene.physics.add.existing(this);
        
        // Set up player properties
        this.setupPlayer();
    }
    
    /**
     * Configure player properties
     * 
     * WHY a separate method?
     * - Keeps the constructor clean and readable
     * - Makes it easy to find where properties are set
     * - We can call this again if we need to reset the player
     */
    setupPlayer() {
        // Don't let the player fall through the floor
        this.setCollideWorldBounds(true);
        
        // How fast can the player move?
        this.moveSpeed = 200;
        
        // How high can the player jump?
        this.jumpPower = -400;  // Negative because Y goes up in Phaser!
        
        // Is the player currently able to jump?
        this.canJump = true;
    }
}
```

---

### Small, Focused Functions

Each function should do ONE thing. If you're using the word "and" to describe what a function does, it might need to be split up!

```javascript
// ❌ BAD: This function does too many things!
function updatePlayer() {
    // Check input AND move player AND check collisions AND update animation...
    // This is hard to read and hard to debug!
}

// ✅ GOOD: Each function has one job!

/**
 * Handle all player input
 * 
 * WHY separate input handling?
 * - Input logic can get complex
 * - Easy to add new controls later
 * - Easy to disable controls when needed (cutscenes, menus)
 */
function handleInput() {
    if (cursors.left.isDown) {
        moveLeft();
    } else if (cursors.right.isDown) {
        moveRight();
    }
    
    if (cursors.up.isDown) {
        tryToJump();
    }
}

/**
 * Move the player to the left
 * 
 * WHY such a simple function?
 * - Clear what it does from the name
 * - Easy to modify later (add animation, sound, etc.)
 * - Can be called from multiple places
 */
function moveLeft() {
    player.setVelocityX(-player.moveSpeed);
    player.flipX = true;  // Face left
}

/**
 * Move the player to the right
 */
function moveRight() {
    player.setVelocityX(player.moveSpeed);
    player.flipX = false;  // Face right
}

/**
 * Attempt to make the player jump
 * 
 * WHY "try" to jump?
 * - Player can only jump when on the ground
 * - This function checks if jumping is allowed
 */
function tryToJump() {
    // Only jump if we're touching the ground
    // WHY? No double-jumping in this game (unless we add it as a power-up!)
    if (player.body.touching.down) {
        player.setVelocityY(player.jumpPower);
    }
}
```

---

### Comment Style Guide

```javascript
// =============================================================
// SECTION HEADERS look like this
// Use them to divide your code into logical sections
// =============================================================

/**
 * JSDOC COMMENTS for functions and classes
 * 
 * Always include:
 * - What the function does
 * - @param tags for each parameter
 * - @returns tag if it returns something
 * - WHY this function exists (the important part!)
 */
function exampleFunction(param1, param2) {
    // INLINE COMMENTS explain tricky lines
    // Start with WHY when the code isn't obvious
    
    // WHY multiply by 2? Because we want the effect to be twice as strong
    // when the player has the power-up active
    const adjustedValue = baseValue * 2;
    
    return adjustedValue;
}

// TODO: Use these for things you plan to add later
// TODO: Add sound effect when player jumps

// FIXME: Use these for known issues
// FIXME: Player can sometimes double-jump, need to investigate

// NOTE: Use these for important information
// NOTE: This value must match the sprite sheet dimensions
```

---

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Classes | PascalCase | `Player`, `NewspaperObstacle` |
| Functions | camelCase | `handleInput()`, `updateConfidence()` |
| Variables | camelCase | `playerSpeed`, `confidenceLevel` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_CONFIDENCE`, `GRAVITY` |
| Private properties | _prefixUnderscore | `_internalState` |
| Boolean variables | is/has/can prefix | `isJumping`, `hasShield`, `canMove` |

---

### Example: Complete Obstacle Class

```javascript
/**
 * Newspaper Class
 * 
 * Represents a newspaper thrown by the grumpy old man.
 * Newspapers arc through the air and damage the player's confidence on contact.
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics (gravity, velocity) for free!
 * - We get collision detection built in
 * - We can use all of Phaser's sprite methods
 */
class Newspaper extends Phaser.Physics.Arcade.Sprite {
    
    // How much confidence does getting hit cost?
    // WHY static? It's the same for ALL newspapers
    static DAMAGE = 10;
    
    /**
     * Create a new newspaper projectile
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - Starting X position (where the old man is)
     * @param {number} y - Starting Y position
     * @param {number} targetX - Where to aim (usually the player!)
     */
    constructor(scene, x, y, targetX) {
        super(scene, x, y, 'newspaper');
        
        // Add to the scene so it's visible
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Calculate the throw!
        this.calculateThrow(targetX);
        
        // Spin the newspaper as it flies
        // WHY? It looks cool and newspapers spin when thrown!
        this.startSpinning();
        
        // Clean up when off screen
        // WHY? We don't want hundreds of newspapers eating up memory
        this.setupCleanup(scene);
    }
    
    /**
     * Calculate the velocity needed to reach the target
     * 
     * WHY separate this logic?
     * - The math is complex enough to deserve its own function
     * - We might want to adjust the throw arc later
     * - Makes testing easier
     */
    calculateThrow(targetX) {
        // Horizontal speed - aim toward the player
        // WHY negative? The old man throws from right to left
        const horizontalSpeed = -300;
        
        // Vertical speed - arc upward first, then fall
        // WHY negative? In Phaser, negative Y is UP
        const verticalSpeed = -200;
        
        this.setVelocity(horizontalSpeed, verticalSpeed);
        
        // Let gravity pull it back down
        // WHY 400? It feels good - not too floaty, not too fast
        this.setGravityY(400);
    }
    
    /**
     * Make the newspaper spin in the air
     */
    startSpinning() {
        // Rotate 360 degrees per second
        // WHY? Visual feedback that it's a thrown object
        this.setAngularVelocity(360);
    }
    
    /**
     * Set up automatic cleanup when off screen
     * 
     * @param {Phaser.Scene} scene - The game scene
     */
    setupCleanup(scene) {
        // Check every frame if we're off screen
        scene.events.on('update', () => {
            // WHY check x < -50? Give a little buffer past the screen edge
            if (this.x < -50 || this.y > scene.game.config.height + 50) {
                this.destroy();  // Remove from memory
            }
        });
    }
    
    /**
     * Called when this newspaper hits the player
     * 
     * @param {Player} player - The player that was hit
     * 
     * WHY a separate hit method?
     * - Keeps collision logic in one place
     * - Can add effects (sound, particles) easily
     * - Other code just calls newspaper.hitPlayer(player)
     */
    hitPlayer(player) {
        // Reduce player confidence
        player.confidence -= Newspaper.DAMAGE;
        
        // Visual feedback
        // WHY flash? So the player knows they got hit
        player.flashRed();
        
        // Sound feedback
        // TODO: Add "oof" sound effect
        
        // Remove the newspaper
        this.destroy();
    }
}
```

---

## 🎮 Gameplay Flow

```
┌─────────────────┐
│   TITLE SCREEN  │
│  "Library Run"  │
│  [Press Start]  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   GAME START    │
│ Confidence: 100%│
│ Outside school  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    GAMEPLAY     │◄──────────────┐
│ Run & Dodge     │               │
│ Obstacles!      │               │
└────────┬────────┘               │
         │                        │
    ┌────┴────┐                   │
    ▼         ▼                   │
┌───────┐ ┌───────────┐           │
│ HIT!  │ │  DODGE!   │           │
│  -HP  │ │   +2 HP   │           │
└───┬───┘ └─────┬─────┘           │
    │           │                 │
    └─────┬─────┘                 │
          │                       │
    ┌─────┴─────┐                 │
    ▼           ▼                 │
┌───────┐  ┌─────────┐            │
│HP = 0 │  │ HP > 0  │            │
└───┬───┘  └────┬────┘            │
    │           │                 │
    │      ┌────┴────┐            │
    │      ▼         ▼            │
    │  ┌───────┐ ┌────────┐       │
    │  │LIBRARY│ │CONTINUE│───────┘
    │  │REACHED│ └────────┘
    │  └───┬───┘
    │      │
    ▼      ▼
┌───────────────────┐
│    GAME OVER      │
│ ┌───────────────┐ │
│ │ LOSE: Go Home │ │
│ │ WIN: Library! │ │
│ └───────────────┘ │
│   [Play Again?]   │
└───────────────────┘
```

---

## 🚀 Getting Started

### Step 1: Set Up the Project
1. Create the folder structure shown above
2. Download placeholder images (or draw your own!)
3. Create `index.html` with the Phaser CDN link

### Step 2: Create the Boot Scene
- Load all assets (images, audio)
- Show a loading bar
- Transition to the menu when done

### Step 3: Create the Menu Scene
- Display the game title
- Show "Press SPACE to Start"
- Transition to the game scene

### Step 4: Create the Player
- Make them move left/right
- Add jumping
- Add the confidence meter

### Step 5: Add Obstacles (One at a Time!)
1. Start with newspapers (simplest arc pattern)
2. Add squirrels (ground movement)
3. Add bullies (stationary, projectile speech)
4. Add the bird (aerial threat)

### Step 6: Polish!
- Add sound effects
- Add particle effects
- Add a victory screen
- Add a high score system

---

## 📚 Helpful Resources

- [Phaser 3 Documentation](https://photonstorm.github.io/phaser3-docs/)
- [Phaser 3 Examples](https://phaser.io/examples)
- [Free Game Assets - OpenGameArt](https://opengameart.org/)
- [Free Sound Effects - Freesound](https://freesound.org/)

---

## 💡 Future Ideas

- [ ] Power-ups (Coffee for speed boost, Headphones to block bully insults)
- [ ] Multiple levels (different routes to the library)
- [ ] Boss battle (the school mascot?)
- [ ] Collectible homework pages for bonus points
- [ ] Character customization
- [ ] Two-player mode

---

*Happy coding! Remember: every expert was once a beginner. You've got this! 📚✨*
