/**
 * TouchControls Class
 * 
 * Provides on-screen touch controls for mobile and tablet devices (iPad).
 * Allows players to control the game with touch buttons instead of keyboard.
 * 
 * WHY touch controls?
 * - iPad and mobile devices don't have physical keyboards readily available
 * - Makes the game playable on a wider range of devices
 * - Touch controls are intuitive and familiar to mobile users
 */
class TouchControls {
    
    /**
     * Create touch control buttons
     * 
     * @param {Phaser.Scene} scene - The game scene
     * @param {Player} player - The player object to control
     */
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        
        // Track which buttons are currently pressed
        // WHY? We need to know the button states for the player update loop
        this.leftPressed = false;
        this.rightPressed = false;
        this.jumpPressed = false;
        
        // Check if we're on a touch device
        // WHY? Only show touch controls on devices that need them
        this.isTouchDevice = this.detectTouchDevice();
        
        if (this.isTouchDevice) {
            this.createButtons();
            console.log('📱 Touch controls enabled for mobile/tablet');
        } else {
            console.log('🖱️ Desktop detected - keyboard controls active');
        }
    }
    
    /**
     * Detect if the device has touch capability
     * 
     * WHY check this?
     * - Desktop users don't need touch buttons cluttering the screen
     * - Touch devices benefit from visible, tappable controls
     * 
     * @returns {boolean} True if touch is available
     */
    detectTouchDevice() {
        // Check multiple indicators of touch support
        // WHY multiple checks? Different browsers expose touch differently
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    }
    
    /**
     * Create the on-screen control buttons
     * 
     * WHY separate method?
     * - Keeps constructor clean
     * - Easy to modify button layout
     */
    createButtons() {
        // Button styling configuration
        // WHY these values? Large enough for thumbs, visible but not obtrusive
        const buttonSize = 80;
        const buttonColor = 0x4A90E2;
        const jumpButtonColor = 0xE74C3C;
        const buttonAlpha = 0.7;
        const buttonY = this.scene.game.config.height - 100;
        
        // =============================================================
        // LEFT BUTTON
        // =============================================================
        
        const leftX = 60;
        
        // Create left arrow button
        this.leftButton = this.scene.add.circle(leftX, buttonY, buttonSize / 2, buttonColor, buttonAlpha);
        this.leftButton.setInteractive();
        this.leftButton.setScrollFactor(0); // Don't scroll with camera
        this.leftButton.setDepth(1000); // Always on top
        
        // Add arrow symbol
        const leftArrow = this.scene.add.text(leftX, buttonY, '◀', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        leftArrow.setOrigin(0.5);
        leftArrow.setScrollFactor(0);
        leftArrow.setDepth(1001);
        
        // Touch event handlers for left button
        this.leftButton.on('pointerdown', () => {
            this.leftPressed = true;
            this.leftButton.setFillStyle(buttonColor, 1.0); // Full opacity when pressed
        });
        
        this.leftButton.on('pointerup', () => {
            this.leftPressed = false;
            this.leftButton.setFillStyle(buttonColor, buttonAlpha);
        });
        
        this.leftButton.on('pointerout', () => {
            this.leftPressed = false;
            this.leftButton.setFillStyle(buttonColor, buttonAlpha);
        });
        
        // =============================================================
        // RIGHT BUTTON
        // =============================================================
        
        const rightX = 160;
        
        // Create right arrow button
        this.rightButton = this.scene.add.circle(rightX, buttonY, buttonSize / 2, buttonColor, buttonAlpha);
        this.rightButton.setInteractive();
        this.rightButton.setScrollFactor(0);
        this.rightButton.setDepth(1000);
        
        // Add arrow symbol
        const rightArrow = this.scene.add.text(rightX, buttonY, '▶', {
            fontSize: '48px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        rightArrow.setOrigin(0.5);
        rightArrow.setScrollFactor(0);
        rightArrow.setDepth(1001);
        
        // Touch event handlers for right button
        this.rightButton.on('pointerdown', () => {
            this.rightPressed = true;
            this.rightButton.setFillStyle(buttonColor, 1.0);
        });
        
        this.rightButton.on('pointerup', () => {
            this.rightPressed = false;
            this.rightButton.setFillStyle(buttonColor, buttonAlpha);
        });
        
        this.rightButton.on('pointerout', () => {
            this.rightPressed = false;
            this.rightButton.setFillStyle(buttonColor, buttonAlpha);
        });
        
        // =============================================================
        // JUMP BUTTON
        // =============================================================
        
        const jumpX = this.scene.game.config.width - 80;
        
        // Create jump button (larger than movement buttons)
        this.jumpButton = this.scene.add.circle(jumpX, buttonY, buttonSize / 1.5, jumpButtonColor, buttonAlpha);
        this.jumpButton.setInteractive();
        this.jumpButton.setScrollFactor(0);
        this.jumpButton.setDepth(1000);
        
        // Add jump symbol
        const jumpText = this.scene.add.text(jumpX, buttonY, '▲', {
            fontSize: '56px',
            color: '#ffffff',
            fontStyle: 'bold'
        });
        jumpText.setOrigin(0.5);
        jumpText.setScrollFactor(0);
        jumpText.setDepth(1001);
        
        // Track if jump button was just pressed this frame
        // WHY? Prevents continuous jumping when holding the button
        this.jumpJustPressed = false;
        this.jumpWasDown = false;
        
        // Touch event handlers for jump button
        this.jumpButton.on('pointerdown', () => {
            if (!this.jumpWasDown) {
                this.jumpJustPressed = true;
            }
            this.jumpWasDown = true;
            this.jumpButton.setFillStyle(jumpButtonColor, 1.0);
        });
        
        this.jumpButton.on('pointerup', () => {
            this.jumpWasDown = false;
            this.jumpButton.setFillStyle(jumpButtonColor, buttonAlpha);
        });
        
        this.jumpButton.on('pointerout', () => {
            this.jumpWasDown = false;
            this.jumpButton.setFillStyle(jumpButtonColor, buttonAlpha);
        });
        
        // Store arrow references for cleanup
        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;
        this.jumpText = jumpText;
    }
    
    /**
     * Check if the left button is pressed
     * 
     * @returns {boolean} True if left is pressed
     */
    isLeftPressed() {
        return this.isTouchDevice && this.leftPressed;
    }
    
    /**
     * Check if the right button is pressed
     * 
     * @returns {boolean} True if right is pressed
     */
    isRightPressed() {
        return this.isTouchDevice && this.rightPressed;
    }
    
    /**
     * Check if the jump button was just pressed
     * Similar to Phaser.Input.Keyboard.JustDown()
     * 
     * @returns {boolean} True if jump was just pressed
     */
    isJumpJustPressed() {
        if (this.isTouchDevice && this.jumpJustPressed) {
            // Clear the flag after reading it
            // WHY? Ensures we only register one jump per press
            this.jumpJustPressed = false;
            return true;
        }
        return false;
    }
    
    /**
     * Update method (called each frame)
     * 
     * WHY needed?
     * - Resets frame-specific flags
     */
    update() {
        // jumpJustPressed is cleared when read, so nothing needed here
        // This method exists for future expansion
    }
    
    /**
     * Destroy the touch controls
     * 
     * WHY?
     * - Clean up when scene changes or resets
     * - Prevents memory leaks
     */
    destroy() {
        if (this.leftButton) {
            this.leftButton.destroy();
            this.leftArrow.destroy();
        }
        if (this.rightButton) {
            this.rightButton.destroy();
            this.rightArrow.destroy();
        }
        if (this.jumpButton) {
            this.jumpButton.destroy();
            this.jumpText.destroy();
        }
    }
}
