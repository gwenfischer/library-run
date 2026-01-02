/**
 * ConfidenceMeter Class
 * 
 * A visual UI component that displays the student's confidence level.
 * Think of it like a health bar in other games, but for CONFIDENCE!
 * 
 * WHY a separate class?
 * - Keeps UI code separate from game logic
 * - Easy to customize the look without touching other code
 * - Can be reused or replaced easily
 * 
 * The bar changes color based on confidence level:
 * - GREEN (>60%): Feeling great!
 * - YELLOW (30-60%): Getting nervous...
 * - RED (<30%): In trouble!
 */
class ConfidenceMeter {
    
    // =============================================================
    // STATIC PROPERTIES
    // Colors and dimensions for the confidence bar
    // =============================================================
    
    // Bar dimensions
    static BAR_WIDTH = 200;       // Full width of the bar
    static BAR_HEIGHT = 25;       // Height of the bar
    static BAR_X = 20;            // X position (from left edge)
    static BAR_Y = 50;            // Y position (from top)
    static BORDER_WIDTH = 3;      // Border thickness
    
    // Colors for different confidence levels
    // WHY multiple colors? Visual feedback helps players understand urgency!
    static COLOR_HIGH = 0x4CAF50;      // Green - confident!
    static COLOR_MEDIUM = 0xFFC107;    // Yellow - be careful!
    static COLOR_LOW = 0xF44336;       // Red - danger!
    static COLOR_BACKGROUND = 0x333333; // Dark gray background
    static COLOR_BORDER = 0x222222;     // Darker border
    
    // Thresholds for color changes (as decimals)
    static THRESHOLD_HIGH = 0.6;   // Above 60% = green
    static THRESHOLD_MEDIUM = 0.3; // Above 30% = yellow, below = red
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create a new ConfidenceMeter
     * 
     * @param {Phaser.Scene} scene - The game scene to add the UI to
     * @param {number} maxConfidence - Maximum confidence value (usually 100)
     */
    constructor(scene, maxConfidence = 100) {
        this.scene = scene;
        this.maxConfidence = maxConfidence;
        this.currentConfidence = maxConfidence;  // Start at full!
        
        // Create all the visual elements
        this.createLabel();
        this.createBar();
        this.createPercentageText();
        this.createEmoji();
        
        // Initial update to set everything correctly
        this.updateDisplay();
        
        console.log('💪 Confidence Meter created!');
    }
    
    // =============================================================
    // CREATION METHODS
    // Build each part of the UI
    // =============================================================
    
    /**
     * Create the "Confidence" label text
     */
    createLabel() {
        this.label = this.scene.add.text(
            ConfidenceMeter.BAR_X, 
            ConfidenceMeter.BAR_Y - 25,
            '💪 Confidence',
            {
                fontSize: '18px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        
        // Set high depth so UI is always on top
        // WHY depth 1000? Ensures UI draws above all game objects
        this.label.setDepth(1000);
        
        // Make UI stay fixed on screen (doesn't scroll with camera)
        this.label.setScrollFactor(0);
    }
    
    /**
     * Create the confidence bar (background + fill)
     */
    createBar() {
        const x = ConfidenceMeter.BAR_X;
        const y = ConfidenceMeter.BAR_Y;
        const width = ConfidenceMeter.BAR_WIDTH;
        const height = ConfidenceMeter.BAR_HEIGHT;
        
        // Create the border/frame
        // WHY a border? Makes the bar look polished and defined
        this.border = this.scene.add.rectangle(
            x + width / 2,
            y + height / 2,
            width + ConfidenceMeter.BORDER_WIDTH * 2,
            height + ConfidenceMeter.BORDER_WIDTH * 2,
            ConfidenceMeter.COLOR_BORDER
        );
        this.border.setDepth(1000);
        this.border.setScrollFactor(0);
        
        // Create the background (shows when confidence is depleted)
        // WHY a background? Shows the "empty" portion of the bar
        this.background = this.scene.add.rectangle(
            x + width / 2,
            y + height / 2,
            width,
            height,
            ConfidenceMeter.COLOR_BACKGROUND
        );
        this.background.setDepth(1001);
        this.background.setScrollFactor(0);
        
        // Create the fill bar (the actual confidence indicator)
        // WHY setOrigin(0, 0.5)? So it grows/shrinks from the left side
        this.fillBar = this.scene.add.rectangle(
            x,
            y + height / 2,
            width,
            height,
            ConfidenceMeter.COLOR_HIGH
        );
        this.fillBar.setOrigin(0, 0.5);
        this.fillBar.setDepth(1002);
        this.fillBar.setScrollFactor(0);
    }
    
    /**
     * Create the percentage text display
     */
    createPercentageText() {
        this.percentText = this.scene.add.text(
            ConfidenceMeter.BAR_X + ConfidenceMeter.BAR_WIDTH + 15,
            ConfidenceMeter.BAR_Y + ConfidenceMeter.BAR_HEIGHT / 2,
            '100%',
            {
                fontSize: '20px',
                fontFamily: 'Arial',
                color: '#ffffff',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 2
            }
        );
        this.percentText.setOrigin(0, 0.5);
        this.percentText.setDepth(1000);
        this.percentText.setScrollFactor(0);
    }
    
    /**
     * Create the mood emoji that reflects confidence level
     * 
     * WHY an emoji? Adds personality and makes the UI more fun!
     */
    createEmoji() {
        this.emoji = this.scene.add.text(
            ConfidenceMeter.BAR_X + ConfidenceMeter.BAR_WIDTH + 70,
            ConfidenceMeter.BAR_Y + ConfidenceMeter.BAR_HEIGHT / 2,
            '😊',
            {
                fontSize: '24px'
            }
        );
        this.emoji.setOrigin(0, 0.5);
        this.emoji.setDepth(1000);
        this.emoji.setScrollFactor(0);
    }
    
    // =============================================================
    // UPDATE METHODS
    // These change the bar based on confidence level
    // =============================================================
    
    /**
     * Update the confidence value and refresh the display
     * 
     * @param {number} amount - The amount to change confidence by
     *                         Positive = gain confidence
     *                         Negative = lose confidence
     * 
     * WHY this method?
     * - Single function to call when confidence changes
     * - Handles all the visual updates automatically
     * - Includes bounds checking (can't go below 0 or above max)
     * 
     * @example
     * // Player gets hit by newspaper
     * confidenceMeter.updateConfidence(-10);
     * 
     * // Player collects power-up
     * confidenceMeter.updateConfidence(15);
     */
    updateConfidence(amount) {
        // Update the current confidence value
        this.currentConfidence += amount;
        
        // Clamp to valid range (0 to max)
        // WHY clamp? Can't have negative confidence or more than 100%!
        if (this.currentConfidence < 0) {
            this.currentConfidence = 0;
        }
        if (this.currentConfidence > this.maxConfidence) {
            this.currentConfidence = this.maxConfidence;
        }
        
        // Update all the visual elements
        this.updateDisplay();
        
        // Play a visual effect based on whether we gained or lost
        if (amount < 0) {
            this.playDamageEffect();
        } else if (amount > 0) {
            this.playHealEffect();
        }
        
        // Log for debugging
        const emoji = amount < 0 ? '💔' : '💚';
        console.log(`${emoji} Confidence ${amount < 0 ? '' : '+'}${amount} → ${this.currentConfidence}%`);
    }
    
    /**
     * Set confidence to an exact value (not relative)
     * 
     * @param {number} value - The exact confidence value to set
     * 
     * WHY this method?
     * - Sometimes we need to set a specific value (like resetting to 100)
     * - Different from updateConfidence which adds/subtracts
     */
    setConfidence(value) {
        this.currentConfidence = Math.max(0, Math.min(value, this.maxConfidence));
        this.updateDisplay();
    }
    
    /**
     * Update all visual elements to match current confidence
     * 
     * WHY separate from updateConfidence?
     * - Can be called independently (like on initialization)
     * - Keeps the display logic in one place
     */
    updateDisplay() {
        // Calculate confidence as a percentage (0 to 1)
        const percent = this.currentConfidence / this.maxConfidence;
        
        // Update bar width
        this.updateBarWidth(percent);
        
        // Update bar color
        this.updateBarColor(percent);
        
        // Update percentage text
        this.updatePercentText();
        
        // Update mood emoji
        this.updateEmoji(percent);
    }
    
    /**
     * Update the fill bar's width based on confidence percentage
     * 
     * @param {number} percent - Confidence as decimal (0.0 to 1.0)
     */
    updateBarWidth(percent) {
        // Calculate new width
        const newWidth = ConfidenceMeter.BAR_WIDTH * percent;
        
        // Animate the width change for smooth transitions
        // WHY tween? Smooth animation looks better than instant change
        this.scene.tweens.add({
            targets: this.fillBar,
            width: newWidth,
            duration: 200,  // 200ms transition
            ease: 'Power2'  // Smooth easing
        });
    }
    
    /**
     * Update the fill bar's color based on confidence level
     * 
     * @param {number} percent - Confidence as decimal (0.0 to 1.0)
     * 
     * WHY change colors?
     * - Green/yellow/red is universally understood
     * - Creates urgency when confidence is low
     * - Rewards player with green when doing well
     */
    updateBarColor(percent) {
        let newColor;
        
        if (percent > ConfidenceMeter.THRESHOLD_HIGH) {
            // Above 60% - feeling confident!
            newColor = ConfidenceMeter.COLOR_HIGH;
        } else if (percent > ConfidenceMeter.THRESHOLD_MEDIUM) {
            // Between 30-60% - getting nervous
            newColor = ConfidenceMeter.COLOR_MEDIUM;
        } else {
            // Below 30% - in trouble!
            newColor = ConfidenceMeter.COLOR_LOW;
        }
        
        // Apply the new color
        this.fillBar.setFillStyle(newColor);
    }
    
    /**
     * Update the percentage text display
     */
    updatePercentText() {
        const percent = Math.round((this.currentConfidence / this.maxConfidence) * 100);
        this.percentText.setText(`${percent}%`);
    }
    
    /**
     * Update the mood emoji based on confidence level
     * 
     * @param {number} percent - Confidence as decimal (0.0 to 1.0)
     */
    updateEmoji(percent) {
        let emoji;
        
        if (percent > 0.8) {
            emoji = '😄';  // Very confident - big smile!
        } else if (percent > 0.6) {
            emoji = '😊';  // Confident - happy
        } else if (percent > 0.4) {
            emoji = '😐';  // Okay - neutral
        } else if (percent > 0.2) {
            emoji = '😟';  // Worried
        } else if (percent > 0) {
            emoji = '😰';  // Very worried!
        } else {
            emoji = '😭';  // Game over - crying
        }
        
        this.emoji.setText(emoji);
    }
    
    // =============================================================
    // VISUAL EFFECT METHODS
    // Make the UI feel alive and responsive
    // =============================================================
    
    /**
     * Play a visual effect when taking damage
     * 
     * WHY effects?
     * - Immediate feedback that something happened
     * - Makes the game feel more responsive
     * - Helps players notice important changes
     */
    playDamageEffect() {
        // Flash the bar red briefly
        const originalColor = this.fillBar.fillColor;
        this.fillBar.setFillStyle(0xff0000);
        
        // Shake the bar
        this.scene.tweens.add({
            targets: [this.fillBar, this.background, this.border],
            x: '+=5',
            duration: 50,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
                // Restore proper color after shake
                this.updateBarColor(this.currentConfidence / this.maxConfidence);
            }
        });
        
        // Scale up the emoji briefly
        this.scene.tweens.add({
            targets: this.emoji,
            scale: 1.5,
            duration: 100,
            yoyo: true
        });
    }
    
    /**
     * Play a visual effect when healing/gaining confidence
     */
    playHealEffect() {
        // Flash green and pulse
        this.scene.tweens.add({
            targets: this.fillBar,
            scaleY: 1.2,
            duration: 100,
            yoyo: true
        });
        
        // Bounce the emoji happily
        this.scene.tweens.add({
            targets: this.emoji,
            y: this.emoji.y - 10,
            duration: 150,
            yoyo: true,
            ease: 'Bounce.easeOut'
        });
    }
    
    // =============================================================
    // UTILITY METHODS
    // =============================================================
    
    /**
     * Get the current confidence value
     * 
     * @returns {number} Current confidence (0 to maxConfidence)
     */
    getConfidence() {
        return this.currentConfidence;
    }
    
    /**
     * Get confidence as a percentage (0-1)
     * 
     * @returns {number} Confidence as decimal
     */
    getConfidencePercent() {
        return this.currentConfidence / this.maxConfidence;
    }
    
    /**
     * Check if confidence is depleted (game over condition)
     * 
     * @returns {boolean} True if confidence is 0
     */
    isDepleted() {
        return this.currentConfidence <= 0;
    }
    
    /**
     * Reset confidence to maximum
     * 
     * WHY this method?
     * - Useful for restarting the game
     * - Quick way to restore full confidence
     */
    reset() {
        this.currentConfidence = this.maxConfidence;
        this.updateDisplay();
        console.log('💪 Confidence restored to 100%!');
    }
}
