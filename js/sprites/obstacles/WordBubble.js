/**
 * WordBubble Class
 * 
 * A mean word bubble that falls like a meteor from the bullies!
 * These contain hurtful words that damage the student's confidence.
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics (gravity, velocity) for free!
 * - Collision detection built in
 * - Consistent with other obstacles
 * 
 * Behavior:
 * - Falls from above like a meteor
 * - Contains mean words ("loser!", "dork!", etc.)
 * - Damages confidence on contact
 * - Has a "meteor trail" effect
 */
class WordBubble extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How much confidence does getting hit cost?
    // WHY 12? Words hurt! More than newspapers, but survivable
    static DAMAGE = 12;
    
    // How fast do the bubbles fall?
    // WHY 250? Fast enough to be threatening, slow enough to dodge
    static FALL_SPEED = 250;
    
    // Slight horizontal drift
    // WHY drift? Makes the trajectory less predictable
    static DRIFT_SPEED = 30;
    
    // The mean messages bullies say
    // WHY these? Classic bully taunts + the rival school name
    static MESSAGES = [
        'loser!',
        'dork!',
        'nerd!',
        'weirdo!',
        'Dottie Bacon\nRULES!',
        'go home!',
        'ha ha!',
        'you stink!'
    ];
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new word bubble meteor
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - Starting X position
     * @param {number} y - Starting Y position (usually above screen)
     * @param {string} message - The mean message to display (optional, random if not provided)
     */
    constructor(scene, x, y, message = null) {
        // Call parent constructor with word bubble texture
        super(scene, x, y, 'wordbubble');
        
        // Store reference to scene
        this.scene = scene;
        
        // Pick a random message if none provided
        this.message = message || Phaser.Math.RND.pick(WordBubble.MESSAGES);
        
        // Track state
        this.hasHitPlayer = false;
        this.isDestroyed = false;
        
        // Add to the scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up the word bubble
        this.setupWordBubble();
        
        // Create the text on the bubble
        this.createMessageText();
        
        // Create meteor trail effect
        this.createMeteorTrail();
        
        // Set up cleanup
        this.setupCleanup();
        
        console.log(`💬 Word bubble: "${this.message}"`);
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the word bubble physics
     */
    setupWordBubble() {
        // Set physics body size
        this.body.setSize(60, 40);
        
        // Get game speed multiplier for increased difficulty
        const speedMultiplier = this.scene.gameSpeedMultiplier || 1.0;
        
        // Set falling velocity (faster as game speeds up)
        this.setVelocityY(WordBubble.FALL_SPEED * speedMultiplier);
        
        // Add slight horizontal drift (random direction)
        const drift = Phaser.Math.Between(-WordBubble.DRIFT_SPEED, WordBubble.DRIFT_SPEED);
        this.setVelocityX(drift * speedMultiplier);
        
        // No gravity - constant speed fall
        this.body.setAllowGravity(false);
        
        // Set depth
        this.setDepth(25);
        
        // Start slightly rotated for "meteor" effect
        this.setRotation(Phaser.Math.DegToRad(Phaser.Math.Between(-15, 15)));
        
        // Slight wobble as it falls
        this.scene.tweens.add({
            targets: this,
            rotation: this.rotation + Phaser.Math.DegToRad(10),
            duration: 200,
            yoyo: true,
            repeat: -1
        });
    }
    
    /**
     * Create the text that appears on the bubble
     */
    createMessageText() {
        // Create text centered on the bubble
        this.messageText = this.scene.add.text(
            this.x,
            this.y,
            this.message,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#8B0000',  // Dark red - mean!
                fontStyle: 'bold',
                align: 'center'
            }
        );
        this.messageText.setOrigin(0.5);
        this.messageText.setDepth(26);
        
        // Make text follow the bubble
        this.scene.events.on('update', this.updateTextPosition, this);
    }
    
    /**
     * Keep the text following the bubble
     */
    updateTextPosition() {
        if (this.isDestroyed || !this.messageText) return;
        
        this.messageText.x = this.x;
        this.messageText.y = this.y;
        this.messageText.rotation = this.rotation;
    }
    
    /**
     * Create a meteor trail effect behind the bubble
     */
    createMeteorTrail() {
        // Create particles for the trail
        // WHY particles? Makes it look like an angry meteor!
        this.trailEmitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 10, max: 30 },
            angle: { min: 250, max: 290 },  // Upward (trail behind)
            scale: { start: 0.5, end: 0 },
            lifespan: 300,
            frequency: 50,
            tint: [0xFF6B6B, 0xFF8E8E, 0xFFAAAA]  // Red-ish angry colors
        });
        this.trailEmitter.setDepth(24);
        
        // Make trail follow the bubble
        this.scene.events.on('update', this.updateTrailPosition, this);
    }
    
    /**
     * Keep the trail following the bubble
     */
    updateTrailPosition() {
        if (this.isDestroyed || !this.trailEmitter) return;
        
        this.trailEmitter.setPosition(this.x, this.y - 20);
    }
    
    /**
     * Set up collision with player
     * 
     * @param {Student} player - The player to check collision with
     */
    setupPlayerCollision(player) {
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
     * Called when word bubble hits the player
     * Can be called two ways:
     * 1. From Phaser overlap: hitPlayer(bubble, player) - where bubble is this
     * 2. Directly: hitPlayer(player)
     * 
     * @param {WordBubble|Student} bubbleOrPlayer - Either this bubble (from overlap) or the player (direct call)
     * @param {Student} [maybePlayer] - The player (only when called from overlap)
     */
    hitPlayer(bubbleOrPlayer, maybePlayer) {
        if (this.hasHitPlayer || this.isDestroyed) return;
        this.hasHitPlayer = true;
        
        // Handle both calling patterns
        // If maybePlayer exists, we're being called from Phaser overlap (bubble, player)
        // If not, bubbleOrPlayer IS the player (direct call)
        const player = maybePlayer || bubbleOrPlayer;
        
        // Safety check - make sure we have a valid player
        if (!player || !player.takeDamage) {
            console.log('⚠️ WordBubble hit but no valid player reference');
            this.cleanup();
            return;
        }
        
        console.log(`💬💥 Hit by mean words: "${this.message}"`);
        
        // Deal damage
        player.takeDamage(WordBubble.DAMAGE, `Mean words: "${this.message}"`);
        
        // Show impact effect
        this.showHitEffect();
        
        // Destroy the bubble
        this.cleanup();
    }
    
    /**
     * Show visual effect when hitting player
     */
    showHitEffect() {
        // Create a "burst" of the mean word
        const burstText = this.scene.add.text(
            this.x,
            this.y,
            this.message,
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#FF0000',
                fontStyle: 'bold'
            }
        );
        burstText.setOrigin(0.5);
        burstText.setDepth(100);
        
        // Animate the burst
        this.scene.tweens.add({
            targets: burstText,
            scale: 1.5,
            alpha: 0,
            y: burstText.y - 30,
            duration: 500,
            onComplete: () => burstText.destroy()
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Set up automatic cleanup when off-screen
     */
    setupCleanup() {
        this.scene.events.on('update', this.checkOffScreen, this);
    }
    
    /**
     * Check if bubble has fallen off screen
     */
    checkOffScreen() {
        if (this.isDestroyed) return;
        
        // If fallen below the screen, destroy
        if (this.y > 700) {
            this.cleanup();
        }
    }
    
    /**
     * Clean up the word bubble
     */
    cleanup() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        
        // Remove update listeners
        this.scene.events.off('update', this.updateTextPosition, this);
        this.scene.events.off('update', this.updateTrailPosition, this);
        this.scene.events.off('update', this.checkOffScreen, this);
        
        // Destroy the text
        if (this.messageText) {
            this.messageText.destroy();
        }
        
        // Destroy the trail
        if (this.trailEmitter) {
            this.trailEmitter.destroy();
        }
        
        // Destroy self
        this.destroy();
    }
}
