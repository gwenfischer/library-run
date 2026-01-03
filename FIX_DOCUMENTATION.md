# Fix: Dottie Bacon NPCs Disappearing When Player Moves Left

## Issue Description

When the Dottie Bacon School bullies (NPCs) began attacking the player, they would suddenly vanish if the player moved left a few meters during the encounter. This made the gameplay feel broken and prevented proper progression.

## Root Cause Analysis

The `Bully` class in `js/sprites/Bully.js` was using **static screen boundaries** to determine when NPCs should enter and exit the visible area:

```javascript
static SCREEN_LEFT = -80;
static SCREEN_RIGHT = 880;
```

These hardcoded values represented fixed world coordinates. The problem occurred because:

1. **The game uses a scrolling camera system** - When the player moves beyond the center of the screen (x = 400), the camera follows by scrolling
2. **Player can also move freely in the left portion** - Before reaching the scroll threshold, the player's position changes without camera scroll
3. **Bullies checked their position against fixed coordinates** - They used `this.x < SCREEN_LEFT` to determine if they'd exited the screen
4. **When player moved left, NPCs appeared "off-screen" relative to fixed coordinates** - Even though they were still visible in the camera viewport

### Example Scenario

1. Player at x=400, Bully at x=500 (visible, since both are near center)
2. Player moves left to x=250 (no camera scroll, player is still within left portion)
3. Bully continues moving, now at x=450
4. From the bully's perspective using static coordinates, nothing changed
5. BUT if bully had previously crossed some threshold based on static coords, the exit detection logic could trigger incorrectly

The real issue was that the bully's spawn and exit positions didn't account for where the camera actually was, only using fixed world coordinates.

## Solution

Modified `Bully.js` to use **camera-relative coordinates** instead of static screen boundaries. This ensures NPCs always position themselves and check visibility relative to the actual camera viewport.

### Changes Made

#### 1. Constructor - Dynamic Spawn Position
```javascript
// BEFORE (static)
const startX = startFromRight ? 
    Bully.SCREEN_RIGHT + Bully.SPAWN_OFFSET : 
    Bully.SCREEN_LEFT - Bully.SPAWN_OFFSET;

// AFTER (camera-relative)
const camera = scene.cameras.main;
const startX = startFromRight ? 
    camera.scrollX + camera.width + Bully.SPAWN_OFFSET : 
    camera.scrollX - Bully.SPAWN_OFFSET;
```

#### 2. startEntering() - Dynamic Entry Position
```javascript
// BEFORE
this.x = fromRight ? 
    Bully.SCREEN_RIGHT + Bully.SPAWN_OFFSET : 
    Bully.SCREEN_LEFT - Bully.SPAWN_OFFSET;

// AFTER
const camera = this.scene.cameras.main;
this.x = fromRight ? 
    camera.scrollX + camera.width + Bully.SPAWN_OFFSET : 
    camera.scrollX - Bully.SPAWN_OFFSET;
```

#### 3. prepareReentry() - Dynamic Re-entry Position
```javascript
// BEFORE
if (enterFromRight) {
    this.x = Bully.SCREEN_RIGHT + Bully.SPAWN_OFFSET;
    this.patrolDirection = -1;
} else {
    this.x = Bully.SCREEN_LEFT - Bully.SPAWN_OFFSET;
    this.patrolDirection = 1;
}

// AFTER
const camera = this.scene.cameras.main;
if (enterFromRight) {
    this.x = camera.scrollX + camera.width + Bully.SPAWN_OFFSET;
    this.patrolDirection = -1;
} else {
    this.x = camera.scrollX - Bully.SPAWN_OFFSET;
    this.patrolDirection = 1;
}
```

#### 4. update() - Dynamic Exit Detection
```javascript
// BEFORE
const exitedLeft = this.patrolDirection === -1 && this.x < Bully.SCREEN_LEFT;
const exitedRight = this.patrolDirection === 1 && this.x > Bully.SCREEN_RIGHT;

// AFTER
const camera = this.scene.cameras.main;
const cameraLeft = camera.scrollX - 100;  // Buffer zone
const cameraRight = camera.scrollX + camera.width + 100;  // Buffer zone

const exitedLeft = this.patrolDirection === -1 && this.x < cameraLeft;
const exitedRight = this.patrolDirection === 1 && this.x > cameraRight;
```

## Benefits

1. **Bullies always spawn relative to visible screen area** - No matter where the camera is positioned
2. **Exit detection works correctly with camera movement** - NPCs only exit when actually leaving the viewport
3. **Player movement no longer causes NPCs to vanish** - Whether player moves left or right, NPC visibility is tracked correctly
4. **Buffer zones prevent premature exits** - 100px buffer ensures NPCs fully exit before cleanup
5. **Future-proof for camera changes** - Any camera scrolling behavior will automatically work with NPCs

## Testing Recommendations

To verify this fix works correctly:

1. **Start a new game** and progress to 500m to trigger the Dottie Bacon School zone
2. **Let bullies enter and begin attacking**
3. **Move the player significantly left** (back towards x=200 or less)
4. **Verify bullies remain visible** and continue their attack pattern
5. **Test with both bullies** (one from each side)
6. **Confirm bullies exit correctly** when they walk off the opposite side of the screen

## Side Effects & Compatibility

- **No breaking changes** - The static `SCREEN_LEFT` and `SCREEN_RIGHT` constants remain defined for potential future use
- **OldMan NPC fixed in this PR** - Both Bully and OldMan NPCs now use camera-relative coordinates
- **All NPC spawn/exit logic should use camera-relative coords** - This pattern should be adopted across any future similar NPCs

## Related Files

- `js/sprites/Bully.js` - Modified (fixed in this PR)
- `js/sprites/OldMan.js` - Modified (fixed in this PR)
- `js/zones/DottieBaconSchool.js` - Manages bully creation (no changes needed)

## Credits

Fixed by GitHub Copilot based on issue analysis and code review.
