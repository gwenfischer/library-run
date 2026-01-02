/**
 * DottieBaconSchool Class
 * 
 * The rival school zone that appears every 500 meters!
 * Features a run-down school building with tired teachers in windows,
 * kids on phones, and bullies outside throwing word bubbles.
 * 
 * WHY a class for this?
 * - Encapsulates all the school zone logic in one place
 * - Manages the school building, windows, and bullies
 * - Easy to spawn/despawn as player enters/leaves the zone
 * 
 * REPEATING ZONE:
 * - First appears at 500m, then every 500m after (1000m, 1500m, etc.)
 * - School fades out when player leaves, reappears at next interval
 */
class DottieBaconSchool {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // How often does the school zone appear? (in pixels, 500m = 5000px)
    static ZONE_INTERVAL = 5000;
    
    // How long is the school zone?
    static ZONE_LENGTH = 1500;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create the Dottie Bacon School zone
     * 
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Track if the zone has been created
        this.isCreated = false;
        this.isActive = false;
        
        // Track which zone occurrence we're on (1st at 500m, 2nd at 1000m, etc.)
        this.currentZoneNumber = 0;
        
        // Store references to zone elements
        this.schoolBuilding = null;
        this.windows = [];
        this.bullies = [];
        this.signText = null;
        this.sign = null;  // The sign graphics object
        
        console.log('🏫 Dottie Bacon School zone initialized (spawns every 500m)');
    }
    
    // =============================================================
    // ZONE MANAGEMENT
    // =============================================================
    
    /**
     * Calculate the start position for the next zone occurrence
     * @returns {number} The pixel position where the next zone starts
     */
    getNextZoneStart() {
        return (this.currentZoneNumber + 1) * DottieBaconSchool.ZONE_INTERVAL;
    }
    
    /**
     * Check if player has reached the school zone
     * Called from the main update loop
     * 
     * @param {number} distance - Current distance traveled in pixels
     */
    checkZone(distance) {
        const nextZoneStart = this.getNextZoneStart();
        
        // Don't spawn school at or after the library (1500m = 15000px)
        // WHY? The library is the goal - no more obstacles there!
        const LIBRARY_DISTANCE = 15000;
        if (nextZoneStart >= LIBRARY_DISTANCE) {
            return;  // No more schools after the library!
        }
        
        // Should we create the zone? (approaching the next occurrence)
        if (!this.isCreated && distance >= nextZoneStart - 200) {
            this.createZone();
        }
        
        // Is player in the active zone?
        if (this.isCreated) {
            const zoneStart = this.getNextZoneStart();
            const inZone = distance >= zoneStart && 
                          distance <= zoneStart + DottieBaconSchool.ZONE_LENGTH;
            
            if (inZone && !this.isActive) {
                this.activateZone();
            } else if (!inZone && this.isActive) {
                this.deactivateZone();
            }
        }
    }
    
    /**
     * Create all the zone elements
     */
    createZone() {
        if (this.isCreated) return;
        
        const zoneNum = this.currentZoneNumber + 1;
        const distanceM = (zoneNum * 500);  // Convert to meters for display
        console.log(`🏫 Creating Dottie Bacon School zone #${zoneNum} at ${distanceM}m!`);
        this.isCreated = true;
        
        // Create the school building
        this.createSchoolBuilding();
        
        // Create the windows with people
        this.createWindows();
        
        // Create the bullies
        this.createBullies();
        
        // Create the school sign
        this.createSchoolSign();
    }
    
    /**
     * Activate the zone (player entered)
     */
    activateZone() {
        console.log('🏫⚠️ Entering Dottie Bacon School zone!');
        this.isActive = true;
        
        // Show warning message
        this.showWarningMessage();
        
        // Start bully attacks
        this.bullies.forEach(bully => {
            if (bully && bully.active) {
                bully.hasSeenPlayer = false;  // Reset so they taunt again
            }
        });
    }
    
    /**
     * Deactivate the zone (player left)
     */
    deactivateZone() {
        console.log('🏫✅ Leaving Dottie Bacon School zone');
        this.isActive = false;
        
        // Trigger bonus power-up after surviving the bullies!
        // WHY? Reward the player for getting through a tough section
        if (this.scene.powerUpManager) {
            console.log('🍫 Bonus treat for surviving the bullies!');
            this.scene.powerUpManager.scheduleBonusSpawn();
        }
        
        // Clean up the school building and all visual elements
        // WHY? The school stays visible due to parallax scrolling, so we
        // fade it out and destroy it when the player leaves the zone
        this.fadeOutAndCleanup();
    }
    
    /**
     * Fade out all school visuals and clean them up
     */
    fadeOutAndCleanup() {
        console.log('🏫 Fading out Dottie Bacon School...');
        
        // Fade out the school building
        if (this.schoolBuilding) {
            this.scene.tweens.add({
                targets: this.schoolBuilding,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (this.schoolBuilding) {
                        this.schoolBuilding.destroy();
                        this.schoolBuilding = null;
                    }
                }
            });
        }
        
        // Fade out all windows
        this.windows.forEach(window => {
            if (window) {
                this.scene.tweens.add({
                    targets: window,
                    alpha: 0,
                    duration: 1000,
                    onComplete: () => {
                        window.destroy();
                    }
                });
            }
        });
        this.windows = [];
        
        // Fade out the sign text
        if (this.signText) {
            this.scene.tweens.add({
                targets: this.signText,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (this.signText) {
                        this.signText.destroy();
                        this.signText = null;
                    }
                }
            });
        }
        
        // Fade out the sign post/board graphics
        if (this.sign) {
            this.scene.tweens.add({
                targets: this.sign,
                alpha: 0,
                duration: 1000,
                onComplete: () => {
                    if (this.sign) {
                        this.sign.destroy();
                        this.sign = null;
                    }
                }
            });
        }
        
        // Clean up bullies after they've had time to exit
        this.scene.time.delayedCall(2000, () => {
            this.bullies.forEach(bully => {
                if (bully && bully.cleanup) {
                    bully.cleanup();
                }
            });
            this.bullies = [];
            console.log('🏫 Dottie Bacon School zone cleaned up!');
        });
        
        // Increment zone number so the NEXT zone can spawn at the next 500m mark
        // Zone 1 at 500m, Zone 2 at 1000m, Zone 3 at 1500m, etc.
        this.currentZoneNumber++;
        this.isCreated = false;
        
        console.log(`🏫 Next school zone will appear at ${(this.currentZoneNumber + 1) * 500}m`);
    }
    
    // =============================================================
    // CREATION METHODS
    // =============================================================
    
    /**
     * Create the run-down school building
     */
    createSchoolBuilding() {
        // Main building (drawn with graphics for that "run-down" look)
        const building = this.scene.add.graphics();
        
        // Position relative to zone start (will be positioned by background scroll)
        const buildingX = 100;
        const buildingY = 200;
        
        // Main building - dirty gray/brown
        building.fillStyle(0x696969, 1);  // Dim gray
        building.fillRect(buildingX, buildingY, 350, 250);
        
        // Darker patches (damage/dirt)
        building.fillStyle(0x505050, 1);
        building.fillRect(buildingX + 50, buildingY + 30, 40, 60);
        building.fillRect(buildingX + 200, buildingY + 100, 30, 40);
        building.fillRect(buildingX + 280, buildingY + 50, 50, 30);
        
        // Cracks
        building.lineStyle(2, 0x404040, 1);
        building.lineBetween(buildingX + 100, buildingY, buildingX + 120, buildingY + 80);
        building.lineBetween(buildingX + 250, buildingY + 150, buildingX + 280, buildingY + 200);
        building.lineBetween(buildingX + 30, buildingY + 180, buildingX + 60, buildingY + 250);
        
        // Roof (darker, damaged)
        building.fillStyle(0x4A4A4A, 1);
        building.fillTriangle(
            buildingX - 20, buildingY,
            buildingX + 175, buildingY - 60,
            buildingX + 370, buildingY
        );
        
        // Front door (broken)
        building.fillStyle(0x3E2723, 1);  // Dark brown
        building.fillRect(buildingX + 150, buildingY + 150, 50, 100);
        building.fillStyle(0x000000, 0.3);
        building.fillRect(buildingX + 155, buildingY + 155, 40, 40);  // Broken glass part
        
        // Dead bushes in front
        building.fillStyle(0x6B4423, 1);  // Brown (dead)
        building.fillCircle(buildingX + 80, buildingY + 240, 20);
        building.fillCircle(buildingX + 280, buildingY + 240, 25);
        
        // WHY depth -5? Keep school BEHIND the player so she's always visible!
        // The player has depth 10, so -5 ensures building stays in background
        building.setDepth(-5);
        building.setScrollFactor(0.3);  // Parallax with background
        
        this.schoolBuilding = building;
    }
    
    /**
     * Create windows with tired teachers and kids on phones
     */
    createWindows() {
        const windowPositions = [
            { x: 150, y: 250, type: 'teacher' },
            { x: 230, y: 250, type: 'phone_kid' },
            { x: 310, y: 250, type: 'teacher' },
            { x: 150, y: 330, type: 'phone_kid' },
            { x: 230, y: 330, type: 'phone_kid' },
            { x: 310, y: 330, type: 'teacher' }
        ];
        
        windowPositions.forEach(pos => {
            this.createWindow(pos.x, pos.y, pos.type);
        });
    }
    
    /**
     * Create a single window with a person inside
     */
    createWindow(x, y, personType) {
        const window = this.scene.add.graphics();
        
        // Window frame (dirty)
        window.fillStyle(0x505050, 1);
        window.fillRect(x, y, 50, 50);
        
        // Window glass (dim, dirty)
        window.fillStyle(0x87CEEB, 0.5);
        window.fillRect(x + 4, y + 4, 42, 42);
        
        // Window panes
        window.lineStyle(2, 0x404040, 1);
        window.lineBetween(x + 25, y + 4, x + 25, y + 46);
        window.lineBetween(x + 4, y + 25, x + 46, y + 25);
        
        // Person silhouette
        if (personType === 'teacher') {
            // Tired teacher - slumped over
            window.fillStyle(0x333333, 0.8);
            window.fillCircle(x + 25, y + 18, 8);  // Head
            window.fillRect(x + 18, y + 25, 14, 15);  // Body
            
            // Coffee cup
            window.fillStyle(0x8B4513, 0.8);
            window.fillRect(x + 35, y + 28, 6, 8);
        } else {
            // Kid on phone
            window.fillStyle(0x333333, 0.8);
            window.fillCircle(x + 25, y + 18, 7);  // Head (looking down)
            window.fillRect(x + 19, y + 24, 12, 12);  // Body
            
            // Phone (glowing)
            window.fillStyle(0x00BFFF, 0.9);
            window.fillRect(x + 22, y + 26, 6, 8);
        }
        
        // WHY depth -4? Keep windows BEHIND the player (depth 10)
        window.setDepth(-4);
        window.setScrollFactor(0.3);
        
        this.windows.push(window);
    }
    
    /**
     * Create the bullies outside the school
     * 
     * NEW PATROL SYSTEM:
     * Bullies now patrol across the screen! They enter from either side,
     * charge through throwing word bubbles, and exit the opposite side.
     */
    createBullies() {
        // Create 2 bullies with staggered entries
        // WHY only 2? They're more aggressive now, 2 is plenty challenging!
        // They'll patrol on their own - we just need to create them
        
        // First bully enters from right
        this.scene.time.delayedCall(500, () => {
            const bully1 = new Bully(this.scene, 0, 505, true);  // Start from right
            this.bullies.push(bully1);
        });
        
        // Second bully enters from left after a delay
        this.scene.time.delayedCall(2500, () => {
            const bully2 = new Bully(this.scene, 0, 505, false);  // Start from left
            this.bullies.push(bully2);
        });
        
        console.log('😈 Bullies will patrol the school zone!');
    }
    
    /**
     * Create the school sign
     */
    createSchoolSign() {
        // Crooked, damaged sign
        const sign = this.scene.add.graphics();
        
        // Sign post
        sign.fillStyle(0x4A4A4A, 1);
        sign.fillRect(450, 380, 8, 80);
        
        // Sign board (crooked)
        sign.fillStyle(0x2F4F4F, 1);
        sign.fillRect(380, 350, 150, 40);
        
        // WHY depth -3? Keep sign BEHIND the player (depth 10)
        sign.setDepth(-3);
        sign.setScrollFactor(0.3);
        
        // Save reference so we can clean it up later
        this.sign = sign;
        
        // Sign text
        this.signText = this.scene.add.text(455, 370, '🏫 DOTTIE BACON\n   SCHOOL', {
            fontSize: '11px',
            fontFamily: 'Arial',
            color: '#CCCCCC',
            fontStyle: 'bold',
            align: 'center'
        });
        this.signText.setOrigin(0.5);
        this.signText.setRotation(Phaser.Math.DegToRad(5));  // Slightly crooked
        // WHY depth -2? Just above sign board but still behind player
        this.signText.setDepth(-2);
        this.signText.setScrollFactor(0.3);
    }
    
    /**
     * Show warning message when entering the zone
     */
    showWarningMessage() {
        const warning = this.scene.add.text(
            400, 150,
            '⚠️ DOTTIE BACON SCHOOL ZONE ⚠️\nWatch out for bullies!',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#FF4444',
                backgroundColor: 'rgba(0,0,0,0.8)',
                padding: { x: 15, y: 10 },
                fontStyle: 'bold',
                align: 'center'
            }
        );
        warning.setOrigin(0.5);
        warning.setDepth(200);
        warning.setScrollFactor(0);  // Fixed to camera
        
        // Fade in and out
        warning.setAlpha(0);
        this.scene.tweens.add({
            targets: warning,
            alpha: 1,
            duration: 500,
            yoyo: true,
            hold: 2000,
            onComplete: () => warning.destroy()
        });
    }
    
    // =============================================================
    // UPDATE METHOD
    // =============================================================
    
    /**
     * Update all zone elements
     * 
     * @param {Student} player - The player reference
     */
    update(player) {
        if (!this.isActive || !player) return;
        
        // Update all bullies
        this.bullies.forEach(bully => {
            if (bully && bully.active) {
                bully.update(player);
            }
        });
    }
    
    // =============================================================
    // CLEANUP
    // =============================================================
    
    /**
     * Clean up the entire zone
     */
    cleanup() {
        // Clean up bullies
        this.bullies.forEach(bully => {
            if (bully) bully.cleanup();
        });
        this.bullies = [];
        
        // Clean up graphics
        if (this.schoolBuilding) this.schoolBuilding.destroy();
        this.windows.forEach(w => w.destroy());
        if (this.signText) this.signText.destroy();
        
        this.isCreated = false;
        this.isActive = false;
    }
}
