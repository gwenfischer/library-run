/**
 * FallingCandyBar Class
 * 
 * A special candy bar that falls from the sky every 250 meters!
 * This gives the player a confidence boost to help them on their journey.
 * 
 * WHY a separate class from PowerUp?
 * - Falls from the sky (like WordBubble) instead of floating on ground
 * - Spawns at specific distance intervals (250m)
 * - Special visual effect to make it stand out
 * 
 * Behavior:
 * - Falls from above the screen
 * - Has a sparkly trail effect
 * - Boosts confidence by 15% when collected
 * - Plays a happy collect animation
 */
class FallingCandyBar extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How much confidence does collecting give?
    // WHY 15? Same as regular power-ups, meaningful boost!
    static CONFIDENCE_BOOST = 15;
    
    // How fast does the candy bar fall?
    // WHY 150? Slower than word bubbles (250) so player can catch it
    static FALL_SPEED = 150;
    
    // Slight horizontal drift for more interesting movement
    static DRIFT_SPEED = 20;
    
    // How often do these spawn? (in meters)
    static SPAWN_INTERVAL_METERS = 250;
    
    // Convert to pixels (10 pixels per meter)
    static SPAWN_INTERVAL_PIXELS = 250 * 10;  // 2500 pixels
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new falling candy bar
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - X position (where it will fall)
     * @param {number} y - Y position (usually above screen, like -50)
     */
    constructor(scene, x, y) {
        // Use the chocolate power-up texture
        super(scene, x, y, 'powerup-chocolate');
        
        this.scene = scene;
        
        // Track state
        this.isCollected = false;
        this.isDestroyed = false;
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up the candy bar
        this.setupCandyBar();
        
        // Create sparkle trail
        this.createSparkleTrail();
        
        // Set up player collision
        this.setupPlayerCollision();
        
        // Set up auto-cleanup when off screen
        this.setupCleanup();
        
        console.log('🍫⬇️ Falling candy bar appeared! Catch it for +15% confidence!');
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the candy bar physics
     */
    setupCandyBar() {
        // Set physics body size
        this.body.setSize(32, 32);
        
        // Get game speed multiplier for increased difficulty
        const speedMultiplier = this.scene.gameSpeedMultiplier || 1.0;
        
        // Set falling velocity
        this.setVelocityY(FallingCandyBar.FALL_SPEED * speedMultiplier);
        
        // Add slight horizontal drift (random direction) for visual interest
        const drift = Phaser.Math.Between(-FallingCandyBar.DRIFT_SPEED, FallingCandyBar.DRIFT_SPEED);
        this.setVelocityX(drift);
        
        // No gravity - constant speed fall
        this.body.setAllowGravity(false);
        
        // Set depth (above background, below UI)
        this.setDepth(30);
        
        // Scale up slightly to make it noticeable
        this.setScale(1.3);
        
        // Add a gentle rotation for fun
        this.rotationSpeed = Phaser.Math.Between(-2, 2);
    }
    
    /**
     * Create sparkle trail effect behind the falling candy
     */
    createSparkleTrail() {
        // Check if particle texture exists
        if (!this.scene.textures.exists('particle')) {
            console.log('⚠️ Particle texture not found for candy trail');
            return;
        }
        
        // Create particle emitter for sparkly trail
        this.trailEmitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 20, max: 50 },
            scale: { start: 0.4, end: 0 },
            alpha: { start: 0.8, end: 0 },
            lifespan: 400,
            frequency: 30,
            tint: [0xFFD700, 0xFFFF00, 0xFFA500]  // Gold, yellow, orange - yummy!
        });
        this.trailEmitter.setDepth(29);
        
        // Make trail follow the candy bar
        this.scene.events.on('update', this.updateTrailPosition, this);
    }
    
    /**
     * Keep the trail following the candy bar
     */
    updateTrailPosition() {
        if (this.isDestroyed || !this.trailEmitter) return;
        
        this.trailEmitter.setPosition(this.x, this.y + 15);
        
        // Apply rotation
        this.rotation += this.rotationSpeed * 0.01;
    }
    
    /**
     * Set up collision with player
     */
    setupPlayerCollision() {
        const player = this.scene.student;
        if (!player) return;
        
        this.scene.physics.add.overlap(
            this,
            player,
            this.collectCandyBar,
            null,
            this
        );
    }
    
    /**
     * Set up auto-cleanup when candy goes off screen
     */
    setupCleanup() {
        // Clean up if the candy bar falls off the bottom of the screen
        this.scene.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.isDestroyed) return;
                
                // If fallen below the screen, clean up
                if (this.y > 650) {
                    console.log('🍫 Candy bar missed! It fell off screen.');
                    this.cleanup();
                }
            },
            loop: true
        });
    }
    
    // =============================================================
    // COLLECTION
    // =============================================================
    
    /**
     * Called when player collects the candy bar
     * 
     * @param {FallingCandyBar} candyBar - This candy bar
     * @param {Student} player - The player
     */
    collectCandyBar(candyBar, player) {
        if (this.isCollected || this.isDestroyed) return;
        this.isCollected = true;
        
        console.log('🍫✨ Yum! Candy bar collected! +15% confidence!');
        
        // Give the player confidence boost
        if (player && player.heal) {
            player.heal(FallingCandyBar.CONFIDENCE_BOOST, 'Delicious Candy Bar');
        }
        
        // Show collection effect
        this.showCollectEffect();
        
        // Clean up
        this.cleanup();
    }
    
    /**
     * Show visual effect when collected
     */
    showCollectEffect() {
        // Create floating "+15%" text
        const collectText = this.scene.add.text(
            this.x,
            this.y,
            '+15% 🍫',
            {
                fontSize: '24px',
                fontFamily: 'Arial',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 3
            }
        );
        collectText.setOrigin(0.5);
        collectText.setDepth(150);
        
        // Animate floating up and fading
        this.scene.tweens.add({
            targets: collectText,
            y: this.y - 80,
            alpha: 0,
            scale: 1.5,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => collectText.destroy()
        });
        
        // Create burst of sparkles
        if (this.scene.textures.exists('particle')) {
            const burst = this.scene.add.particles(this.x, this.y, 'particle', {
                speed: { min: 100, max: 200 },
                scale: { start: 0.6, end: 0 },
                alpha: { start: 1, end: 0 },
                lifespan: 500,
                quantity: 20,
                tint: [0xFFD700, 0xFFFF00, 0xFFA500]
            });
            burst.setDepth(149);
            burst.explode();
            
            // Clean up burst emitter
            this.scene.time.delayedCall(600, () => burst.destroy());
        }
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the candy bar
     */
    cleanup() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        
        // Stop trail updates
        this.scene.events.off('update', this.updateTrailPosition, this);
        
        // Destroy trail emitter
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
            this.trailEmitter = null;
        }
        
        // Destroy self
        this.destroy();
    }
}
