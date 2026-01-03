/**
 * OldMan Class (NPC Enemy) - PATROL PATTERN
 * 
 * The grumpy old man who throws newspapers at students!
 * Now he PATROLS across the screen - enters from right, attacks while
 * walking left, passes the player, then exits left!
 * 
 * PATROL PATTERN:
 * 1. Enter from right side with "!" warning
 * 2. Walk left while throwing newspapers
 * 3. Has "back pain" breaks where he stops and spawns squirrels
 * 4. Exit off the left side
 * 5. Cooldown, then re-enter from right (or occasionally left!)
 * 
 * WHY extend Phaser.Physics.Arcade.Sprite?
 * - We get physics for movement and collisions
 * - Easy to manage velocity and position
 */
class OldMan extends Phaser.Physics.Arcade.Sprite {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How often does he throw newspapers? (milliseconds)
    // WHY 2500? Faster since he's moving - keeps pressure on!
    static THROW_INTERVAL = 2500;
    
    // Walking speed when patrolling (pixels per second)
    // WHY 60? Slow hobble - he's old! Player can outrun him
    static PATROL_SPEED = 60;
    
    // How far away to spawn off-screen (pixels from screen edge)
    static SPAWN_OFFSET = 100;
    
    // Screen boundaries
    static SCREEN_LEFT = -80;
    static SCREEN_RIGHT = 880;
    
    // =============================================================
    // PHASE SYSTEM - Alternates between patrolling and back pain!
    // =============================================================
    
    // How long before back pain hits? (milliseconds)
    // WHY 8-12 seconds? Long enough to throw some papers, then he needs a break
    static PATROL_TIME_MIN = 8000;
    static PATROL_TIME_MAX = 12000;
    
    // How long is the back pain phase? (milliseconds)
    // WHY 6-10 seconds? Squirrel phase while he recovers
    static BACKPAIN_TIME_MIN = 6000;
    static BACKPAIN_TIME_MAX = 10000;
    
    // How long before squirrel appears after back pain starts?
    static SQUIRREL_DELAY = 1000;
    
    // How long to wait off-screen before re-entering?
    // WHY 5-8 seconds? Gives player a breather
    static REENTRY_TIME_MIN = 5000;
    static REENTRY_TIME_MAX = 8000;
    
    // Maximum back pain phases per patrol (prevents infinite squirrel spawning!)
    // WHY 1? One back pain per patrol, then he exits
    static MAX_BACKPAIN_PER_PATROL = 1;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new OldMan NPC
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {number} x - X position (usually off-screen right to start)
     * @param {number} y - Y position (on the ground)
     */
    constructor(scene, x, y) {
        // Start off-screen to the right
        super(scene, OldMan.SCREEN_RIGHT + OldMan.SPAWN_OFFSET, y, 'oldman');
        
        this.scene = scene;
        
        // Add to scene
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // Set up the old man
        this.setupOldMan();
        
        // Track newspapers for cleanup
        this.newspapers = [];
        
        // Store ground Y position
        this.groundY = y;
        
        // =============================================================
        // PATROL STATE
        // =============================================================
        
        // Current state: 'entering', 'patrolling', 'backpain', 'exiting', 'waiting'
        this.currentState = 'waiting';
        
        // Direction: 1 = moving right, -1 = moving left
        this.patrolDirection = -1;  // Start by moving left
        
        // Back pain count total (for tutorial on first one)
        this.backPainCount = 0;
        
        // Back pain count THIS patrol (resets when re-entering)
        // WHY track this? Prevents infinite back pain loops!
        this.backPainThisPatrol = 0;
        
        // Has the player seen the first warning?
        this.firstWarningShown = false;
        
        // Start the patrol cycle after a short delay
        this.scene.time.delayedCall(2000, () => {
            console.log('👴 DEBUG: 2 second delay finished, calling startEntering()');
            console.log('👴 DEBUG: this.active =', this.active, 'this.visible =', this.visible);
            this.startEntering();
        });
        
        console.log('👴 Grumpy Old Man initialized! Will patrol across screen.');
    }
    
    // =============================================================
    // SETUP METHODS
    // =============================================================
    
    /**
     * Configure the old man's properties
     */
    setupOldMan() {
        // Enable physics movement - IMPORTANT: Don't set immovable!
        this.body.setAllowGravity(false);
        this.body.setImmovable(false);  // Must be false so velocity works!
        
        // Set collision box
        this.body.setSize(40, 70);
        
        // Set depth (in front of background, behind UI)
        this.setDepth(10);
        
        // Face left initially (toward player)
        this.setFlipX(true);
    }
    
    /**
     * Create a bobbing walk animation
     */
    startWalkAnimation() {
        // Stop any existing animation
        this.scene.tweens.killTweensOf(this);
        
        // Bobbing while walking
        this.walkTween = this.scene.tweens.add({
            targets: this,
            y: this.groundY - 3,
            duration: 300,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
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
     * Start the throwing timer
     */
    startThrowingTimer() {
        this.throwTimer = this.scene.time.addEvent({
            delay: OldMan.THROW_INTERVAL,
            callback: this.tryToThrowNewspaper,
            callbackScope: this,
            loop: true
        });
    }
    
    /**
     * Stop the throwing timer
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
        console.log('👴 Old man entering from the ' + (this.patrolDirection === -1 ? 'right' : 'left') + '!');
        this.currentState = 'entering';
        
        // Reset back pain count for this patrol
        this.backPainThisPatrol = 0;
        
        // Show warning indicator BEFORE he appears
        this.showEntryWarning();
        
        // Wait for warning to show, then start walking in
        this.scene.time.delayedCall(1000, () => {
            console.log('👴 DEBUG: 1 second after warning, positioning old man');
            // Position off-screen using camera-relative coordinates
            const camera = this.scene.cameras.main;
            if (this.patrolDirection === -1) {
                this.x = camera.scrollX + camera.width + OldMan.SPAWN_OFFSET;
                console.log('👴 DEBUG: Positioned at x =', this.x, '(right side)');
            } else {
                this.x = camera.scrollX - OldMan.SPAWN_OFFSET;
                console.log('👴 DEBUG: Positioned at x =', this.x, '(left side)');
            }
            this.y = this.groundY;
            console.log('👴 DEBUG: y =', this.y, 'groundY =', this.groundY);
            
            this.setVisible(true);
            this.setActive(true);
            console.log('👴 DEBUG: setVisible(true), setActive(true) called');
            
            // Face movement direction
            this.setFlipX(this.patrolDirection === -1);
            
            // Start walking
            this.setVelocityX(this.patrolDirection * OldMan.PATROL_SPEED);
            console.log('👴 DEBUG: setVelocityX called with', this.patrolDirection * OldMan.PATROL_SPEED);
            console.log('👴 DEBUG: body.velocity.x =', this.body.velocity.x);
            
            this.startWalkAnimation();
            
            // Show grumpy entrance message
            this.showEntranceMessage();
            
            // After entering screen, switch to patrolling
            this.scene.time.delayedCall(1500, () => {
                this.startPatrolling();
            });
        });
    }
    
    /**
     * Start the main patrol phase (walking and throwing)
     */
    startPatrolling() {
        console.log('👴📰 Now patrolling and throwing newspapers!');
        this.currentState = 'patrolling';
        
        // Start throwing newspapers
        this.startThrowingTimer();
        
        // Set patrol duration before back pain hits
        const patrolDuration = Phaser.Math.Between(
            OldMan.PATROL_TIME_MIN,
            OldMan.PATROL_TIME_MAX
        );
        
        // Schedule back pain
        this.phaseTimer = this.scene.time.delayedCall(patrolDuration, () => {
            this.startBackPain();
        });
    }
    
    /**
     * Start the back pain phase
     */
    startBackPain() {
        // Check if we've already had back pain this patrol
        if (this.backPainThisPatrol >= OldMan.MAX_BACKPAIN_PER_PATROL) {
            console.log('👴 Already had back pain, just keep walking...');
            return;  // Skip back pain, let him exit naturally
        }
        
        console.log('👴💥 OH MY BACK! Stopping to recover...');
        this.currentState = 'backpain';
        this.backPainCount++;  // Total count (for tutorial)
        this.backPainThisPatrol++;  // This patrol count (for limiting)
        
        // Stop moving
        this.setVelocityX(0);
        this.stopWalkAnimation();
        
        // Stop throwing
        this.stopThrowingTimer();
        
        // Show pain message and animation
        this.showBackPainMessage();
        this.playBackPainAnimation();
        
        // Spawn squirrel after delay
        this.scene.time.delayedCall(OldMan.SQUIRREL_DELAY, () => {
            if (this.currentState === 'backpain') {
                this.spawnSquirrel();
            }
        });
        
        // Calculate recovery time
        const recoveryTime = Phaser.Math.Between(
            OldMan.BACKPAIN_TIME_MIN,
            OldMan.BACKPAIN_TIME_MAX
        );
        
        // After recovery, continue patrolling or exit
        this.scene.time.delayedCall(recoveryTime, () => {
            this.recoverFromBackPain();
        });
    }
    
    /**
     * Recover from back pain and continue
     */
    recoverFromBackPain() {
        console.log('👴 "Ah, that\'s better..." *continues walking*');
        
        // Show recovery message
        this.showRecoveryMessage();
        
        // Reset scale
        this.scene.tweens.add({
            targets: this,
            scaleY: 1,
            duration: 300
        });
        
        // Continue in the same direction
        this.setVelocityX(this.patrolDirection * OldMan.PATROL_SPEED);
        this.startWalkAnimation();
        
        // After back pain, just exit - don't start another patrol cycle!
        // WHY? Prevents infinite back pain loop that spawns endless squirrels
        this.currentState = 'patrolling';  // Just walk to exit, no more throwing
        console.log('👴 Heading for the exit after back pain...');
    }
    
    /**
     * Start exiting the screen
     */
    startExiting() {
        console.log('👴 Old man exiting screen...');
        this.currentState = 'exiting';
        
        // Stop throwing
        this.stopThrowingTimer();
        
        // Cancel any phase timer
        if (this.phaseTimer) {
            this.phaseTimer.remove();
        }
        
        // Show exit message
        this.showExitMessage();
        
        // Keep walking in current direction until off-screen
        // The update() method will handle detecting when we're off-screen
    }
    
    /**
     * Start waiting off-screen before re-entering
     */
    startWaiting() {
        console.log('👴 Resting off-screen... will return soon!');
        this.currentState = 'waiting';
        
        // Stop and hide
        this.setVelocityX(0);
        this.stopWalkAnimation();
        this.setVisible(false);
        
        // Calculate wait time
        const waitTime = Phaser.Math.Between(
            OldMan.REENTRY_TIME_MIN,
            OldMan.REENTRY_TIME_MAX
        );
        
        // Re-enter after waiting
        this.scene.time.delayedCall(waitTime, () => {
            this.prepareReentry();
        });
    }
    
    /**
     * Prepare to re-enter (choose which side)
     */
    prepareReentry() {
        // Usually enter from right, occasionally from left for variety
        // WHY 80/20? Right side is more natural, but left keeps player alert
        const enterFromRight = Math.random() < 0.8;
        
        // Position off-screen using camera-relative coordinates
        const camera = this.scene.cameras.main;
        if (enterFromRight) {
            this.x = camera.scrollX + camera.width + OldMan.SPAWN_OFFSET;
            this.patrolDirection = -1;
            this.setFlipX(true);
        } else {
            this.x = camera.scrollX - OldMan.SPAWN_OFFSET;
            this.patrolDirection = 1;
            this.setFlipX(false);
        }
        
        this.startEntering();
    }
    
    // =============================================================
    // UPDATE METHOD
    // =============================================================
    
    /**
     * Update the old man each frame
     * 
     * @param {Student} player - Reference to the player
     */
    update(player) {
        if (!player || !this.active) return;
        
        // Debug log every 60 frames (roughly every second)
        if (!this.debugCounter) this.debugCounter = 0;
        this.debugCounter++;
        if (this.debugCounter % 60 === 0) {
            console.log('👴 DEBUG UPDATE: x =', Math.round(this.x), 'state =', this.currentState, 'velocity =', this.body.velocity.x);
        }
        
        // Always face the direction we're walking (or face player when stopped)
        if (this.currentState === 'patrolling' || this.currentState === 'entering') {
            this.setFlipX(this.patrolDirection === -1);
        } else if (this.currentState === 'backpain') {
            // Face the player while in pain
            this.setFlipX(player.x < this.x);
        }
        
        // Check for screen exit during patrolling/exiting
        // IMPORTANT: Only exit when reaching the OPPOSITE side from entry!
        // Use camera bounds instead of static coordinates to fix disappearing bug
        if (this.currentState === 'patrolling' || this.currentState === 'exiting') {
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
     * Attempt to throw a newspaper
     */
    tryToThrowNewspaper() {
        // Only throw when patrolling
        if (this.currentState !== 'patrolling') return;
        
        const player = this.scene.student;
        if (!player) return;
        
        // Throw at the player!
        this.throwNewspaper(player);
    }
    
    /**
     * Throw a newspaper at the player
     * 
     * @param {Student} player - The player to throw at
     */
    throwNewspaper(player) {
        // Play throw animation
        this.playThrowAnimation();
        
        // Calculate throw position
        const throwX = this.flipX ? this.x - 20 : this.x + 20;
        const throwY = this.y - 20;
        
        // Create the newspaper
        const newspaper = new Newspaper(
            this.scene,
            throwX,
            throwY,
            player.x
        );
        
        // Track for cleanup
        this.newspapers.push(newspaper);
        
        // Set up collision
        this.scene.physics.add.overlap(
            newspaper,
            player,
            this.onNewspaperHitPlayer,
            null,
            this
        );
        
        // Occasional grumpy message
        if (Math.random() < 0.25) {
            this.showGrumpyMessage();
        }
    }
    
    /**
     * Play throw animation
     */
    playThrowAnimation() {
        this.scene.tweens.add({
            targets: this,
            scaleX: this.flipX ? -1.2 : 1.2,
            duration: 100,
            yoyo: true,
            ease: 'Power2'
        });
    }
    
    /**
     * Callback when newspaper hits player
     */
    onNewspaperHitPlayer(newspaper, player) {
        newspaper.hitPlayer(player);
        
        const index = this.newspapers.indexOf(newspaper);
        if (index > -1) {
            this.newspapers.splice(index, 1);
        }
    }
    
    // =============================================================
    // VISUAL FEEDBACK METHODS
    // =============================================================
    
    /**
     * Show warning before entering
     */
    showEntryWarning() {
        // Warning on the side he'll enter from
        const warningX = this.patrolDirection === -1 ? 750 : 50;
        
        const warning = this.scene.add.text(
            warningX,
            this.groundY - 80,
            '⚠️ ❗',
            { fontSize: '36px' }
        );
        warning.setOrigin(0.5);
        warning.setDepth(150);
        warning.setScrollFactor(0);  // Stay on screen
        
        // Pulse animation
        this.scene.tweens.add({
            targets: warning,
            scale: 1.3,
            duration: 200,
            yoyo: true,
            repeat: 2
        });
        
        // Fade out
        this.scene.tweens.add({
            targets: warning,
            alpha: 0,
            duration: 300,
            delay: 800,
            onComplete: () => warning.destroy()
        });
        
        // Tutorial message on first warning
        if (!this.firstWarningShown) {
            this.firstWarningShown = true;
            const hint = this.scene.add.text(
                400, 150,
                '👴 The Old Man is coming!\nJump over his newspapers!',
                {
                    fontSize: '18px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    padding: { x: 15, y: 10 },
                    align: 'center'
                }
            );
            hint.setOrigin(0.5);
            hint.setDepth(200);
            hint.setScrollFactor(0);
            
            this.scene.tweens.add({
                targets: hint,
                alpha: 0,
                duration: 500,
                delay: 3000,
                onComplete: () => hint.destroy()
            });
        }
    }
    
    /**
     * Show entrance message
     */
    showEntranceMessage() {
        const messages = [
            '"Get off my sidewalk!"',
            '"Here I come, kid!"',
            '"No running allowed!"',
            '"Kids these days..."'
        ];
        const message = Phaser.Math.RND.pick(messages);
        
        const bubble = this.scene.add.text(
            this.x + (this.flipX ? -40 : 40),
            this.y - 50,
            message,
            {
                fontSize: '12px',
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: { x: 8, y: 4 }
            }
        );
        bubble.setOrigin(0.5, 1);
        bubble.setDepth(100);
        
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            y: bubble.y - 20,
            duration: 2000,
            delay: 1500,
            onComplete: () => bubble.destroy()
        });
    }
    
    /**
     * Show grumpy message while attacking
     */
    showGrumpyMessage() {
        const messages = [
            "Take that!",
            "Read this!",
            "Darn students!",
            "No loitering!",
            "Back in my day..."
        ];
        const message = Phaser.Math.RND.pick(messages);
        
        const bubble = this.scene.add.text(
            this.x,
            this.y - 50,
            message,
            {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: { x: 6, y: 3 }
            }
        );
        bubble.setOrigin(0.5, 1);
        bubble.setDepth(100);
        
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            y: bubble.y - 15,
            duration: 1500,
            delay: 800,
            onComplete: () => bubble.destroy()
        });
    }
    
    /**
     * Show back pain message
     */
    showBackPainMessage() {
        const bubble = this.scene.add.text(
            this.x,
            this.y - 60,
            'OH, MY BACK!\nOUCH!',
            {
                fontSize: '14px',
                fontFamily: 'Arial',
                color: '#FF0000',
                backgroundColor: '#ffffff',
                padding: { x: 10, y: 6 },
                fontStyle: 'bold',
                align: 'center'
            }
        );
        bubble.setOrigin(0.5, 1);
        bubble.setDepth(100);
        
        const painEmoji = this.scene.add.text(
            this.x,
            this.y - 75,
            '💢',
            { fontSize: '28px' }
        );
        painEmoji.setOrigin(0.5);
        painEmoji.setDepth(101);
        
        this.scene.tweens.add({
            targets: [bubble, painEmoji],
            alpha: 0,
            y: '-=30',
            duration: 2500,
            delay: 500,
            onComplete: () => {
                bubble.destroy();
                painEmoji.destroy();
            }
        });
    }
    
    /**
     * Play back pain animation
     */
    playBackPainAnimation() {
        // Hunch over
        this.scene.tweens.add({
            targets: this,
            scaleY: 0.8,
            duration: 200
        });
        
        // Shake in pain
        this.scene.tweens.add({
            targets: this,
            x: this.x + 2,
            duration: 50,
            yoyo: true,
            repeat: 8
        });
    }
    
    /**
     * Show recovery message
     */
    showRecoveryMessage() {
        const bubble = this.scene.add.text(
            this.x,
            this.y - 50,
            '"Ah, better...\nNow where was I?"',
            {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: { x: 6, y: 4 },
                align: 'center'
            }
        );
        bubble.setOrigin(0.5, 1);
        bubble.setDepth(100);
        
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            duration: 500,
            delay: 1500,
            onComplete: () => bubble.destroy()
        });
    }
    
    /**
     * Show exit message
     */
    showExitMessage() {
        const messages = [
            '"I\'ll be back!"',
            '"Need a break..."',
            '"My stories are on!"',
            '"Time for my pills..."'
        ];
        const message = Phaser.Math.RND.pick(messages);
        
        const bubble = this.scene.add.text(
            this.x,
            this.y - 50,
            message,
            {
                fontSize: '11px',
                fontFamily: 'Arial',
                color: '#000000',
                backgroundColor: '#ffffff',
                padding: { x: 6, y: 4 }
            }
        );
        bubble.setOrigin(0.5, 1);
        bubble.setDepth(100);
        
        this.scene.tweens.add({
            targets: bubble,
            alpha: 0,
            y: bubble.y - 20,
            duration: 2000,
            delay: 1000,
            onComplete: () => bubble.destroy()
        });
    }
    
    // =============================================================
    // SQUIRREL SPAWNING
    // =============================================================
    
    /**
     * Spawn a squirrel during back pain phase
     */
    spawnSquirrel() {
        console.log('🐿️ A squirrel appears while old man recovers!');
        
        // Spawn from the right
        const squirrel = new Squirrel(this.scene, 850, 555);
        
        // Tutorial hint on first back pain
        if (this.backPainCount === 1) {
            const hint = this.scene.add.text(
                400, 500,
                '🐿️ Watch out! Jump over the squirrel!',
                {
                    fontSize: '16px',
                    fontFamily: 'Arial',
                    color: '#ffffff',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    padding: { x: 12, y: 8 }
                }
            );
            hint.setOrigin(0.5);
            hint.setDepth(200);
            hint.setScrollFactor(0);
            
            this.scene.tweens.add({
                targets: hint,
                alpha: 0,
                duration: 500,
                delay: 2500,
                onComplete: () => hint.destroy()
            });
        }
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the old man
     */
    cleanup() {
        // Stop timers
        this.stopThrowingTimer();
        
        if (this.phaseTimer) {
            this.phaseTimer.remove();
        }
        
        // Stop animations
        this.scene.tweens.killTweensOf(this);
        
        // Clean up newspapers
        this.newspapers.forEach(newspaper => {
            if (newspaper && newspaper.active) {
                newspaper.cleanup();
            }
        });
        this.newspapers = [];
        
        this.destroy();
    }
}
