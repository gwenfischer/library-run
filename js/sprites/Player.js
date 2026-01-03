/**
 * Student Class (Player)
 * 
 * This is our hero! The determined student on their way to the library.
 * They must dodge obstacles while maintaining their confidence!
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics (gravity, velocity, collisions) for free!
 * - We can use all of Phaser's sprite methods
 * - Perfect for a side-scrolling platformer character
 * 
 * NOTE: Currently using a green rectangle as a placeholder.
 * We'll replace this with actual sprite art later!
 */
class Student extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // These are the same for ALL students (class-level constants)
    // =============================================================
    
    // Movement speed (pixels per second)
    // WHY 200? Feels responsive but not too fast for a side-scroller
    static MOVE_SPEED = 200;
    
    // Jump power (negative because Y-axis is inverted in Phaser!)
    // WHY -360? Reduced by 20% for shorter, more controlled jumps
    static JUMP_POWER = -360;
    
    // Starting confidence (our HP system!)
    // WHY 100? It's a nice round number and easy to think in percentages
    static MAX_CONFIDENCE = 100;
    
    // =============================================================
    // JUMP ASSIST SETTINGS
    // Small helpers to make jumps feel responsive (but still a challenge!)
    // =============================================================
    
    // Coyote time - milliseconds you can still jump after leaving the ground
    // WHY 75ms? A small grace period - helps with timing without being too forgiving
    static COYOTE_TIME = 75;
    
    // Jump buffer - milliseconds to remember a jump press before landing
    // WHY 100ms? Catches good anticipation, doesn't save sloppy play
    static JUMP_BUFFER_TIME = 100;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new Student
     * 
     * @param {Phaser.Scene} scene - The scene this student belongs to
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position
     * 
     * WHY these parameters?
     * - scene: We need to know which scene to add the student to
     * - x, y: Every game object needs a starting position!
     */
    constructor(scene, x, y) {
        // Call the parent class constructor
        // WHY 'player-happy'? Start with the happy/confident expression!
        super(scene, x, y, 'player-happy');
        
        // Store a reference to the scene
        // WHY? We'll need to access scene methods later (like adding particles)
        this.scene = scene;
        
        // Add this sprite to the scene so it's visible
        // WHY? Without this, the student would exist in memory but not appear!
        scene.add.existing(this);
        
        // Enable physics for this sprite
        // WHY? We need physics for jumping, gravity, and collisions
        scene.physics.add.existing(this);
        
        // Set up the student's properties and controls
        this.setupStudent();
        this.setupControls();
        
        console.log('🎒 Student created and ready for their journey!');
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the student's physics properties
     * 
     * WHY a separate method?
     * - Keeps the constructor clean and readable
     * - Makes it easy to find where properties are set
     * - Can be called again if we need to reset the student
     */
    setupStudent() {
        // Don't let the student fall through the floor or walk off screen
        this.setCollideWorldBounds(true);
        
        // Set the physics body size
        // WHY? The collision box should match our placeholder rectangle
        this.body.setSize(40, 60);
        
        // Initialize confidence (our HP!)
        this.confidence = Student.MAX_CONFIDENCE;
        
        // Track if we're on the ground (for jumping)
        // WHY? We only want to allow jumping when touching the ground
        this.isOnGround = false;
        
        // Track if we're currently stumbling (for invincibility frames)
        // WHY? Prevents getting hit multiple times in quick succession
        this.isStumbling = false;
        
        // Track if the student has been defeated (confidence = 0)
        // WHY? When defeated, we disable player controls and auto-walk back to school
        this.isDefeated = false;
        
        // =============================================================
        // JUMP ASSIST VARIABLES
        // These track timing for coyote time and jump buffering
        // =============================================================
        
        // Coyote time tracker - how long since we were last on ground
        // WHY? Allows jumping briefly after walking off a ledge
        this.timeSinceGrounded = 0;
        
        // Jump buffer tracker - how long since jump was pressed
        // WHY? Remembers jump presses so you can press slightly early
        this.timeSinceJumpPressed = Infinity;
        
        // Track if we've used our coyote jump
        // WHY? Prevents infinite coyote jumps!
        this.usedCoyoteJump = false;
        
        // Set some drag so the player doesn't slide forever
        // WHY 1000? High drag = player stops quickly when you release keys
        this.body.setDrag(1000, 0);
        
        // Give the student a slight bounce when landing
        // WHY 0.1? Just a tiny bounce - makes it feel more alive
        this.setBounce(0.1);
    }
    
    /**
     * Set up keyboard controls
     * 
     * WHY a separate method?
     * - Input setup is complex enough to deserve its own function
     * - Easy to modify controls later (add gamepad, touch, etc.)
     * - Clear separation of concerns
     */
    setupControls() {
        // Create cursor keys (arrow keys)
        // WHY cursor keys? They're intuitive and comfortable for most players
        this.cursors = this.scene.input.keyboard.createCursorKeys();
        
        // Also add WASD for players who prefer it
        // WHY WASD? Many gamers prefer this layout, and it's easy to add!
        this.wasd = {
            up: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
        
        // Add spacebar as an alternative jump button
        // WHY? Spacebar is a classic jump key!
        this.spaceBar = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        
        // Touch controls reference (set later by the scene)
        // WHY null initially? TouchControls are created after the player
        this.touchControls = null;
        
        console.log('⌨️ Controls ready: Arrow Keys or WASD to move, Up/W/Space to jump');
    }
    
    /**
     * Set the touch controls reference
     * 
     * @param {TouchControls} touchControls - The touch controls instance
     * 
     * WHY a separate method?
     * - TouchControls are created after the player in the scene
     * - Keeps the connection between player and touch controls clear
     */
    setTouchControls(touchControls) {
        this.touchControls = touchControls;
        console.log('📱 Touch controls connected to player');
    }
    
    // =============================================================
    // UPDATE METHOD
    // Called every frame by the scene's update function
    // =============================================================
    
    /**
     * Update the student each frame
     * 
     * WHY have an update method?
     * - We need to check for input every frame
     * - Movement needs to be smooth and continuous
     * - This is called by the scene's update() function
     */
    update() {
        // Get delta time for frame-rate independent timing
        // WHY? So jump assists work consistently regardless of frame rate
        const delta = this.scene.game.loop.delta;
        
        // Update jump assist timers
        this.updateJumpTimers(delta);
        
        // Handle all movement input
        this.handleMovement();
        
        // Check if we're on the ground (for jump logic)
        this.updateGroundedState();
    }
    
    /**
     * Update the jump assist timers
     * 
     * @param {number} delta - Time since last frame in milliseconds
     * 
     * WHY track these timers?
     * - Coyote time: lets you jump briefly after walking off an edge
     * - Jump buffer: remembers jump presses so you can press slightly early
     */
    updateJumpTimers(delta) {
        // Increment time since jump was pressed
        this.timeSinceJumpPressed += delta;
        
        // Track time since we were last grounded
        if (this.body.blocked.down) {
            // We're on the ground - reset coyote timer
            this.timeSinceGrounded = 0;
            this.usedCoyoteJump = false;
            
            // Check for buffered jump (player pressed jump before landing)
            if (this.timeSinceJumpPressed < Student.JUMP_BUFFER_TIME) {
                this.jump();
                this.timeSinceJumpPressed = Infinity; // Clear the buffer
            }
        } else {
            // We're in the air - increment coyote timer
            this.timeSinceGrounded += delta;
        }
    }
    
    // =============================================================
    // MOVEMENT METHODS
    // Each method does ONE thing - keeping it simple!
    // =============================================================
    
    /**
     * Handle all movement input
     * 
     * WHY separate from update?
     * - Keeps update() clean
     * - Easy to disable movement when needed (cutscenes, menus, etc.)
     */
    handleMovement() {
        // If defeated, auto-walk back to school instead of player control
        // WHY? The "walk of shame" back to school is part of the game over sequence
        if (this.isDefeated) {
            this.handleDefeatWalk();
            return;
        }
        
        // Handle horizontal movement (left/right)
        this.handleHorizontalMovement();
        
        // Handle jumping
        this.handleJump();
    }
    
    /**
     * Handle the sad walk back to school when defeated
     * 
     * WHY a separate method?
     * - Keeps the defeat behavior isolated and easy to modify
     * - Clear what's happening in the code
     */
    handleDefeatWalk() {
        // Walk slowly to the left (back to school)
        // WHY slower than normal? It's a sad, dejected walk
        this.setVelocityX(-Student.MOVE_SPEED * 0.5);
        
        // Face left (toward school)
        this.setFlipX(true);
        
        // Check if we've walked off screen
        // WHY check this? We need to trigger the game over screen
        if (this.x < -50) {
            this.onWalkedOffScreen();
        }
    }
    
    /**
     * Called when the defeated student has walked off the left side of screen
     * 
     * WHY a separate method?
     * - Easy to customize what happens (game over screen, restart prompt)
     */
    onWalkedOffScreen() {
        // Only trigger once
        if (this.hasTriggeredGameOver) {
            return;
        }
        this.hasTriggeredGameOver = true;
        
        console.log('📚 Maybe tomorrow will be better...');
        
        // Tell the scene to show the game over screen
        // WHY use an event? Keeps Player and Scene loosely coupled
        this.scene.events.emit('gameOver');
    }
    
    /**
     * Handle left and right movement
     * 
     * WHY check both arrow keys AND WASD?
     * - Player choice! Some prefer arrows, some prefer WASD
     * - Both work the same way
     * WHY also check touch controls?
     * - iPad and mobile users need touch buttons!
     */
    handleHorizontalMovement() {
        // Check for left input (LEFT arrow or A key or left touch button)
        const isMovingLeft = this.cursors.left.isDown || 
                            this.wasd.left.isDown ||
                            (this.touchControls && this.touchControls.isLeftPressed());
        
        // Check for right input (RIGHT arrow or D key or right touch button)
        const isMovingRight = this.cursors.right.isDown || 
                             this.wasd.right.isDown ||
                             (this.touchControls && this.touchControls.isRightPressed());
        
        if (isMovingLeft) {
            this.moveLeft();
        } else if (isMovingRight) {
            this.moveRight();
        } else {
            // No horizontal input - let drag slow us down
            // WHY not set velocity to 0? Drag creates smoother stopping
            this.stopHorizontalMovement();
        }
    }
    
    /**
     * Move the student to the left
     * 
     * WHY such a simple function?
     * - Clear what it does from the name
     * - Easy to modify later (add animation, sound, particles)
     * - Can be called from multiple places
     */
    moveLeft() {
        this.setVelocityX(-Student.MOVE_SPEED);
        
        // Flip the sprite to face left
        // WHY flipX? It mirrors the sprite horizontally
        this.setFlipX(true);
    }
    
    /**
     * Move the student to the right
     */
    moveRight() {
        this.setVelocityX(Student.MOVE_SPEED);
        
        // Face right (not flipped)
        this.setFlipX(false);
    }
    
    /**
     * Stop horizontal movement
     * 
     * WHY set velocity to 0?
     * - Combined with drag, this creates a nice stopping feel
     * - Player stops quickly but not instantly
     */
    stopHorizontalMovement() {
        // Let the physics drag slow us down naturally
        // The drag we set in setupStudent() handles this!
    }
    
    /**
     * Handle jump input
     * 
     * WHY check multiple keys?
     * - UP arrow, W key, and SPACEBAR all feel natural for jumping
     * - Player can use whatever they prefer!
     * WHY also check touch controls?
     * - iPad and mobile users need a jump button!
     */
    handleJump() {
        // Check for jump input (keyboard or touch)
        const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                           Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                           Phaser.Input.Keyboard.JustDown(this.spaceBar) ||
                           (this.touchControls && this.touchControls.isJumpJustPressed());
        
        // WHY JustDown instead of isDown?
        // - JustDown only triggers once per key press
        // - Prevents "turbo jumping" if you hold the button
        
        if (jumpPressed) {
            // Record when jump was pressed (for jump buffering)
            this.timeSinceJumpPressed = 0;
            this.tryToJump();
        }
    }
    
    /**
     * Attempt to make the student jump
     * 
     * WHY "try" to jump?
     * - Player can only jump when on the ground (or within coyote time!)
     * - This function checks if jumping is allowed
     */
    tryToJump() {
        // Can we jump? Check multiple conditions:
        // 1. Currently on the ground, OR
        // 2. Within coyote time (just left the ground) and haven't used it yet
        
        const canRegularJump = this.isOnGround;
        const canCoyoteJump = !this.usedCoyoteJump && 
                              this.timeSinceGrounded < Student.COYOTE_TIME;
        
        if (canRegularJump || canCoyoteJump) {
            // If using coyote jump, mark it as used
            if (!canRegularJump && canCoyoteJump) {
                this.usedCoyoteJump = true;
                console.log('🐺 Coyote jump!'); // Named after the cartoon coyote who runs off cliffs!
            }
            this.jump();
        }
    }
    
    /**
     * Perform the actual jump
     * 
     * WHY separate from tryToJump?
     * - tryToJump checks IF we can jump
     * - jump() does the actual jumping
     * - Separation of concerns!
     */
    jump() {
        // Apply upward velocity
        // WHY negative? In Phaser, Y increases downward, so negative = up
        this.setVelocityY(Student.JUMP_POWER);
        
        // We're no longer on the ground
        this.isOnGround = false;
        
        // Clear the jump buffer since we just jumped
        this.timeSinceJumpPressed = Infinity;
        
        // TODO: Add jump sound effect
        console.log('🦘 Jump!');
    }
    
    /**
     * Update whether the student is on the ground
     * 
     * WHY track this?
     * - We need to know if jumping is allowed
     * - body.blocked.down tells us if something is below us
     */
    updateGroundedState() {
        // Check if the student's feet are touching something below
        // WHY body.blocked.down? Phaser sets this when colliding with something below
        this.isOnGround = this.body.blocked.down;
    }
    
    // =============================================================
    // CONFIDENCE (HP) METHODS
    // =============================================================
    
    /**
     * Take damage to confidence
     * 
     * @param {number} amount - How much confidence to lose
     * @param {string} reason - What caused the damage (for UI feedback)
     * 
     * WHY track the reason?
     * - We can show different messages based on what hit us
     * - More engaging feedback for the player!
     * 
     * @returns {boolean} True if damage was taken, false if blocked (invincibility)
     */
    takeDamage(amount, reason = 'Unknown') {
        // Check if we're currently stumbling (invincibility frames)
        // WHY? Prevents unfair rapid damage from multiple hits
        if (this.isStumbling) {
            console.log('🛡️ Still stumbling - damage blocked!');
            return false;
        }
        
        this.confidence -= amount;
        
        // Don't let confidence go below 0
        // WHY? Negative confidence doesn't make sense!
        if (this.confidence < 0) {
            this.confidence = 0;
        }
        
        console.log(`💔 Ouch! Lost ${amount} confidence from: ${reason}`);
        console.log(`   Remaining confidence: ${this.confidence}%`);
        
        // Update the confidence meter UI if connected
        // WHY check if it exists? The meter might not be set up yet
        if (this.confidenceMeter) {
            this.confidenceMeter.updateConfidence(-amount);
        }
        
        // Update facial expression based on new confidence level
        this.updateExpression();
        
        // Visual feedback - stumble effect
        this.flashDamage();
        
        // Check if game over
        if (this.confidence <= 0) {
            this.onConfidenceDepleted();
        }
        
        return true;
    }
    
    /**
     * Heal confidence
     * 
     * @param {number} amount - How much confidence to restore
     * @param {string} reason - What caused the healing
     */
    heal(amount, reason = 'Unknown') {
        this.confidence += amount;
        
        // Don't exceed max confidence
        // WHY? Can't be MORE than 100% confident!
        if (this.confidence > Student.MAX_CONFIDENCE) {
            this.confidence = Student.MAX_CONFIDENCE;
        }
        
        console.log(`💚 Nice! Gained ${amount} confidence from: ${reason}`);
        console.log(`   Current confidence: ${this.confidence}%`);
        
        // Update the confidence meter UI if connected
        if (this.confidenceMeter) {
            this.confidenceMeter.updateConfidence(amount);
        }
        
        // Update facial expression based on new confidence level
        this.updateExpression();
        
        // Visual feedback - flash green
        this.flashHeal();
    }
    
    /**
     * Update the student's facial expression based on confidence
     * 
     * WHY change expressions?
     * - Visual feedback that matches the confidence meter
     * - Makes the character feel more alive and relatable
     * - Player can see at a glance how their character feels!
     */
    updateExpression() {
        // Get confidence as a percentage
        const confidencePercent = this.getConfidencePercent();
        
        // Threshold for switching expressions
        // WHY 50%? Gives a clear midpoint - above = happy, below = worried
        const HAPPY_THRESHOLD = 0.5;
        
        // Determine which texture to use
        const shouldBeHappy = confidencePercent >= HAPPY_THRESHOLD;
        const currentTexture = this.texture.key;
        const targetTexture = shouldBeHappy ? 'player-happy' : 'player-sad';
        
        // Only change if different (prevents unnecessary texture swaps)
        if (currentTexture !== targetTexture) {
            this.setTexture(targetTexture);
            console.log(shouldBeHappy ? '😊 Feeling confident!' : '😟 Getting worried...');
        }
    }
    
    /**
     * Flash red when taking damage
     * 
     * WHY visual feedback?
     * - Players need to know when they're hit
     * - Makes the game feel more responsive
     */
    flashDamage() {
        // Use the stumble effect for more impactful feedback
        this.stumble();
    }
    
    /**
     * Play a "stumble" effect when hit
     * 
     * WHY stumble?
     * - More descriptive than just flashing red
     * - Shows the student is shaken but not defeated
     * - Multiple visual cues: tint, shake, and brief slowdown
     */
    stumble() {
        // Prevent multiple stumbles overlapping
        if (this.isStumbling) return;
        this.isStumbling = true;
        
        // 1. Tint the sprite red/orange (embarrassed/hurt)
        this.setTint(0xFF6B6B);
        
        // 2. Create a shake/wobble effect
        // WHY tween? Smooth animation that doesn't interrupt physics
        this.scene.tweens.add({
            targets: this,
            angle: { from: -10, to: 10 },
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Sine.easeInOut',
            onComplete: () => {
                this.angle = 0;  // Reset rotation
            }
        });
        
        // 3. Brief "knocked back" effect
        // WHY small knockback? Gives physical feedback without being unfair
        const knockbackDirection = this.flipX ? 1 : -1;  // Push away from facing direction
        this.setVelocityX(knockbackDirection * 100);
        
        // 4. Flash alpha (blink effect) for brief invincibility visual
        this.scene.tweens.add({
            targets: this,
            alpha: 0.5,
            duration: 100,
            yoyo: true,
            repeat: 2
        });
        
        // 5. Clear effects after stumble duration
        this.scene.time.delayedCall(400, () => {
            this.clearTint();
            this.alpha = 1;
            this.isStumbling = false;
        });
        
        console.log('😵 Student stumbled!');
    }
    
    /**
     * Flash green when healing
     * 
     * WHY visual feedback?
     * - Players should know when they gain confidence too!
     * - Positive reinforcement feels good
     */
    flashHeal() {
        // Tint the sprite green
        this.setTint(0x00ff00);
        
        // Remove the tint after a short delay
        this.scene.time.delayedCall(150, () => {
            this.clearTint();
        });
    }
    
    /**
     * Called when confidence reaches 0
     * 
     * WHY a separate method?
     * - Game over logic might get complex
     * - Easy to find and modify
     */
    onConfidenceDepleted() {
        // Don't trigger twice
        // WHY? Prevents weird behavior if takeDamage is called multiple times at 0
        if (this.isDefeated) {
            return;
        }
        
        console.log('😢 Confidence depleted! Time to head back to school...');
        
        // Mark the student as defeated
        // WHY? This flag changes how handleMovement works
        this.isDefeated = true;
        this.hasTriggeredGameOver = false;
        
        // Stop any current movement
        this.setVelocity(0, 0);
        
        // Switch to sad expression
        // WHY? Visually shows the player has lost
        this.setTexture('player-sad');
        
        // Disable world bounds so we can walk off screen
        // WHY? We need to walk off the left side for the "walk of shame"
        this.setCollideWorldBounds(false);
        
        // Visual feedback - turn slightly transparent
        // WHY? Makes it clear the player has lost control
        this.setAlpha(0.8);
        
        // Play a "defeated" animation - sink down a little then get back up
        // WHY? Adds emotional weight to the moment
        this.scene.tweens.add({
            targets: this,
            y: this.y + 10,      // Sink down (dejected)
            duration: 300,
            yoyo: true,         // Come back up
            onComplete: () => {
                // After the "defeated" pose, start walking left
                console.log('😔 Walking back to school...');
            }
        });
    }
    
    /**
     * Get the current confidence as a percentage (0-1)
     * 
     * WHY a getter method?
     * - Useful for UI (confidence meter display)
     * - Encapsulates the calculation
     * 
     * @returns {number} Confidence as a decimal (0.0 to 1.0)
     */
    getConfidencePercent() {
        return this.confidence / Student.MAX_CONFIDENCE;
    }
}
