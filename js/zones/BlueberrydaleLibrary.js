/**
 * BlueberrydalelLibrary Class
 * 
 * The goal! The Blueberrydale Public Library at 1500 meters!
 * When the player reaches this, they WIN the game!
 * 
 * Features:
 * - Beautiful, welcoming library building
 * - Celebration when player arrives
 * - Victory screen with stats and "Play Again" button
 * 
 * WHY a class for this?
 * - Encapsulates all the library/victory logic
 * - Similar structure to DottieBaconSchool for consistency
 * - Easy to manage the building visuals and victory trigger
 */
class BlueberrydaleLibrary {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // Where is the library? (in pixels, 1500m = 15000px)
    static ZONE_START = 15000;
    
    // How far before the library do we start showing it?
    static APPROACH_DISTANCE = 500;  // Start showing building 50m before
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create the Blueberrydale Library zone
     * 
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Track if the zone has been created
        this.isCreated = false;
        this.hasWon = false;  // Player has reached the library
        
        // Store references to zone elements
        this.libraryBuilding = null;
        this.signText = null;
        this.welcomeSign = null;
        
        console.log('📚 Blueberrydale Public Library initialized (goal at 1500m)!');
    }
    
    // =============================================================
    // ZONE MANAGEMENT
    // =============================================================
    
    /**
     * Check if player is approaching or has reached the library
     * Called from the main update loop
     * 
     * @param {number} distance - Current distance traveled in pixels
     */
    checkZone(distance) {
        // Don't do anything if player already won
        if (this.hasWon) return;
        
        // Create the library when approaching
        if (!this.isCreated && distance >= BlueberrydaleLibrary.ZONE_START - BlueberrydaleLibrary.APPROACH_DISTANCE) {
            this.createZone();
        }
        
        // Check if player has reached the library!
        if (distance >= BlueberrydaleLibrary.ZONE_START) {
            this.playerReachedLibrary();
        }
    }
    
    /**
     * Create the library building and decorations
     */
    createZone() {
        if (this.isCreated) return;
        
        console.log('📚 Creating Blueberrydale Public Library!');
        this.isCreated = true;
        
        // Create the library building
        this.createLibraryBuilding();
        
        // Create welcome sign
        this.createWelcomeSign();
        
        // Show approaching message
        this.showApproachingMessage();
    }
    
    /**
     * Create the beautiful library building
     */
    createLibraryBuilding() {
        const building = this.scene.add.graphics();
        
        // Position (will be positioned by parallax scrolling)
        const buildingX = 150;
        const buildingY = 180;
        
        // Main building - warm, welcoming brick color
        building.fillStyle(0xB87333, 1);  // Copper/brick color
        building.fillRect(buildingX, buildingY, 400, 280);
        
        // Lighter accent stripe
        building.fillStyle(0xDEB887, 1);  // Burlywood
        building.fillRect(buildingX, buildingY + 50, 400, 20);
        
        // Roof - classic library style
        building.fillStyle(0x4A4A4A, 1);  // Dark gray
        building.fillTriangle(
            buildingX - 20, buildingY,
            buildingX + 200, buildingY - 80,
            buildingX + 420, buildingY
        );
        
        // Large welcoming front door
        building.fillStyle(0x8B4513, 1);  // Saddle brown
        building.fillRect(buildingX + 160, buildingY + 150, 80, 130);
        
        // Door window
        building.fillStyle(0xFFFFE0, 0.8);  // Light yellow (warm light inside)
        building.fillRect(buildingX + 175, buildingY + 165, 50, 60);
        
        // Door handle
        building.fillStyle(0xFFD700, 1);  // Gold
        building.fillCircle(buildingX + 225, buildingY + 220, 5);
        
        // Windows - warm, inviting light
        const windowPositions = [
            { x: buildingX + 50, y: buildingY + 80 },
            { x: buildingX + 130, y: buildingY + 80 },
            { x: buildingX + 270, y: buildingY + 80 },
            { x: buildingX + 350, y: buildingY + 80 },
            { x: buildingX + 50, y: buildingY + 180 },
            { x: buildingX + 350, y: buildingY + 180 }
        ];
        
        windowPositions.forEach(pos => {
            // Window frame
            building.fillStyle(0xFFFFFF, 1);
            building.fillRect(pos.x, pos.y, 50, 60);
            
            // Window glow (warm light from inside)
            building.fillStyle(0xFFF8DC, 0.9);  // Cornsilk
            building.fillRect(pos.x + 4, pos.y + 4, 42, 52);
            
            // Window panes
            building.lineStyle(2, 0x8B4513, 1);
            building.lineBetween(pos.x + 25, pos.y, pos.x + 25, pos.y + 60);
            building.lineBetween(pos.x, pos.y + 30, pos.x + 50, pos.y + 30);
        });
        
        // Columns at entrance (classic library look!)
        building.fillStyle(0xF5F5DC, 1);  // Beige
        building.fillRect(buildingX + 140, buildingY + 100, 15, 180);
        building.fillRect(buildingX + 245, buildingY + 100, 15, 180);
        
        // Steps leading to door
        building.fillStyle(0xA9A9A9, 1);  // Dark gray
        building.fillRect(buildingX + 130, buildingY + 280, 140, 10);
        building.fillRect(buildingX + 120, buildingY + 290, 160, 10);
        building.fillRect(buildingX + 110, buildingY + 300, 180, 10);
        
        // Bushes (alive and healthy, unlike Dottie Bacon!)
        building.fillStyle(0x228B22, 1);  // Forest green
        building.fillCircle(buildingX + 80, buildingY + 270, 25);
        building.fillCircle(buildingX + 320, buildingY + 270, 25);
        building.fillStyle(0x32CD32, 1);  // Lime green
        building.fillCircle(buildingX + 85, buildingY + 265, 15);
        building.fillCircle(buildingX + 315, buildingY + 265, 15);
        
        // Flowers
        building.fillStyle(0xFF69B4, 1);  // Hot pink
        building.fillCircle(buildingX + 70, buildingY + 280, 6);
        building.fillCircle(buildingX + 90, buildingY + 280, 6);
        building.fillCircle(buildingX + 310, buildingY + 280, 6);
        building.fillCircle(buildingX + 330, buildingY + 280, 6);
        
        // Set depth behind player
        building.setDepth(-5);
        building.setScrollFactor(0.3);
        
        this.libraryBuilding = building;
        
        // Add library name on building
        this.signText = this.scene.add.text(350, 220, '📚 BLUEBERRYDALE\nPUBLIC LIBRARY 📚', {
            fontSize: '14px',
            fontFamily: 'Georgia, serif',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center',
            backgroundColor: 'rgba(139, 69, 19, 0.8)',
            padding: { x: 8, y: 4 }
        });
        this.signText.setOrigin(0.5);
        this.signText.setDepth(-4);
        this.signText.setScrollFactor(0.3);
    }
    
    /**
     * Create a welcome sign
     */
    createWelcomeSign() {
        const sign = this.scene.add.graphics();
        
        // Sign post
        sign.fillStyle(0x8B4513, 1);
        sign.fillRect(500, 380, 8, 80);
        
        // Sign board
        sign.fillStyle(0x228B22, 1);  // Green (welcoming!)
        sign.fillRect(430, 350, 150, 40);
        
        sign.setDepth(-3);
        sign.setScrollFactor(0.3);
        
        this.welcomeSign = sign;
        
        // Sign text
        this.welcomeText = this.scene.add.text(505, 370, '📖 WELCOME! 📖', {
            fontSize: '12px',
            fontFamily: 'Arial',
            color: '#FFFFFF',
            fontStyle: 'bold',
            align: 'center'
        });
        this.welcomeText.setOrigin(0.5);
        this.welcomeText.setDepth(-2);
        this.welcomeText.setScrollFactor(0.3);
    }
    
    /**
     * Show message when approaching the library
     */
    showApproachingMessage() {
        const message = this.scene.add.text(
            400, 150,
            '📚 THE LIBRARY IS JUST AHEAD! 📚\nAlmost there!',
            {
                fontSize: '22px',
                fontFamily: 'Arial',
                color: '#4CAF50',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 15, y: 10 },
                fontStyle: 'bold',
                align: 'center'
            }
        );
        message.setOrigin(0.5);
        message.setDepth(200);
        message.setScrollFactor(0);
        
        // Fade in and out
        message.setAlpha(0);
        this.scene.tweens.add({
            targets: message,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 2500,
            onComplete: () => message.destroy()
        });
    }
    
    /**
     * Player has reached the library - VICTORY!
     */
    playerReachedLibrary() {
        if (this.hasWon) return;
        this.hasWon = true;
        
        console.log('🎉📚 VICTORY! Player reached Blueberrydale Public Library!');
        
        // Stop the game
        this.scene.physics.pause();
        
        // Stop player movement
        if (this.scene.student) {
            this.scene.student.body.setVelocity(0, 0);
        }
        
        // Stop background scrolling (if method exists)
        if (this.scene.background && typeof this.scene.background.stopScrolling === 'function') {
            this.scene.background.stopScrolling();
        } else {
            // Fallback: set a flag that the background can check
            if (this.scene.background) {
                this.scene.background.isStopped = true;
            }
        }
        
        // Show celebration
        this.showCelebration();
        
        // Show victory screen after a short delay
        this.scene.time.delayedCall(2000, () => {
            this.showVictoryScreen();
        });
    }
    
    /**
     * Show celebration effects
     */
    showCelebration() {
        // Create confetti burst!
        if (this.scene.textures.exists('particle')) {
            // Multiple confetti bursts
            for (let i = 0; i < 5; i++) {
                this.scene.time.delayedCall(i * 300, () => {
                    const x = Phaser.Math.Between(100, 700);
                    const burst = this.scene.add.particles(x, 100, 'particle', {
                        speed: { min: 100, max: 300 },
                        angle: { min: 60, max: 120 },
                        scale: { start: 0.8, end: 0 },
                        lifespan: 2000,
                        quantity: 30,
                        tint: [0xFF6B6B, 0x4ECDC4, 0xFFE66D, 0x95E1D3, 0xF38181]
                    });
                    burst.setDepth(150);
                    burst.explode();
                    
                    this.scene.time.delayedCall(2500, () => burst.destroy());
                });
            }
        }
        
        // Big celebration text
        const celebText = this.scene.add.text(400, 200, '🎉 YOU MADE IT! 🎉', {
            fontSize: '48px',
            fontFamily: 'Arial',
            color: '#FFD700',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 6
        });
        celebText.setOrigin(0.5);
        celebText.setDepth(160);
        celebText.setScrollFactor(0);
        
        // Animate the text
        this.scene.tweens.add({
            targets: celebText,
            scale: { from: 0.5, to: 1.2 },
            duration: 500,
            ease: 'Back.easeOut',
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                this.scene.tweens.add({
                    targets: celebText,
                    alpha: 0,
                    duration: 500,
                    delay: 500
                });
            }
        });
    }
    
    /**
     * Show the victory screen with stats
     */
    showVictoryScreen() {
        // Create overlay
        const overlay = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.85);
        overlay.setDepth(200);
        overlay.setScrollFactor(0);
        
        // Victory title
        const titleText = this.scene.add.text(400, 100, '📚 CONGRATULATIONS! 📚', {
            fontSize: '42px',
            fontFamily: 'Georgia, serif',
            color: '#FFD700',
            fontStyle: 'bold'
        });
        titleText.setOrigin(0.5);
        titleText.setDepth(201);
        titleText.setScrollFactor(0);
        
        // Success message
        const successText = this.scene.add.text(400, 170, 'You reached the Blueberrydale Public Library!', {
            fontSize: '24px',
            fontFamily: 'Arial',
            color: '#FFFFFF'
        });
        successText.setOrigin(0.5);
        successText.setDepth(201);
        successText.setScrollFactor(0);
        
        // Stats box
        const statsBox = this.scene.add.rectangle(400, 300, 400, 150, 0x2C3E50, 0.9);
        statsBox.setDepth(201);
        statsBox.setScrollFactor(0);
        statsBox.setStrokeStyle(3, 0x4CAF50);
        
        // Calculate stats
        const distance = 1500;  // They made it!
        const confidence = this.scene.student ? this.scene.student.confidence : 100;
        
        // Stats text
        const statsText = this.scene.add.text(400, 300, 
            `📏 Distance: ${distance}m\n\n` +
            `💪 Confidence Left: ${Math.round(confidence)}%\n\n` +
            `⭐ You did it!`, 
            {
                fontSize: '22px',
                fontFamily: 'Arial',
                color: '#FFFFFF',
                align: 'center',
                lineSpacing: 5
            }
        );
        statsText.setOrigin(0.5);
        statsText.setDepth(202);
        statsText.setScrollFactor(0);
        
        // Encouraging message
        const encourageText = this.scene.add.text(400, 420, 
            '🌟 Knowledge awaits inside! 🌟\nGreat job getting here safely!', 
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#87CEEB',
                align: 'center'
            }
        );
        encourageText.setOrigin(0.5);
        encourageText.setDepth(201);
        encourageText.setScrollFactor(0);
        
        // Play Again button
        const playAgainBtn = this.scene.add.text(400, 520, '🔄 Play Again', {
            fontSize: '32px',
            fontFamily: 'Arial',
            color: '#4CAF50',
            backgroundColor: '#FFFFFF',
            padding: { x: 25, y: 12 }
        });
        playAgainBtn.setOrigin(0.5);
        playAgainBtn.setDepth(202);
        playAgainBtn.setScrollFactor(0);
        playAgainBtn.setInteractive({ useHandCursor: true });
        
        // Button hover effects
        playAgainBtn.on('pointerover', () => {
            playAgainBtn.setStyle({ backgroundColor: '#E8F5E9', color: '#2E7D32' });
        });
        playAgainBtn.on('pointerout', () => {
            playAgainBtn.setStyle({ backgroundColor: '#FFFFFF', color: '#4CAF50' });
        });
        
        // Restart game on click
        playAgainBtn.on('pointerdown', () => {
            console.log('🔄 Restarting game...');
            this.scene.scene.restart();
        });
        
        // Animate elements appearing
        const elements = [titleText, successText, statsBox, statsText, encourageText, playAgainBtn];
        elements.forEach((item, index) => {
            item.setAlpha(0);
            this.scene.tweens.add({
                targets: item,
                alpha: 1,
                duration: 400,
                delay: index * 150
            });
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the library zone
     */
    cleanup() {
        if (this.libraryBuilding) this.libraryBuilding.destroy();
        if (this.signText) this.signText.destroy();
        if (this.welcomeSign) this.welcomeSign.destroy();
        if (this.welcomeText) this.welcomeText.destroy();
        
        this.isCreated = false;
    }
}
