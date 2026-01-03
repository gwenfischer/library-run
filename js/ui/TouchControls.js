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
        
        // Track pointer IDs for multi-touch support
        // WHY? Allows us to properly handle multiple simultaneous touches
        this.leftPointerId = null;
        this.rightPointerId = null;
        this.jumpPointerId = null;
        
        // Check if we're on a touch device
        // WHY? Only show touch controls on devices that need them
        this.isTouchDevice = this.detectTouchDevice();
        
        if (this.isTouchDevice) {
            this.createButtons();
            this.setupGlobalPointerHandlers();
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
        const buttonSize = 96; // Slightly larger for iPad comfort
        this.buttonColor = 0x4A90E2;
        this.jumpButtonColor = 0xE74C3C;
        this.buttonAlpha = 0.7;
        const buttonY = this.scene.game.config.height - 100;

        // Allow multiple simultaneous touches (move + jump together)
        this.scene.input.addPointer(2); // Default has 1; +2 gives 3 pointers
        
        // =============================================================
        // LEFT BUTTON
        // =============================================================
        
        const leftX = 72;
        
        // Create left arrow button
        this.leftButton = this.scene.add.circle(leftX, buttonY, buttonSize / 2, this.buttonColor, this.buttonAlpha);
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
        // WHY track pointer ID? Ensures we only release when the correct finger lifts
        this.leftButton.on('pointerdown', (pointer) => {
            if (this.leftPointerId === null) {
                this.leftPointerId = pointer.id;
                this.leftPressed = true;
                this.leftButton.setFillStyle(this.buttonColor, 1.0); // Full opacity when pressed
            }
        });
        
        // Handle pointerup on the button itself (in case global handler misses it)
        this.leftButton.on('pointerup', (pointer) => {
            if (this.leftPointerId === pointer.id) {
                this.leftPressed = false;
                this.leftPointerId = null;
                this.leftButton.setFillStyle(this.buttonColor, this.buttonAlpha);
            }
        });
        
        // =============================================================
        // RIGHT BUTTON
        // =============================================================
        
        const rightX = 180;
        
        // Create right arrow button
        this.rightButton = this.scene.add.circle(rightX, buttonY, buttonSize / 2, this.buttonColor, this.buttonAlpha);
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
        // WHY track pointer ID? Ensures we only release when the correct finger lifts
        this.rightButton.on('pointerdown', (pointer) => {
            if (this.rightPointerId === null) {
                this.rightPointerId = pointer.id;
                this.rightPressed = true;
                this.rightButton.setFillStyle(this.buttonColor, 1.0);
            }
        });
        
        // Handle pointerup on the button itself (in case global handler misses it)
        this.rightButton.on('pointerup', (pointer) => {
            if (this.rightPointerId === pointer.id) {
                this.rightPressed = false;
                this.rightPointerId = null;
                this.rightButton.setFillStyle(this.buttonColor, this.buttonAlpha);
            }
        });
        
        // =============================================================
        // JUMP BUTTON
        // =============================================================
        
        const jumpX = this.scene.game.config.width - 90;
        
        // Create jump button (larger than movement buttons)
        this.jumpButton = this.scene.add.circle(jumpX, buttonY, buttonSize / 1.5, this.jumpButtonColor, this.buttonAlpha);
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
        // WHY track pointer ID? Ensures we only release when the correct finger lifts
        this.jumpButton.on('pointerdown', (pointer) => {
            if (this.jumpPointerId === null) {
                this.jumpPointerId = pointer.id;
                if (!this.jumpWasDown) {
                    this.jumpJustPressed = true;
                }
                this.jumpWasDown = true;
                this.jumpButton.setFillStyle(this.jumpButtonColor, 1.0);
            }
        });
        
        // Handle pointerup on the button itself (in case global handler misses it)
        this.jumpButton.on('pointerup', (pointer) => {
            if (this.jumpPointerId === pointer.id) {
                this.jumpWasDown = false;
                this.jumpPointerId = null;
                this.jumpButton.setFillStyle(this.jumpButtonColor, this.buttonAlpha);
            }
        });
        
        // Store arrow references for cleanup
        this.leftArrow = leftArrow;
        this.rightArrow = rightArrow;
        this.jumpText = jumpText;
    }
    
    /**
     * Set up global pointer handlers for proper multi-touch support
     * 
     * WHY global handlers?
     * - Prevents pointerout issues when fingers move between buttons
     * - Ensures touches are only released on actual pointerup events
     * - Enables true simultaneous multi-touch (move + jump together)
     */
    setupGlobalPointerHandlers() {
        // Store the handler function so we can remove it in destroy()
        // WHY? Prevents memory leaks when touch controls are destroyed
        this.globalPointerUpHandler = (pointer) => {
            // Check if this pointer was controlling the left button
            // WHY null check? Handler may fire after buttons are destroyed
            if (this.leftPointerId === pointer.id && this.leftButton) {
                this.leftPressed = false;
                this.leftPointerId = null;
                this.leftButton.setFillStyle(this.buttonColor, this.buttonAlpha);
            }
            
            // Check if this pointer was controlling the right button
            if (this.rightPointerId === pointer.id && this.rightButton) {
                this.rightPressed = false;
                this.rightPointerId = null;
                this.rightButton.setFillStyle(this.buttonColor, this.buttonAlpha);
            }
            
            // Check if this pointer was controlling the jump button
            if (this.jumpPointerId === pointer.id && this.jumpButton) {
                this.jumpWasDown = false;
                this.jumpPointerId = null;
                this.jumpButton.setFillStyle(this.jumpButtonColor, this.buttonAlpha);
            }
        };
        
        // Handle all pointerup events globally
        // WHY? So we catch pointer releases even if they happen outside the button
        this.scene.input.on('pointerup', this.globalPointerUpHandler);
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
        // Remove global pointer handler to prevent memory leaks
        // WHY check scene/input? They may be destroyed before touch controls
        if (this.globalPointerUpHandler && this.scene && this.scene.input) {
            this.scene.input.off('pointerup', this.globalPointerUpHandler);
        }
        
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
