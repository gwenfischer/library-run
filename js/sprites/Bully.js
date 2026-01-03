/**
 * Bully Class (NPC Enemy) - PATROL PATTERN
 * 
 * Mean kids from Dottie Bacon School who throw word bubble meteors!
 * They're FASTER and more aggressive than the Old Man!
 * 
 * PATROL PATTERN:
 * 1. Enter from EITHER side (unpredictable!) with "!" warning
 * 2. Charge toward player while throwing word bubbles
 * 3. Exit the OPPOSITE side
 * 4. Wait, then re-enter from a random side
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - Consistent with other game objects
 * - Physics for movement
 */
class Bully extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How often does the bully throw word bubbles? (milliseconds)
    // WHY 2000? Faster than old man - bullies are aggressive!
    static THROW_INTERVAL = 2000;
    
    // Walking speed (pixels per second)
    // WHY 100? Faster than old man - they're young and energetic!
    static PATROL_SPEED = 100;
    
    // Maximum throws per patrol
    // WHY 4? More than before since they're charging through
    static MAX_THROWS = 4;
    
    // Screen boundaries
    static SCREEN_LEFT = -80;
    static SCREEN_RIGHT = 880;
    
    // Spawn offset (how far off-screen to start)
    static SPAWN_OFFSET = 100;
    
    // How long to wait before re-entering? (milliseconds)
    // WHY 4-7 seconds? Faster cycle than old man
    static REENTRY_TIME_MIN = 4000;
    static REENTRY_TIME_MAX = 7000;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new Bully NPC
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - X position (ignored - will spawn off-screen)
     * @param {number} y - Y position (on ground)
     * @param {boolean} startFromRight - Whether to start from right side
     */
    constructor(scene, x, y, startFromRight = true) {
        // Start off-screen using camera-relative coordinates
        // This fixes the bug where bullies disappear when player moves left
        const camera = scene.cameras.main;
        const startX = startFromRight ? 
            camera.scrollX + camera.width + Bully.SPAWN_OFFSET : 
            camera.scrollX - Bully.SPAWN_OFFSET;
        
        super(scene, startX, y, 'bully');
        
        this.scene = scene;
        this.groundY = y;
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up the bully
        this.setupBully();
        
        // Track word bubbles
        this.wordBubbles = [];
        
        // =============================================================
        // PATROL STATE
        // =============================================================
        
        // Current state: 'entering', 'charging', 'exiting', 'waiting'
        this.currentState = 'waiting';
        
        // Direction: 1 = moving right, -1 = moving left
        this.patrolDirection = startFromRight ? -1 : 1;
        
        // Track throw count per patrol
        this.throwCount = 0;
        
        // First warning shown?
        this.firstWarningShown = false;
        
        // Track pending timers so we can cancel them on cleanup
        this.pendingTimers = [];
        
        // Flag to track if bully has been destroyed (for safety checks in callbacks)
        this.isDestroyed = false;
        
        // Start entering after a delay (staggered with other bullies)
        const entryDelay = Phaser.Math.Between(500, 2000);
        const entryTimer = this.scene.time.delayedCall(entryDelay, () => {
            if (this.isDestroyed || !this.active || !this.body) return;  // Safety check - already destroyed
            this.startEntering();
        });
        this.pendingTimers.push(entryTimer);
        
        console.log('😈 Bully created! Will charge from ' + (startFromRight ? 'right' : 'left'));
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the bully's properties
     */
    setupBully() {
        // Physics - IMPORTANT: Don't set immovable, we need to move!
        this.body.setAllowGravity(false);
        this.body.setImmovable(false);  // Must be false so velocity works!
        this.body.setSize(35, 55);
        
        // Depth
        this.setDepth(12);
        
        // Face left initially
        this.setFlipX(true);
    }
    
    /**
     * Start walk/run animation
     */
    startWalkAnimation() {
        this.scene.tweens.killTweensOf(this);
        
        // Aggressive bouncing run
        this.walkTween = this.scene.tweens.add({
            targets: this,
            y: this.groundY - 5,
            duration: 200,
            yoyo: true,
            repeat: -1,
            ease: 'Bounce.easeOut'
        });
    }
    
    /**
     * Stop walk animation
     */
    stopWalkAnimation() {
        if (this.walkTween) {
            this.walkTween.stop();
        }
        this.y = this.groundY;
    }
    
    /**
     * Start throwing timer
     */
    startThrowingTimer() {
        // Throw immediately on first sight
        this.tryToThrow();
        
        this.throwTimer = this.scene.time.addEvent({
            delay: Bully.THROW_INTERVAL,
            callback: this.tryToThrow,
            callbackScope: this,
            loop: true
        });
    }
    
    /**
     * Stop throwing timer
     */
    stopThrowingTimer() {
        if (this.throwTimer) {
            this.throwTimer.remove();
            this.throwTimer = null;
        }
    }
    
    // =============================================================
    // PATROL STATE MACHINE
    // =============================================================
    
    /**
     * Start entering the screen
     */
    startEntering() {
        // Safety check - don't enter if already destroyed
        if (this.isDestroyed || !this.active || !this.body) return;
        
        const fromRight = this.patrolDirection === -1;
        console.log('😈 Bully entering from ' + (fromRight ? 'right' : 'left') + '!');
        this.currentState = 'entering';
        
        // Reset throw count for this patrol
        this.throwCount = 0;
        
        // Show warning
        this.showEntryWarning();
        
        // Wait for warning, then enter
        const enterTimer = this.scene.time.delayedCall(800, () => {
            // Safety check - don't proceed if destroyed
            if (this.isDestroyed || !this.active || !this.body) return;
            
            // Position off-screen using camera-relative coordinates
            // This fixes the bug where bullies disappear when player moves left
            const camera = this.scene.cameras.main;
            this.x = fromRight ? 
                camera.scrollX + camera.width + Bully.SPAWN_OFFSET : 
                camera.scrollX - Bully.SPAWN_OFFSET;
            this.y = this.groundY;
            
            this.setVisible(true);
            this.setActive(true);
            
            // Face movement direction
            this.setFlipX(this.patrolDirection === -1);
            
            // Start charging!
            if (this.body) {  // Extra safety check
                this.body.setVelocityX(this.patrolDirection * Bully.PATROL_SPEED);
            }
            this.startWalkAnimation();
            
            // Show entrance taunt
            this.showEntranceTaunt();
            
            // After fully on screen, start throwing
            const chargeTimer = this.scene.time.delayedCall(1000, () => {
                if (this.isDestroyed || !this.active || !this.body) return;  // Safety check
                this.startCharging();
            });
            this.pendingTimers.push(chargeTimer);
        });
        this.pendingTimers.push(enterTimer);
    }
    
    /**
     * Start the charging/attacking phase
     */
    startCharging() {
        console.log('😈 Bully charging and throwing!');
        this.currentState = 'charging';
        
        // Start throwing word bubbles
        this.startThrowingTimer();
    }
    
    /**
     * Start exiting the screen
     */
    startExiting() {
        console.log('😈 Bully exiting screen...');
        this.currentState = 'exiting';
        
        // Stop throwing
        this.stopThrowingTimer();
        
        // Show exit taunt
        this.showExitTaunt();
        
        // Keep moving - update() will detect when off-screen
    }
    
    /**
     * Start waiting off-screen
     */
    startWaiting() {
        // Safety check - don't proceed if destroyed
        if (this.isDestroyed || !this.active || !this.body) return;
        
        console.log('😈 Bully waiting off-screen...');
        this.currentState = 'waiting';
        
        // Stop and hide
        if (this.body) {
            this.body.setVelocityX(0);
        }
        this.stopWalkAnimation();
        this.setVisible(false);
        
        // Calculate wait time
        const waitTime = Phaser.Math.Between(
            Bully.REENTRY_TIME_MIN,
            Bully.REENTRY_TIME_MAX
        );
        
        // Re-enter after waiting
        const reentryTimer = this.scene.time.delayedCall(waitTime, () => {
            if (this.isDestroyed || !this.active || !this.body) return;  // Safety check
            this.prepareReentry();
        });
        this.pendingTimers.push(reentryTimer);
    }
    
    /**
     * Prepare to re-enter (choose random side)
     */
    prepareReentry() {
        // Safety check - don't proceed if destroyed
        if (this.isDestroyed || !this.active || !this.body) return;
        
        // 50/50 chance of either side - keeps player guessing!
        const enterFromRight = Math.random() < 0.5;
        
        // Position off-screen using camera-relative coordinates
        const camera = this.scene.cameras.main;
        if (enterFromRight) {
            this.x = camera.scrollX + camera.width + Bully.SPAWN_OFFSET;
            this.patrolDirection = -1;
        } else {
            this.x = camera.scrollX - Bully.SPAWN_OFFSET;
            this.patrolDirection = 1;
        }
        
        this.setFlipX(this.patrolDirection === -1);
        this.startEntering();
    }
    
    // =============================================================
    // UPDATE METHOD
    // =============================================================
    
    /**
     * Update the bully each frame
     * 
     * @param {Student} player - The player reference
     */
    update(player) {
        if (!player || !this.active) return;
        
        // Face direction of movement
        if (this.currentState === 'charging' || this.currentState === 'entering') {
            this.setFlipX(this.patrolDirection === -1);
        }
        
        // Check for screen exit - only when reaching the OPPOSITE side!
        // Use camera bounds instead of static coordinates to fix disappearing bug
        // when player moves left
        if (this.currentState === 'charging' || this.currentState === 'exiting') {
            const camera = this.scene.cameras.main;
            const cameraLeft = camera.scrollX - 100;  // Buffer zone
            const cameraRight = camera.scrollX + camera.width + 100;  // Buffer zone
            
            // patrolDirection = -1 means walking LEFT, so exit when beyond left camera edge
            // patrolDirection = +1 means walking RIGHT, so exit when beyond right camera edge
            const exitedLeft = this.patrolDirection === -1 && this.x < cameraLeft;
            const exitedRight = this.patrolDirection === 1 && this.x > cameraRight;
            
            if (exitedLeft || exitedRight) {
                this.startWaiting();
            }
        }
    }
    
    // =============================================================
    // ATTACK METHODS
    // =============================================================
    
    /**
     * Try to throw a word bubble
     */
    tryToThrow() {
        // Safety check - don't throw if destroyed
        if (this.isDestroyed || !this.active || !this.scene) return;
        
        // Only throw when charging
        if (this.currentState !== 'charging') return;
        
        // Check throw limit
        if (this.throwCount >= Bully.MAX_THROWS) {
            console.log('😈 Bully out of insults for this pass!');
            return;
        }
        
        const player = this.scene.student;
        if (!player) return;
        
        this.throwWordBubble(player);
        this.throwCount++;
    }
    
    /**
     * Throw a word bubble at the player
     * 
     * @param {Student} player - The player to attack
     */
    throwWordBubble(player) {
        // Safety check
        if (this.isDestroyed || !this.active || !this.scene || !player) return;
        
        // Play throw animation
        this.playThrowAnimation();
        
        // Calculate throw position (above the player's head for meteor effect)
        const throwX = player.x + Phaser.Math.Between(-50, 50);  // Slight randomness
        const throwY = -50;  // Start above screen
        
        // Create the word bubble - let it pick a random message
        const bubble = new WordBubble(
            this.scene,
            throwX,
            throwY
            // No message parameter = random insult from WordBubble.MESSAGES
        );
        
        // Track for cleanup
        this.wordBubbles.push(bubble);
        
        // Set up collision
        this.scene.physics.add.overlap(
            bubble,
            player,
            this.onBubbleHitPlayer,
            null,
            this
        );
        
        // Occasional taunt
        if (Math.random() < 0.3) {
            this.showAttackTaunt();
        }
    }
    
    /**
     * Play throw animation
     */
    playThrowAnimation() {
        this.scene.tweens.add({
            targets: this,
            scaleY: 1.15,
            scaleX: this.flipX ? -1.1 : 1.1,
            duration: 100,
            yoyo: true
        });
    }
    
    /**
     * Callback when word bubble hits player
     * 
     * @param {WordBubble} bubble - The word bubble
     * @param {Student} player - The player that was hit
     */
    onBubbleHitPlayer(bubble, player) {
        // Pass both arguments - hitPlayer expects (bubble, player) from overlap
        bubble.hitPlayer(bubble, player);
        
        const index = this.wordBubbles.indexOf(bubble);
        if (index > -1) {
            this.wordBubbles.splice(index, 1);
        }
    }
    
    // =============================================================
    // VISUAL FEEDBACK METHODS
    // =============================================================
    
    /**
     * Show warning before entering
     */
    showEntryWarning() {
        const fromRight = this.patrolDirection === -1;
        const warningX = fromRight ? 750 : 50;
        
        const warning = this.scene.add.text(
            warningX,
            this.groundY - 80,
            '⚠️ 😈',
            { fontSize: '32px' }
        );
        warning.setOrigin(0.5);
        warning.setDepth(150);
        warning.setScrollFactor(0);
        
        // Pulse
        this.scene.tweens.add({
            targets: warning,
            scale: 1.3,
            duration: 150,
            yoyo: true,
            repeat: 2
        });
        
        // Fade out
        this.scene.tweens.add({
            targets: warning,
            alpha: 0,
            duration: 200,
            delay: 600,
            onComplete: () => warning.destroy()
        });
    }
    
    /**
     * Show entrance taunt
     */
    showEntranceTaunt() {
        const taunts = [
            '"Hey NERD!"',
            '"Dottie Bacon RULES!"',
            '"Where ya going?"',
            '"Get back here!"'
        ];
        const taunt = Phaser.Math.RND.pick(taunts);
        
        const text = this.scene.add.text(
            this.x,
            this.y - 50,
            taunt,
            {
                fontSize: '13px',
                fontFamily: 'Arial',
                color: '#FF0000',
                backgroundColor: '#ffffff',
                padding: { x: 8, y: 4 },
                fontStyle: 'bold'
            }
        );
        text.setOrigin(0.5, 1);
        text.setDepth(100);
        
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 20,
            duration: 1500,
            delay: 1000,
            onComplete: () => text.destroy()
        });
    }
    
    /**
     * Show attack taunt
     */
    showAttackTaunt() {
        const taunts = [
            "Take this!",
            "LOSER!",
            "Ha ha!",
            "You stink!"
        ];
        const taunt = Phaser.Math.RND.pick(taunts);
        
        const text = this.scene.add.text(
            this.x,
            this.y - 45,
            taunt,
            {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#FF4444',
                backgroundColor: '#ffffff',
                padding: { x: 5, y: 3 }
            }
        );
        text.setOrigin(0.5, 1);
        text.setDepth(100);
        
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 15,
            duration: 1000,
            delay: 500,
            onComplete: () => text.destroy()
        });
    }
    
    /**
     * Show exit taunt
     */
    showExitTaunt() {
        const taunts = [
            '"I\'ll be back!"',
            '"This isn\'t over!"',
            '"You got lucky!"',
            '"Next time, nerd!"'
        ];
        const taunt = Phaser.Math.RND.pick(taunts);
        
        const text = this.scene.add.text(
            this.x,
            this.y - 50,
            taunt,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#FFDD44',
                backgroundColor: '#333333',
                padding: { x: 6, y: 4 }
            }
        );
        text.setOrigin(0.5, 1);
        text.setDepth(100);
        
        this.scene.tweens.add({
            targets: text,
            alpha: 0,
            y: text.y - 25,
            duration: 1500,
            delay: 800,
            onComplete: () => text.destroy()
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the bully
     */
    cleanup() {
        // Set destroyed flag IMMEDIATELY - this prevents any pending callbacks from executing
        this.isDestroyed = true;
        
        // Cancel all pending timers to prevent crashes
        if (this.pendingTimers) {
            this.pendingTimers.forEach(timer => {
                if (timer && timer.remove) {
                    timer.remove();
                }
            });
            this.pendingTimers = [];
        }
        
        // Stop timers
        this.stopThrowingTimer();
        
        // Stop animations
        this.scene.tweens.killTweensOf(this);
        
        // Clean up word bubbles
        this.wordBubbles.forEach(bubble => {
            if (bubble && !bubble.isDestroyed) {
                bubble.cleanup();
            }
        });
        this.wordBubbles = [];
        
        this.destroy();
    }
}
