// ============================================
// CONFIGURATION - All DEF parameters
// ============================================

const CONFIG = {
    // ==========================================
    // DEBUG MODE
    // ==========================================
    DEBUG_MODE: false,                  // DEF: Toggle to show hitboxes and collision info
    
    // ==========================================
    // SCREEN & PLAY FIELD
    // ==========================================
    OOB_MARGIN_PERCENT: 0.14,          // DEF: Out of bounds zone on each side (%)
    NUM_STEPS: 14,                      // DEF: Number of quantized bread positions
    PORTRAIT_ASPECT_RATIO: 9 / 16,      // DEF: Aspect ratio for portrait mode (width/height)
    MAX_GAME_WIDTH: 450,                // DEF: Maximum game width on desktop
    
    // ==========================================
    // TOP LINE (FAR) - Where bread spawns
    // ==========================================
    TOP_LINE_WIDTH_PCT: 0.35,           // DEF: Width of top line as % of screen width
    TOP_LINE_Y_PCT: 0,                  // DEF: Top line position from top (% of height)
    
    // ==========================================
    // BOTTOM LINE (CLOSE) - Where collision happens
    // ==========================================
    BOTTOM_LINE_Y_PCT: 0.82,            // DEF: Bottom line position from top (% of height)
    
    // ==========================================
    // DEPTH SCALE (z-based sprite scaling)
    // ==========================================
    SCALE_FAR: 0.4,                    // DEF: Scale at z=0 (far)
    SCALE_NEAR: 1.6,                    // DEF: Scale at z=1 (near)
    SCALE_POWER: 1.8,                   // DEF: Power for scale easing curve
    
    // ==========================================
    // MOVEMENT EASING
    // ==========================================
    Z_EASE_POWER: 2.2,                  // DEF: Easing power for z movement (higher = more acceleration toward player)
    BREAD_TRAVEL_TIME: 5.0,             // DEF: Base time for bread to travel from top to bottom (seconds)
    MIN_TRAVEL_TIME: 0.8,               // DEF: Minimum travel time at max speed
    
    // ==========================================
    // COLLISION
    // ==========================================
    COLLISION_Z: 1.0,                   // DEF: z value at which collision is checked
    COLLISION_STEP_MARGIN: 3,           // DEF: Number of steps margin on each side for collision (0 = exact match only)
    
    // ==========================================
    // GAME SPEED
    // ==========================================
    INITIAL_SPAWN_INTERVAL: 1.2,        // DEF: Initial seconds between bread spawns
    FINAL_SPAWN_INTERVAL: 0.2,          // DEF: Final seconds between bread spawns
    SPEED_RAMP_TIME: 10,                // DEF: Seconds to reach max speed
    
    // ==========================================
    // ANIMATION SPEED MULTIPLIER (applies to bread, speed lines, NOT player/disco)
    // ==========================================
    ANIM_SPEED_MULT_START: 1.0,         // DEF: Animation speed multiplier at game start
    ANIM_SPEED_MULT_END: 1.6,           // DEF: Animation speed multiplier at max speed
    
    // ==========================================
    // HEALTH SYSTEM
    // ==========================================
    MAX_HEALTH: 300,                    // DEF: Max health per state
    HEALTH_LOSS_PER_MISS: 100,          // DEF: Health lost when missing bread
    HEALTH_GAIN_PER_COLLECT: 5,        // DEF: Health gained when collecting bread
    
    // ==========================================
    // HEALTH STATES
    // ==========================================
    // 0 = limbo (gray), 1 = normal, 2 = hyper (max/rainbow)
    STARTING_STATE: 1,
    STARTING_HEALTH_PCT: 0.5,           // DEF: Starting health as % of max
    
    // ==========================================
    // BACKGROUND
    // ==========================================
    BG_CROSSFADE_TIME: 400,             // DEF: Crossfade duration in ms
    
    // ==========================================
    // SPEED LINES OVERLAY - PER STATE COLORS
    // ==========================================
    SPEEDLINE_SPAWN_Y_PCT: 0.589,       // DEF: % from bottom where lines spawn
    SPEEDLINE_INITIAL_THICKNESS: 1.5,   // DEF: Thickness at spawn
    SPEEDLINE_FINAL_THICKNESS: 6,       // DEF: Thickness at bottom
    SPEEDLINE_SPAWN_DISTANCE: 8,        // DEF: Pixels traveled before spawning new line
    SPEEDLINE_ACCEL_POWER: 1.6,         // DEF: Acceleration power (higher = faster at bottom)
    SPEEDLINE_BASE_SPEED: 800,          // DEF: Base speed in pixels/second
    
    // State-specific speed line colors
    SPEEDLINE_LIMBO: {
        startColor: [150, 150, 150],
        startOpacity: 0.3,
        endColor: [100, 100, 100],
        endOpacity: 0.6
    },
    SPEEDLINE_NORMAL: {
        startColor: [255, 255, 255],
        startOpacity: 0.5,
        endColor: [200, 220, 255],
        endOpacity: 1.0
    },
    SPEEDLINE_HYPER: {
        startColor: [255, 100, 100],
        startOpacity: 0.6,
        endColor: [255, 50, 255],
        endOpacity: 1.0
    },
    
    // ==========================================
    // BREAD SPRITES
    // ==========================================
    BREAD_TOTAL_FRAMES: 13,             // DEF: Total animation frames
    BREAD_COLS: 5,                      // DEF: Spritesheet columns
    BREAD_ROWS: 3,                      // DEF: Spritesheet rows
    BREAD_ANIM_FPS: 14,                 // DEF: Normal animation speed
    BREAD_MISS_ANIM_FPS: 28,            // DEF: Animation speed when missed
    BREAD_SHAKE_TIME: 250,              // DEF: Shake duration in ms
    BREAD_SHAKE_INTENSITY: 8,           // DEF: Shake intensity in pixels
    
    // ==========================================
    // DISCO BALL
    // ==========================================
    DISCO_ROTATION_DEG: 90,             // DEF: Rotation angle in degrees
    DISCO_OFFSET_X: 0,                  // DEF: X offset from player position
    DISCO_OFFSET_Y_PCT: 0.13,           // DEF: Y offset as % of screen height (from bottom)
    DISCO_COLS: 4,                      // DEF: Spritesheet columns
    DISCO_ROWS: 3,                      // DEF: Spritesheet rows
    DISCO_TOTAL_FRAMES: 12,             // DEF: Total frames
    DISCO_ANIM_FPS: 24,                 // DEF: Animation speed
    DISCO_ANIM_DIRECTION: 1,            // DEF: 1 = forward, -1 = backward
    DISCO_FLASH_OPACITY: 0.85,          // DEF: Flash opacity on state change
    DISCO_FLASH_FADE_TIME: 350,         // DEF: Flash fade duration in ms
    DISCO_SCALE: 0.8,                   // DEF: Base scale of disco ball
    DISCO_RAINBOW_SPEED: 180,           // DEF: Hue rotation speed (degrees/second) during max health
    
    // ==========================================
    // PLAYER SPRITES
    // ==========================================
    PLAYER_UNIVERSAL_OFFSET_X: 0,       // DEF: Universal X offset
    PLAYER_UNIVERSAL_OFFSET_Y_PCT: -0.22, // DEF: Universal Y offset as % of height
    
    // Individual sprite offsets (relative to disco ball + universal)
    PLAYER_RUN_OFFSET_X: 0,             // DEF
    PLAYER_RUN_OFFSET_Y: 60,            // DEF
    PLAYER_RUN_FRAMES: 8,               // DEF
    PLAYER_RUN_FPS: 12,                 // DEF
    
    PLAYER_DAMAGE_HOLD_OFFSET_X: 0,     // DEF
    PLAYER_DAMAGE_HOLD_OFFSET_Y: 60,    // DEF
    PLAYER_DAMAGE_HOLD_FRAMES: 8,       // DEF
    PLAYER_DAMAGE_HOLD_FPS: 14,         // DEF
    PLAYER_DAMAGE_HOLD_LOOPS: 2,        // DEF: Number of loops before switching to recover
    
    PLAYER_DAMAGE_RECOVER_OFFSET_X: 0,  // DEF
    PLAYER_DAMAGE_RECOVER_OFFSET_Y: 60, // DEF
    PLAYER_DAMAGE_RECOVER_FRAMES: 8,    // DEF
    PLAYER_DAMAGE_RECOVER_FPS: 14,      // DEF
    
    PLAYER_DEFEAT_KNEE_OFFSET_X: 0,     // DEF
    PLAYER_DEFEAT_KNEE_OFFSET_Y: 60,    // DEF
    PLAYER_DEFEAT_KNEE_FRAMES: 11,      // DEF
    PLAYER_DEFEAT_KNEE_FPS: 10,         // DEF
    
    PLAYER_SCALE: 0.8,                  // DEF: Base scale of player sprite
    
    // ==========================================
    // FUNNY GIFS (shown at max health)
    // ==========================================
    GIF_CAT_FU: {
        x: 0.12,
        y: 0.45,
        cols: 5,
        rows: 4,
        frames: 20,
        fps: 15,
        scale: 1.4
    },
    GIF_CHEETAH: {
        x: 0.5,
        y: 0.35,
        cols: 2,
        rows: 3,
        frames: 6,
        fps: 10,
        scale: 1.6
    },
    GIF_DANCING_CAT: {
        x: 0.85,
        y: 0.45,
        cols: 6,
        rows: 3,
        frames: 18,
        fps: 12,
        scale: 0.7
    },
    
    // ==========================================
    // ANIME ACTION LINES (max health effect)
    // ==========================================
    ACTION_LINES_COUNT: 24,             // DEF: Number of action lines around viewport
    ACTION_LINES_LENGTH_MIN: 0.08,      // DEF: Min length as % of screen height
    ACTION_LINES_LENGTH_MAX: 0.18,      // DEF: Max length as % of screen height
    ACTION_LINES_THICKNESS: 3,          // DEF: Line thickness
    ACTION_LINES_SPEED: 400,            // DEF: Animation speed (degrees/second)
    ACTION_LINES_OPACITY: 0.9,          // DEF: Line opacity
    
    // ==========================================
    // PARTICLES
    // ==========================================
    PARTICLE_COUNT: 12,                 // DEF: Particles on bread collect
    PARTICLE_SPEED_MIN: 100,            // DEF: Min particle speed
    PARTICLE_SPEED_MAX: 250,            // DEF: Max particle speed
    PARTICLE_LIFETIME: 0.6,             // DEF: Particle lifetime in seconds
    PARTICLE_SIZE_MIN: 4,               // DEF: Min particle size
    PARTICLE_SIZE_MAX: 10,              // DEF: Max particle size
    PARTICLE_COLORS: ['#FFD700', '#FFA500', '#FF6347', '#FFFF00'],
    PARTICLE_RAINBOW_COLORS: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#FF00FF'],
    
    // ==========================================
    // DAMAGE FLASH EFFECT
    // ==========================================
    DAMAGE_FLASH_COLOR: [255, 0, 0],    // DEF: RGB color for damage flash
    DAMAGE_FLASH_MAX_OPACITY: 0.5,      // DEF: Maximum opacity at bottom
    DAMAGE_FLASH_MIN_OPACITY: 0.0,      // DEF: Minimum opacity at top of gradient
    DAMAGE_FLASH_HEIGHT_PCT: 0.4,       // DEF: How far up the gradient goes (% of screen)
    DAMAGE_FLASH_DURATION: 400,         // DEF: Duration of flash in ms
    
    // ==========================================
    // FLOATING TEXT
    // ==========================================
    // Damage text
    FLOAT_TEXT_DAMAGE_TEXTS: ['OUCH!', 'YIKES!'],
    FLOAT_TEXT_DAMAGE_COLOR: '#FF4444',
    FLOAT_TEXT_DAMAGE_FONT_SIZE: 32,
    FLOAT_TEXT_DAMAGE_RISE_DISTANCE: 80,
    FLOAT_TEXT_DAMAGE_DURATION: 800,
    FLOAT_TEXT_DAMAGE_OFFSET_Y: -50,    // DEF: Spawn offset from player position
    
    // Max health text
    FLOAT_TEXT_MAX_TEXTS: ['BREAD!', 'WOW!', 'YUM!', 'EPIC!', 'NICE!'],
    FLOAT_TEXT_MAX_FONT_SIZE: 36,
    FLOAT_TEXT_MAX_RISE_DISTANCE: 100,
    FLOAT_TEXT_MAX_DURATION: 1000,
    FLOAT_TEXT_MAX_OFFSET_Y: -60,
    FLOAT_TEXT_MAX_RAINBOW_SPEED: 360,  // DEF: Hue rotation speed for rainbow text
    
    // ==========================================
    // UI & TIMING
    // ==========================================
    GAME_OVER_PAUSE_TIME: 2500,         // DEF: Pause before showing game over modal (ms)
    RESUME_COUNTDOWN_SECONDS: 3,        // DEF: Countdown seconds before resume
    READY_GO_DELAY: 1000,               // DEF: Time showing "Ready?" (ms)
    GO_DISPLAY_TIME: 500,               // DEF: Time showing "GO!" (ms)
};