/**
 * Squirrel Class
 * 
 * A sneaky squirrel that looks innocent at first, then reveals its true nature
 * with scary eyebrows and runs in front of the player!
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics (velocity, collision) for free!
 * - We can use all of Phaser's sprite methods
 * - Consistent with other obstacles in the game
 * 
 * Behavior:
 * 1. Appears looking cute and innocent
 * 2. After a moment, grows "scary" eyebrows
 * 3. Runs in front of the player (they must jump over!)
 * 4. Deals damage if the player touches it
 */
class Squirrel extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How much confidence does getting hit cost?
    // WHY 15? Slightly more than a newspaper - you should have seen it coming!
    static DAMAGE = 15;
    
    // How fast does the squirrel run?
    // WHY -180? Fast enough to be challenging, slow enough that jumping works
    static RUN_SPEED = -180;
    
    // How long before the squirrel turns "evil"? (milliseconds)
    // WHY 800? Gives the player time to notice it, but not too much reaction time
    static TRANSFORM_DELAY = 800;
    
    // How long does the squirrel stay innocent before running?
    // WHY 1200? Builds tension - "Is it going to... OH NO IT IS!"
    static START_RUNNING_DELAY = 1200;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new squirrel
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position (on the ground)
     */
    constructor(scene, x, y) {
        // Call parent constructor with the innocent squirrel texture
        super(scene, x, y, 'squirrel-innocent');
        
        // Store reference to scene
        this.scene = scene;
        
        // Add to the scene so it's visible
        scene.add.existing(this);
        
        // Enable physics
        scene.physics.add.existing(this);
        
        // Track state
        this.isEvil = false;      // Has it transformed yet?
        this.isRunning = false;   // Is it actively running?
        this.hasHitPlayer = false; // Prevent multiple hits
        this.isDestroyed = false;  // Safety flag for cleanup
        
        // Set up the squirrel
        this.setupSquirrel();
        
        // Start the behavior sequence
        this.startBehaviorSequence();
        
        console.log('🐿️ A cute squirrel appeared! ...or is it?');
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the squirrel's physics
     */
    setupSquirrel() {
        // Set physics body size
        this.body.setSize(25, 20);
        
        // Don't let it fall through the ground
        this.body.setAllowGravity(false);
        
        // Set depth so it appears in front of background
        this.setDepth(15);
        
        // Start with a cute "looking around" animation
        this.createIdleAnimation();
    }
    
    /**
     * Create a cute idle animation
     * 
     * WHY? Makes it look alive and innocent before the reveal
     */
    createIdleAnimation() {
        // Little head bob - so innocent!
        this.idleTween = this.scene.tweens.add({
            targets: this,
            y: this.y - 2,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Start the squirrel's behavior sequence
     * 
     * Timeline:
     * 1. Look innocent for a bit
     * 2. Transform to evil (grow scary eyebrows!)
     * 3. Start running toward the player
     */
    startBehaviorSequence() {
        // Step 1: After a short delay, transform to evil!
        this.scene.time.delayedCall(Squirrel.TRANSFORM_DELAY, () => {
            if (!this.isDestroyed) {
                this.transformToEvil();
            }
        });
        
        // Step 2: After transformation, start running!
        this.scene.time.delayedCall(Squirrel.START_RUNNING_DELAY, () => {
            if (!this.isDestroyed) {
                this.startRunning();
            }
        });
    }
    
    /**
     * Transform from innocent to EVIL!
     * 
     * WHY dramatic? It's funny and gives the player a "oh no!" moment
     */
    transformToEvil() {
        if (this.isDestroyed) return;
        
        console.log('🐿️😈 The squirrel reveals its true nature!');
        
        // Stop the cute animation
        if (this.idleTween) {
            this.idleTween.stop();
        }
        
        // Switch to evil texture
        this.setTexture('squirrel-evil');
        this.isEvil = true;
        
        // Dramatic shake effect
        this.scene.tweens.add({
            targets: this,
            x: this.x + 3,
            duration: 50,
            yoyo: true,
            repeat: 5
        });
        
        // Show an evil indicator
        this.showEvilIndicator();
    }
    
    /**
     * Show a visual indicator when the squirrel turns evil
     */
    showEvilIndicator() {
        if (this.isDestroyed) return;
        
        const indicator = this.scene.add.text(
            this.x,
            this.y - 30,
            '😈',
            { fontSize: '24px' }
        );
        indicator.setOrigin(0.5);
        indicator.setDepth(100);
        
        // Pop up and fade
        this.scene.tweens.add({
            targets: indicator,
            y: this.y - 50,
            alpha: 0,
            duration: 800,
            onComplete: () => indicator.destroy()
        });
    }
    
    /**
     * Start running toward the player!
     */
    startRunning() {
        if (this.isDestroyed) return;
        
        console.log('🐿️💨 The squirrel is running!');
        
        this.isRunning = true;
        
        // Face left (toward player)
        this.setFlipX(true);
        
        // Get game speed multiplier for increased difficulty
        const speedMultiplier = this.scene.gameSpeedMultiplier || 1.0;
        
        // Start running! (speed increases with game difficulty)
        this.setVelocityX(Squirrel.RUN_SPEED * speedMultiplier);
        
        // Create running animation (bouncy movement)
        this.runTween = this.scene.tweens.add({
            targets: this,
            y: this.y - 5,
            duration: 100,
            yoyo: true,
            repeat: -1
        });
        
        // Set up collision with player
        this.setupPlayerCollision();
        
        // Set up cleanup when off-screen
        this.setupCleanup();
    }
    
    /**
     * Set up collision detection with the player
     */
    setupPlayerCollision() {
        const player = this.scene.student;
        if (!player || this.isDestroyed) return;
        
        this.scene.physics.add.overlap(
            this,
            player,
            this.hitPlayer,
            null,
            this
        );
    }
    
    /**
     * Called when squirrel hits the player
     * 
     * @param {Squirrel} squirrel - This squirrel
     * @param {Student} player - The player that was hit
     */
    hitPlayer(squirrel, player) {
        // Prevent multiple hits
        if (this.hasHitPlayer || this.isDestroyed) return;
        this.hasHitPlayer = true;
        
        console.log('🐿️💥 The squirrel got you!');
        
        // Deal damage to player
        player.takeDamage(Squirrel.DAMAGE, 'Sneaky Squirrel');
        
        // The squirrel runs away faster after hitting
        this.setVelocityX(Squirrel.RUN_SPEED * 1.5);
        
        // Squirrel victory animation
        this.showVictoryMessage();
    }
    
    /**
     * Show a message when the squirrel successfully hits
     */
    showVictoryMessage() {
        if (this.isDestroyed) return;
        
        const message = this.scene.add.text(
            this.x,
            this.y - 25,
            '🥜!',  // Got your nuts! (confidence)
            { fontSize: '20px' }
        );
        message.setOrigin(0.5);
        message.setDepth(100);
        
        this.scene.tweens.add({
            targets: message,
            y: message.y - 20,
            alpha: 0,
            duration: 600,
            onComplete: () => message.destroy()
        });
    }
    
    // =============================================================
    // UPDATE METHOD
    // =============================================================
    
    /**
     * Update the squirrel each frame
     */
    update() {
        if (this.isDestroyed) return;
        
        // Check if we've run off the left side of the screen
        if (this.x < -50) {
            this.cleanup();
        }
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Set up automatic cleanup when squirrel leaves the screen
     */
    setupCleanup() {
        // Add update listener to check for off-screen
        this.scene.events.on('update', this.update, this);
    }
    
    /**
     * Clean up the squirrel
     */
    cleanup() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        
        console.log('🐿️ Squirrel ran away!');
        
        // Stop all tweens
        if (this.idleTween) this.idleTween.stop();
        if (this.runTween) this.runTween.stop();
        
        // Remove update listener
        this.scene.events.off('update', this.update, this);
        
        // Destroy the sprite
        this.destroy();
    }
}
