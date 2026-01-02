/**
 * Newspaper Class
 * 
 * A projectile thrown by the grumpy Old Man!
 * Newspapers arc through the air and damage the student's confidence on contact.
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics (gravity, velocity) for free!
 * - We get collision detection built in
 * - We can use all of Phaser's sprite methods
 * 
 * Based on CONTEXT.md:
 * - Damage: -10 Confidence
 * - Pattern: Throws in an arc at regular intervals
 * - Dodge Strategy: Jump over or duck under
 */
class Newspaper extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How much confidence does getting hit cost?
    // WHY 10? Based on CONTEXT.md - newspapers are the "lightest" obstacle
    static DAMAGE = 10;
    
    // Horizontal speed of the newspaper
    // WHY 220? Fast enough to keep you on your toes, slow enough to dodge with practice
    static HORIZONTAL_SPEED = 220;
    
    // Initial upward velocity (creates the arc)
    // WHY -200? Creates a nice readable arc you can time your jumps to
    static VERTICAL_SPEED = -200;
    
    // Gravity applied to the newspaper
    // WHY 400? Makes it arc naturally, like a real thrown object
    static GRAVITY = 400;
    
    // Spin speed (degrees per second)
    // WHY 360? One full rotation per second looks good
    static SPIN_SPEED = 360;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new newspaper projectile
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - Starting X position (where the old man is)
     * @param {number} y - Starting Y position
     * @param {number} targetX - X position to aim toward (usually the player)
     */
    constructor(scene, x, y, targetX) {
        // Call parent constructor with the newspaper texture
        super(scene, x, y, 'newspaper');
        
        // Store reference to scene
        this.scene = scene;
        
        // Add to the scene so it's visible
        scene.add.existing(this);
        
        // Enable physics
        scene.physics.add.existing(this);
        
        // Set up the newspaper's behavior
        this.setupNewspaper(targetX);
        
        // Start spinning!
        this.startSpinning();
        
        // Set up automatic cleanup
        this.setupCleanup();
        
        console.log('📰 Newspaper thrown!');
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the newspaper's physics and trajectory
     * 
     * @param {number} targetX - X position to aim toward
     */
    setupNewspaper(targetX) {
        // Set the physics body size to match the sprite
        this.body.setSize(30, 20);
        
        // Get game speed multiplier for increased difficulty
        const speedMultiplier = this.scene.gameSpeedMultiplier || 1.0;
        
        // Determine throw direction based on target position
        // WHY check targetX? So we throw TOWARD the player, not away
        const throwDirection = targetX > this.x ? 1 : -1;
        
        // Set velocity - horizontal toward player, vertical up (for arc)
        // WHY apply speedMultiplier? Game gets faster over time!
        this.setVelocity(
            Newspaper.HORIZONTAL_SPEED * throwDirection * speedMultiplier,
            Newspaper.VERTICAL_SPEED * speedMultiplier
        );
        
        // Apply gravity so the newspaper arcs down
        // WHY setGravityY? Overrides the scene's gravity for this object
        this.body.setGravityY(Newspaper.GRAVITY);
        
        // Set depth so it appears above background but can go behind player
        this.setDepth(5);
        
        // Flip sprite if throwing right (newspaper faces direction of travel)
        if (throwDirection > 0) {
            this.setFlipX(true);
        }
    }
    
    /**
     * Make the newspaper spin as it flies
     * 
     * WHY spin? 
     * - Looks more dynamic and realistic
     * - Visual feedback that it's a thrown object
     * - Newspapers spin when thrown in real life!
     */
    startSpinning() {
        // Set angular velocity (rotation speed)
        this.setAngularVelocity(Newspaper.SPIN_SPEED);
    }
    
    /**
     * Set up automatic cleanup when the newspaper goes off-screen
     * 
     * WHY cleanup?
     * - Newspapers that miss shouldn't stay in memory forever
     * - Prevents memory leaks and performance issues
     * - Keeps the game running smoothly
     */
    setupCleanup() {
        // Track if we've been destroyed
        // WHY? Prevents errors when update fires after destruction
        this.isDestroyed = false;
        
        // Store reference to the update event so we can remove it later
        this.updateListener = () => {
            // Safety check - don't run if already destroyed
            if (this.isDestroyed) return;
            this.checkBounds();
        };
        
        // Check bounds every frame
        this.scene.events.on('update', this.updateListener);
    }
    
    /**
     * Check if the newspaper is off-screen and should be destroyed
     */
    checkBounds() {
        // Safety check - make sure scene still exists
        if (!this.scene || !this.scene.game) return;
        
        // Check if off-screen (with buffer)
        // WHY buffer of 100? So it doesn't disappear right at the edge
        const isOffScreen = 
            this.x < -100 || 
            this.x > this.scene.game.config.width + 100 ||
            this.y > this.scene.game.config.height + 100;
        
        if (isOffScreen) {
            this.cleanup();
        }
    }
    
    // =============================================================
    // COLLISION METHODS
    // =============================================================
    
    /**
     * Called when this newspaper hits the player
     * 
     * @param {Student} player - The student that was hit
     * 
     * WHY a separate hit method?
     * - Keeps collision logic in one place
     * - Easy to add effects (sound, particles) later
     * - Other code just calls newspaper.hitPlayer(player)
     */
    hitPlayer(player) {
        // Reduce player confidence
        player.takeDamage(Newspaper.DAMAGE, 'Newspaper');
        
        // Create a small "impact" effect
        this.createImpactEffect();
        
        // Remove the newspaper
        this.cleanup();
    }
    
    /**
     * Create a visual effect when hitting something
     */
    createImpactEffect() {
        // Create some "paper scatter" particles
        // WHY? Visual feedback that the hit registered
        const particles = this.scene.add.particles(this.x, this.y, 'newspaper', {
            speed: { min: 50, max: 150 },
            scale: { start: 0.3, end: 0 },
            lifespan: 300,
            quantity: 5,
            angle: { min: 0, max: 360 }
        });
        
        // Auto-destroy the particle emitter after it's done
        this.scene.time.delayedCall(500, () => {
            particles.destroy();
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the newspaper and remove it from the game
     * 
     * WHY a cleanup method?
     * - Need to remove event listeners to prevent memory leaks
     * - Centralizes all cleanup logic
     */
    cleanup() {
        // Mark as destroyed FIRST to stop any pending updates
        this.isDestroyed = true;
        
        // Remove the update listener
        if (this.updateListener && this.scene && this.scene.events) {
            this.scene.events.off('update', this.updateListener);
            this.updateListener = null;
        }
        
        // Destroy the sprite
        this.destroy();
    }
}
