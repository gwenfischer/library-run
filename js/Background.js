/**
 * Background Class
 * 
 * Creates a scrolling parallax background that makes it feel like
 * the student is walking down a long neighborhood street!
 * 
 * WHY parallax scrolling?
 * - Creates depth and visual interest
 * - Distant things (clouds, sun) move slower than close things (houses, ground)
 * - Makes the game world feel bigger and more immersive
 * 
 * LAYERS (back to front):
 * 1. Sky gradient (static)
 * 2. Sun and clouds (very slow scroll)
 * 3. Background houses (slow scroll)
 * 4. Foreground details like trees and bushes (medium scroll)
 * 5. Ground/sidewalk (fast scroll - matches player speed)
 */
class Background {
    
    // =============================================================
    // STATIC PROPERTIES
    // =============================================================
    
    // Scroll speeds for each layer (multipliers)
    // WHY different speeds? Creates the parallax effect!
    // Lower numbers = slower = appears farther away
    static CLOUD_SPEED = 0.1;      // Clouds drift slowly
    static HOUSE_SPEED = 0.3;      // Houses move at medium-slow speed
    static TREE_SPEED = 0.5;       // Trees are closer, move faster
    static GROUND_SPEED = 1.0;     // Ground matches camera/player
    
    // Base scroll speed (pixels per second)
    // WHY 100? Feels like a comfortable walking pace
    static BASE_SCROLL_SPEED = 100;
    
    // =============================================================
    // CONSTRUCTOR
    // =============================================================
    
    /**
     * Create the scrolling background
     * 
     * @param {Phaser.Scene} scene - The game scene
     */
    constructor(scene) {
        this.scene = scene;
        
        // Track scroll position for parallax effect
        this.scrollX = 0;
        
        // Store all our layer elements
        this.layers = {
            clouds: [],
            houses: [],
            trees: [],
            groundDetails: []
        };
        
        // Create all the background layers
        this.createSky();
        this.createSun();
        this.createClouds();
        this.createHouses();
        this.createTrees();
        this.createGround();
        
        console.log('🏘️ Neighborhood background created!');
    }
    
    // =============================================================
    // LAYER CREATION METHODS
    // =============================================================
    
    /**
     * Create the sky gradient background
     * 
     * WHY a gradient? More interesting than a flat color!
     * Lighter at the horizon, deeper blue at the top
     */
    createSky() {
        // Create a graphics object for the sky gradient
        const skyGraphics = this.scene.add.graphics();
        
        // Draw gradient rectangles (simulate a gradient)
        // WHY rectangles? Phaser doesn't have built-in gradients, but
        // stacking colored rectangles works great!
        const colors = [
            0x87CEEB,  // Light sky blue (horizon)
            0x7EC8E3,
            0x6BC1E0,
            0x5AB9DC,
            0x4AB1D8,  // Deeper blue (top)
        ];
        
        const stripHeight = 120;  // 600 / 5 strips
        
        colors.forEach((color, index) => {
            skyGraphics.fillStyle(color, 1);
            skyGraphics.fillRect(0, (4 - index) * stripHeight, 800, stripHeight);
        });
        
        // Set depth to be behind everything
        // WHY setDepth? Controls draw order - lower numbers draw first (behind)
        skyGraphics.setDepth(-100);
    }
    
    /**
     * Create the sun
     * 
     * WHY a sun? Adds cheerfulness and establishes time of day!
     */
    createSun() {
        const sunGraphics = this.scene.add.graphics();
        
        // Draw a bright yellow sun
        sunGraphics.fillStyle(0xFFEB3B, 1);
        sunGraphics.fillCircle(650, 80, 40);
        
        // Add a lighter glow around it
        sunGraphics.fillStyle(0xFFF9C4, 0.3);
        sunGraphics.fillCircle(650, 80, 55);
        
        sunGraphics.setDepth(-95);
        
        this.sun = sunGraphics;
    }
    
    /**
     * Create fluffy clouds
     * 
     * WHY multiple clouds? They scroll across the sky for ambiance
     */
    createClouds() {
        // Create several clouds at different positions
        const cloudPositions = [
            { x: 100, y: 60, scale: 1 },
            { x: 300, y: 100, scale: 0.8 },
            { x: 500, y: 50, scale: 1.2 },
            { x: 700, y: 120, scale: 0.7 },
            { x: 900, y: 80, scale: 1 },      // Off-screen, will scroll in
            { x: 1100, y: 110, scale: 0.9 },
        ];
        
        cloudPositions.forEach(pos => {
            const cloud = this.createSingleCloud(pos.x, pos.y, pos.scale);
            this.layers.clouds.push(cloud);
        });
    }
    
    /**
     * Create a single cloud
     * 
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} scale - Size multiplier
     * @returns {Phaser.GameObjects.Graphics} The cloud graphic
     */
    createSingleCloud(x, y, scale) {
        const cloud = this.scene.add.graphics();
        
        // Draw fluffy cloud shape using overlapping circles
        // WHY circles? Creates that classic puffy cloud look!
        cloud.fillStyle(0xFFFFFF, 0.9);
        cloud.fillCircle(0, 0, 25 * scale);
        cloud.fillCircle(25 * scale, -10 * scale, 20 * scale);
        cloud.fillCircle(50 * scale, 0, 25 * scale);
        cloud.fillCircle(25 * scale, 5 * scale, 22 * scale);
        
        cloud.setPosition(x, y);
        cloud.setDepth(-90);
        
        // Store original X for wrapping calculation
        cloud.originalX = x;
        
        return cloud;
    }
    
    /**
     * Create background houses
     * 
     * WHY houses? It's a neighborhood! The student is walking past homes.
     */
    createHouses() {
        // Create houses spaced along the street
        // We need extras off-screen for seamless scrolling
        const houseSpacing = 200;
        const numHouses = 8;  // Enough to fill screen + buffer
        
        for (let i = 0; i < numHouses; i++) {
            const x = i * houseSpacing;
            const house = this.createSingleHouse(x);
            this.layers.houses.push(house);
        }
    }
    
    /**
     * Create a single house
     * 
     * @param {number} x - X position
     * @returns {Phaser.GameObjects.Container} Container with house elements
     */
    createSingleHouse(x) {
        // Use a container to group house parts
        // WHY container? Move all parts together easily
        const container = this.scene.add.container(x, 380);
        
        const houseGraphics = this.scene.add.graphics();
        
        // Randomize house color for variety
        const houseColors = [0xE8D4B8, 0xD4C4B0, 0xBFAFA0, 0xC9B99A, 0xE0D0C0];
        const roofColors = [0x8B4513, 0x654321, 0x5D4037, 0x6D4C41, 0x795548];
        const houseColor = Phaser.Math.RND.pick(houseColors);
        const roofColor = Phaser.Math.RND.pick(roofColors);
        
        // Randomize house size slightly
        const width = Phaser.Math.Between(80, 120);
        const height = Phaser.Math.Between(60, 90);
        
        // Draw house body
        houseGraphics.fillStyle(houseColor, 1);
        houseGraphics.fillRect(-width/2, -height, width, height);
        
        // Draw roof (triangle)
        houseGraphics.fillStyle(roofColor, 1);
        houseGraphics.fillTriangle(
            -width/2 - 10, -height,      // Left point
            width/2 + 10, -height,       // Right point
            0, -height - 40              // Top point
        );
        
        // Draw door
        houseGraphics.fillStyle(0x5D4037, 1);
        houseGraphics.fillRect(-10, -35, 20, 35);
        
        // Draw window(s)
        houseGraphics.fillStyle(0x87CEEB, 1);
        houseGraphics.fillRect(-width/2 + 15, -height + 20, 20, 20);
        if (width > 90) {
            houseGraphics.fillRect(width/2 - 35, -height + 20, 20, 20);
        }
        
        // Window frames
        houseGraphics.lineStyle(2, 0xFFFFFF, 1);
        houseGraphics.strokeRect(-width/2 + 15, -height + 20, 20, 20);
        houseGraphics.lineBetween(-width/2 + 25, -height + 20, -width/2 + 25, -height + 40);
        houseGraphics.lineBetween(-width/2 + 15, -height + 30, -width/2 + 35, -height + 30);
        
        container.add(houseGraphics);
        container.setDepth(-50);
        
        // Store original X for wrapping
        container.originalX = x;
        
        return container;
    }
    
    /**
     * Create trees and bushes
     * 
     * WHY trees? Adds life and variety to the street scene
     */
    createTrees() {
        // Create trees at various positions
        const treeSpacing = 150;
        const numTrees = 10;
        
        for (let i = 0; i < numTrees; i++) {
            const x = i * treeSpacing + 50;  // Offset from houses
            
            // Randomly create either a tree or a bush
            const isTree = Phaser.Math.RND.frac() > 0.4;
            
            if (isTree) {
                const tree = this.createSingleTree(x);
                this.layers.trees.push(tree);
            } else {
                const bush = this.createSingleBush(x);
                this.layers.trees.push(bush);
            }
        }
    }
    
    /**
     * Create a single tree
     */
    createSingleTree(x) {
        const container = this.scene.add.container(x, 500);
        const treeGraphics = this.scene.add.graphics();
        
        // Tree trunk
        treeGraphics.fillStyle(0x5D4037, 1);
        treeGraphics.fillRect(-8, -60, 16, 60);
        
        // Tree foliage (overlapping circles for a full look)
        const greenShades = [0x2E7D32, 0x388E3C, 0x43A047];
        const shade = Phaser.Math.RND.pick(greenShades);
        
        treeGraphics.fillStyle(shade, 1);
        treeGraphics.fillCircle(0, -80, 35);
        treeGraphics.fillCircle(-20, -65, 25);
        treeGraphics.fillCircle(20, -65, 25);
        treeGraphics.fillCircle(0, -60, 20);
        
        container.add(treeGraphics);
        container.setDepth(-30);
        container.originalX = x;
        
        return container;
    }
    
    /**
     * Create a single bush
     */
    createSingleBush(x) {
        const container = this.scene.add.container(x, 520);
        const bushGraphics = this.scene.add.graphics();
        
        // Bush (overlapping circles)
        const greenShades = [0x558B2F, 0x689F38, 0x7CB342];
        const shade = Phaser.Math.RND.pick(greenShades);
        
        bushGraphics.fillStyle(shade, 1);
        bushGraphics.fillCircle(0, -15, 20);
        bushGraphics.fillCircle(-15, -10, 15);
        bushGraphics.fillCircle(15, -10, 15);
        
        container.add(bushGraphics);
        container.setDepth(-30);
        container.originalX = x;
        
        return container;
    }
    
    /**
     * Create the ground/sidewalk
     * 
     * WHY detailed ground? The player walks on it - it should look good!
     */
    createGround() {
        // Create grass strip above sidewalk
        this.grassTiles = [];
        const numGrassTiles = 12;  // Extra for scrolling buffer
        
        for (let i = 0; i < numGrassTiles; i++) {
            const grass = this.createGrassTile(i * 100);
            this.grassTiles.push(grass);
        }
        
        // Sidewalk details (cracks, texture)
        this.sidewalkDetails = [];
        const numDetails = 20;
        
        for (let i = 0; i < numDetails; i++) {
            const detail = this.createSidewalkDetail(i * 80);
            this.sidewalkDetails.push(detail);
        }
    }
    
    /**
     * Create a grass tile
     */
    createGrassTile(x) {
        const grass = this.scene.add.graphics();
        
        // Draw grass patch
        grass.fillStyle(0x7CB342, 1);
        grass.fillRect(0, 0, 100, 25);
        
        // Add some grass blade details
        grass.lineStyle(1, 0x558B2F, 1);
        for (let i = 0; i < 10; i++) {
            const bladeX = i * 10 + 5;
            grass.lineBetween(bladeX, 25, bladeX + 2, 15);
        }
        
        grass.setPosition(x, 525);
        grass.setDepth(-20);
        grass.originalX = x;
        
        return grass;
    }
    
    /**
     * Create sidewalk detail (crack lines)
     */
    createSidewalkDetail(x) {
        const detail = this.scene.add.graphics();
        
        // Draw subtle crack or joint line
        detail.lineStyle(1, 0x6B5344, 0.5);
        detail.lineBetween(0, 550, 0, 600);
        
        detail.setPosition(x, 0);
        detail.setDepth(-15);
        detail.originalX = x;
        
        return detail;
    }
    
    // =============================================================
    // UPDATE METHOD
    // Called every frame to scroll the background
    // =============================================================
    
    /**
     * Update the background scrolling
     * 
     * @param {number} delta - Time since last frame in ms
     * @param {boolean} isMoving - Whether the player is moving
     * @param {number} direction - 1 for right, -1 for left, 0 for stopped
     * 
     * WHY pass direction?
     * - Background scrolls opposite to player movement
     * - Moving right = background scrolls left (world moves past you)
     */
    update(delta, isMoving, direction) {
        // Don't scroll if stopped (player won!)
        if (this.isStopped) return;
        
        // Only scroll if moving
        if (!isMoving || direction === 0) return;
        
        // Get game speed multiplier (increases every 100 meters!)
        // WHY? Makes the game progressively harder
        const speedMultiplier = this.scene.gameSpeedMultiplier || 1.0;
        
        // Calculate scroll amount this frame
        // WHY delta / 1000? Convert ms to seconds for consistent speed
        const scrollAmount = Background.BASE_SCROLL_SPEED * speedMultiplier * (delta / 1000) * direction;
        
        // Update total scroll position
        this.scrollX += scrollAmount;
        
        // Scroll each layer at its own speed
        this.scrollLayer(this.layers.clouds, scrollAmount * Background.CLOUD_SPEED, 1200);
        this.scrollLayer(this.layers.houses, scrollAmount * Background.HOUSE_SPEED, 1600);
        this.scrollLayer(this.layers.trees, scrollAmount * Background.TREE_SPEED, 1500);
        this.scrollLayer(this.grassTiles, scrollAmount * Background.GROUND_SPEED, 1200);
        this.scrollLayer(this.sidewalkDetails, scrollAmount * Background.GROUND_SPEED, 1600);
    }
    
    /**
     * Scroll a layer and wrap elements that go off-screen
     * 
     * @param {Array} elements - Array of game objects in this layer
     * @param {number} amount - How much to scroll this frame
     * @param {number} wrapWidth - Total width before wrapping
     * 
     * WHY wrap? Creates infinite scrolling without needing infinite objects!
     */
    scrollLayer(elements, amount, wrapWidth) {
        elements.forEach(element => {
            // Move the element
            element.x -= amount;
            
            // Wrap around if it goes too far off-screen
            // WHY -200? Give some buffer so elements don't "pop" in
            if (element.x < -200) {
                element.x += wrapWidth;
            }
            // Also wrap if scrolling backwards
            if (element.x > 1000) {
                element.x -= wrapWidth;
            }
        });
    }
    
    /**
     * Get the current scroll distance
     * Useful for tracking how far the player has traveled
     * 
     * @returns {number} Total distance scrolled in pixels
     */
    getScrollDistance() {
        return Math.abs(this.scrollX);
    }
    
    /**
     * Stop the background from scrolling
     * Called when player wins or game ends
     */
    stopScrolling() {
        this.isStopped = true;
        console.log('🛑 Background scrolling stopped');
    }
}
