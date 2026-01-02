/**
 * PowerUpManager Class
 * 
 * Manages the spawning of power-ups throughout the game!
 * Power-ups appear approximately every 60 meters, with bonus spawns
 * after difficult sections like the Dottie Bacon school.
 * 
 * WHY a manager class?
 * - Centralizes power-up logic in one place
 * - Easy to adjust spawn rates and timing
 * - Can trigger bonus spawns from other game events
 */
class PowerUpManager {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // Base spawn interval in meters
    // WHY 60? Gives regular boosts without being too frequent
    static SPAWN_INTERVAL_METERS = 60;
    
    // Pixels per meter (based on distance UI calculation)
    static PIXELS_PER_METER = 10;
    
    // Spawn interval in pixels
    static SPAWN_INTERVAL = 60 * 10;  // 600 pixels
    
    // Y position for power-ups (floating above ground)
    // WHY 520? Visible and reachable, floating above ground level
    static SPAWN_Y = 520;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create the power-up manager
     * 
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Track spawned power-ups
        this.powerUps = [];
        
        // Track spawned falling candy bars
        this.fallingCandyBars = [];
        
        // Track distance for spawning regular power-ups
        this.lastSpawnDistance = 0;
        
        // Track distance for spawning falling candy bars (every 250m)
        this.lastCandyBarDistance = 0;
        
        // Track if bonus spawn is pending
        this.bonusSpawnPending = false;
        
        console.log('✨ PowerUpManager initialized - treats every ~60m, candy bars every 250m!');
    }
    
    // =============================================================
    // UPDATE METHOD
    // =============================================================
    
    /**
     * Update the manager - check if we should spawn a power-up
     * 
     * @param {number} currentDistance - Current distance traveled in pixels
     */
    update(currentDistance) {
        // Check if we've traveled far enough for a new regular power-up
        const distanceSinceLastSpawn = currentDistance - this.lastSpawnDistance;
        
        if (distanceSinceLastSpawn >= PowerUpManager.SPAWN_INTERVAL) {
            this.spawnPowerUp();
            this.lastSpawnDistance = currentDistance;
        }
        
        // Check if we've traveled far enough for a falling candy bar (every 250m = 2500px)
        const distanceSinceLastCandyBar = currentDistance - this.lastCandyBarDistance;
        
        // Debug every 500 pixels
        if (Math.floor(currentDistance / 500) > Math.floor((currentDistance - 10) / 500)) {
            console.log(`🍫 DEBUG: distance=${Math.floor(currentDistance)}, lastCandyBar=${this.lastCandyBarDistance}, since=${Math.floor(distanceSinceLastCandyBar)}, need=${FallingCandyBar.SPAWN_INTERVAL_PIXELS}`);
        }
        
        if (distanceSinceLastCandyBar >= FallingCandyBar.SPAWN_INTERVAL_PIXELS) {
            this.spawnFallingCandyBar();
            this.lastCandyBarDistance = currentDistance;
        }
        
        // Check for bonus spawn
        if (this.bonusSpawnPending) {
            this.spawnPowerUp();
            this.bonusSpawnPending = false;
        }
        
        // Clean up off-screen power-ups
        this.cleanupOffScreen();
    }
    
    // =============================================================
    // SPAWN METHODS
    // =============================================================
    
    /**
     * Spawn a regular power-up at a random position ahead of the player
     */
    spawnPowerUp() {
        // Spawn ahead of the player, off the right side of the screen
        const spawnX = 850 + Phaser.Math.Between(0, 100);
        
        // Create the power-up
        const powerUp = new PowerUp(
            this.scene,
            spawnX,
            PowerUpManager.SPAWN_Y
        );
        
        // Track it
        this.powerUps.push(powerUp);
        
        console.log(`✨ Power-up spawned at x=${spawnX}!`);
    }
    
    /**
     * Spawn a falling candy bar from the sky!
     * These appear every 250 meters as a special treat.
     */
    spawnFallingCandyBar() {
        console.log('🍫 spawnFallingCandyBar() called!');
        
        // Spawn at a random X position within the visible area
        // So player has a chance to catch it!
        const spawnX = Phaser.Math.Between(200, 600);
        const spawnY = -50;  // Above the screen
        
        console.log(`🍫 Creating FallingCandyBar at x=${spawnX}, y=${spawnY}`);
        
        // Create the falling candy bar
        const candyBar = new FallingCandyBar(
            this.scene,
            spawnX,
            spawnY
        );
        
        console.log('🍫 FallingCandyBar created:', candyBar);
        
        // Track it
        this.fallingCandyBars.push(candyBar);
        
        // Show announcement
        this.showCandyBarAnnouncement();
    }
    
    /**
     * Show a brief announcement when a candy bar appears
     */
    showCandyBarAnnouncement() {
        const announcement = this.scene.add.text(
            400, 100,
            '🍫 CANDY BAR! 🍫',
            {
                fontSize: '28px',
                fontFamily: 'Arial',
                color: '#FFD700',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 4,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: { x: 15, y: 8 }
            }
        );
        announcement.setOrigin(0.5);
        announcement.setDepth(200);
        announcement.setScrollFactor(0);
        
        // Animate in and out
        announcement.setAlpha(0);
        announcement.setScale(0.5);
        
        this.scene.tweens.add({
            targets: announcement,
            alpha: 1,
            scale: 1,
            duration: 300,
            ease: 'Back.easeOut',
            yoyo: true,
            hold: 1000,
            onComplete: () => announcement.destroy()
        });
    }
    
    /**
     * Schedule a bonus power-up spawn
     * 
     * WHY bonus spawns?
     * - Rewards player after difficult sections
     * - Helps recovery after Dottie Bacon school zone
     * - Adds variety to spawn timing
     */
    scheduleBonusSpawn() {
        console.log('✨ Bonus power-up incoming (after difficult section)!');
        this.bonusSpawnPending = true;
    }
    
    /**
     * Force spawn a power-up immediately at a specific X position
     * 
     * @param {number} x - X position to spawn at
     */
    forceSpawn(x) {
        const powerUp = new PowerUp(
            this.scene,
            x,
            PowerUpManager.SPAWN_Y
        );
        this.powerUps.push(powerUp);
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Remove power-ups that have gone off the left side of the screen
     */
    cleanupOffScreen() {
        // Clean up regular power-ups
        this.powerUps = this.powerUps.filter(powerUp => {
            if (!powerUp || powerUp.isDestroyed) {
                return false;
            }
            
            // If off the left side, destroy it
            if (powerUp.x < -50) {
                powerUp.cleanup();
                return false;
            }
            
            return true;
        });
        
        // Clean up falling candy bars that have been destroyed
        this.fallingCandyBars = this.fallingCandyBars.filter(candyBar => {
            return candyBar && !candyBar.isDestroyed;
        });
    }
    
    /**
     * Clean up all power-ups
     */
    cleanup() {
        // Clean up regular power-ups
        this.powerUps.forEach(powerUp => {
            if (powerUp && !powerUp.isDestroyed) {
                powerUp.cleanup();
            }
        });
        this.powerUps = [];
        
        // Clean up falling candy bars
        this.fallingCandyBars.forEach(candyBar => {
            if (candyBar && !candyBar.isDestroyed) {
                candyBar.cleanup();
            }
        });
        this.fallingCandyBars = [];
    }
}
