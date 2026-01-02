/**
 * PowerUp Class
 * 
 * Collectible items that restore confidence!
 * These tasty treats help the student feel better on their journey.
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics collision detection
 * - Easy to position and manage
 * - Consistent with other game objects
 * 
 * Power-ups available:
 * - Chocolate candy bar 🍫
 * - Caramel apple 🍎
 * Both give +15 confidence!
 */
class PowerUp extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How much confidence does collecting a power-up give?
    // WHY 15? Meaningful boost without being overpowered
    static CONFIDENCE_BOOST = 15;
    
    // Types of power-ups available
    static TYPES = ['chocolate', 'caramel-apple'];
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new power-up
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - X position
     * @param {number} y - Y position (on ground level)
     * @param {string} type - Type of power-up ('chocolate' or 'caramel-apple')
     */
    constructor(scene, x, y, type = null) {
        // Pick random type if not specified
        const powerUpType = type || Phaser.Math.RND.pick(PowerUp.TYPES);
        
        // Call parent constructor with appropriate texture
        super(scene, x, y, `powerup-${powerUpType}`);
        
        this.scene = scene;
        this.powerUpType = powerUpType;
        
        // Track state
        this.isCollected = false;
        this.isDestroyed = false;
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up the power-up
        this.setupPowerUp();
        
        // Create floating animation
        this.createFloatAnimation();
        
        // Create sparkle effect
        this.createSparkles();
        
        // Set up player collision
        this.setupPlayerCollision();
        
        console.log(`✨ Power-up spawned: ${powerUpType}!`);
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the power-up physics
     */
    setupPowerUp() {
        // Set physics body size
        this.body.setSize(25, 25);
        
        // No gravity - floats in place
        this.body.setAllowGravity(false);
        
        // Set depth (in front of background, behind UI)
        this.setDepth(20);
    }
    
    /**
     * Create a gentle floating animation
     * 
     * WHY float? Makes power-ups stand out and look magical!
     */
    createFloatAnimation() {
        this.scene.tweens.add({
            targets: this,
            y: this.y - 8,
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
        
        // Gentle rotation
        this.scene.tweens.add({
            targets: this,
            angle: { from: -5, to: 5 },
            duration: 1500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }
    
    /**
     * Create sparkle particles around the power-up
     */
    createSparkles() {
        // Check if particle texture exists
        if (!this.scene.textures.exists('particle')) return;
        
        this.sparkleEmitter = this.scene.add.particles(this.x, this.y, 'particle', {
            speed: { min: 20, max: 50 },
            angle: { min: 0, max: 360 },
            scale: { start: 0.4, end: 0 },
            lifespan: 600,
            frequency: 200,
            tint: [0xFFD700, 0xFFF8DC, 0xFFFFE0]  // Golden sparkles
        });
        this.sparkleEmitter.setDepth(19);
        
        // Make sparkles follow the power-up
        this.scene.events.on('update', this.updateSparklePosition, this);
    }
    
    /**
     * Keep sparkles following the power-up
     */
    updateSparklePosition() {
        if (this.isDestroyed || !this.sparkleEmitter) return;
        this.sparkleEmitter.setPosition(this.x, this.y);
    }
    
    /**
     * Set up collision detection with player
     */
    setupPlayerCollision() {
        const player = this.scene.student;
        if (!player) return;
        
        this.scene.physics.add.overlap(
            this,
            player,
            this.collect,
            null,
            this
        );
    }
    
    // =============================================================
    // COLLECTION
    // =============================================================
    
    /**
     * Called when player collects the power-up
     * 
     * @param {PowerUp} powerUp - This power-up
     * @param {Student} player - The player collecting it
     */
    collect(powerUp, player) {
        if (this.isCollected || this.isDestroyed) return;
        this.isCollected = true;
        
        // Get the name for the message
        const itemName = this.powerUpType === 'chocolate' ? 
            'Chocolate Bar' : 'Caramel Apple';
        
        console.log(`🍫 Collected ${itemName}! +${PowerUp.CONFIDENCE_BOOST} confidence!`);
        
        // Heal the player
        player.heal(PowerUp.CONFIDENCE_BOOST, itemName);
        
        // Show collection effect
        this.showCollectionEffect(itemName);
        
        // Play a satisfying "pop" animation before destroying
        this.playCollectionAnimation();
    }
    
    /**
     * Show visual effect when collected
     */
    showCollectionEffect(itemName) {
        // Create "+15" text that floats up
        const bonusText = this.scene.add.text(
            this.x,
            this.y - 20,
            `+${PowerUp.CONFIDENCE_BOOST}! 💚`,
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#4CAF50',
                fontStyle: 'bold',
                stroke: '#ffffff',
                strokeThickness: 3
            }
        );
        bonusText.setOrigin(0.5);
        bonusText.setDepth(100);
        
        // Float up and fade
        this.scene.tweens.add({
            targets: bonusText,
            y: bonusText.y - 50,
            alpha: 0,
            duration: 1000,
            ease: 'Power2',
            onComplete: () => bonusText.destroy()
        });
        
        // Item name below
        const nameText = this.scene.add.text(
            this.x,
            this.y,
            itemName,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#ffffff',
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 4, y: 2 }
            }
        );
        nameText.setOrigin(0.5);
        nameText.setDepth(100);
        
        this.scene.tweens.add({
            targets: nameText,
            y: nameText.y - 30,
            alpha: 0,
            duration: 800,
            delay: 200,
            onComplete: () => nameText.destroy()
        });
    }
    
    /**
     * Play the collection animation
     */
    playCollectionAnimation() {
        // Stop floating animation
        this.scene.tweens.killTweensOf(this);
        
        // Scale up and fade out
        this.scene.tweens.add({
            targets: this,
            scale: 1.5,
            alpha: 0,
            duration: 200,
            ease: 'Back.easeIn',
            onComplete: () => this.cleanup()
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the power-up
     */
    cleanup() {
        if (this.isDestroyed) return;
        this.isDestroyed = true;
        
        // Remove update listener
        this.scene.events.off('update', this.updateSparklePosition, this);
        
        // Destroy sparkles
        if (this.sparkleEmitter) {
            this.sparkleEmitter.destroy();
        }
        
        // Destroy self
        this.destroy();
    }
}
