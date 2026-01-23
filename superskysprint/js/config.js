const CONFIG = {
    // ==========================================
    // DEBUG MODE
    // ==========================================
    DEBUG_MODE: false,
    
    // ==========================================
    // GAME SPEED
    // ==========================================
    INITIAL_SPAWN_INTERVAL: 1.2,
    FINAL_SPAWN_INTERVAL: 0.12,
    SPEED_RAMP_TIME: 120,
    
    // Thresholds based on spawn interval (lower = faster)
    TIER_2_SPAWN_THRESHOLD: 0.6,        // Below this interval → tier 2
    TIER_3_SPAWN_THRESHOLD: 0.2,        // Below this interval → tier 3 (default = max speed)

    // ==========================================
    // FONTS
    // ==========================================
    FONT_TITLE: "'Lilita One', cursive",
    FONT_BUTTON: "'Archivo Black', sans-serif",
    FONT_BODY: "'Raleway', sans-serif",
    FONT_HEADER: "'Fjalla One', sans-serif",
    FONT_READY_GO: "'Teko', sans-serif",
    FONT_REACTION: "'Lilita One', cursive",
    FONT_DEFAULT: "'Raleway', sans-serif",

    // Ready/Go text size (as percentage of screen width)
    READY_GO_SIZE_VW: 18, // vw units

    // ==========================================
    // SCREEN & PLAY FIELD
    // ==========================================
    OOB_MARGIN_PERCENT: 0.14,
    NUM_STEPS: 14,
    PORTRAIT_ASPECT_RATIO: 9 / 16,
    MAX_GAME_WIDTH: 450,

    // ==========================================
    // TOP LINE (FAR)
    // ==========================================
    TOP_LINE_WIDTH_PCT: 0.35,
    TOP_LINE_Y_PCT: 0,

    // ==========================================
    // BOTTOM LINE (CLOSE)
    // ==========================================
    BOTTOM_LINE_Y_PCT: 0.82,

    // ==========================================
    // DEPTH SCALE
    // ==========================================
    SCALE_FAR: 0.4,
    SCALE_NEAR: 1.6,
    SCALE_POWER: 1.8,

    // ==========================================
    // MOVEMENT EASING
    // ==========================================
    Z_EASE_POWER: 2.2,
    BREAD_TRAVEL_TIME: 5.0,
    MIN_TRAVEL_TIME: 0.8,

    // ==========================================
    // COLLISION
    // ==========================================
    COLLISION_Z: 1.0,
    COLLISION_STEP_MARGIN: 3,

    // ==========================================
    // ANIMATION SPEED MULTIPLIER
    // ==========================================
    ANIM_SPEED_MULT_START: 1.0,
    ANIM_SPEED_MULT_END: 1.6,

    // ==========================================
    // HEALTH SYSTEM
    // ==========================================
    MAX_HEALTH: 300,
    HEALTH_LOSS_PER_MISS: 150,
    HEALTH_GAIN_PER_COLLECT: 5,
    
    // Per-tier health values
    TIER_1_HEALTH_GAIN: 5,
    TIER_1_HEALTH_LOSS: 150,
    TIER_2_HEALTH_GAIN: 3,
    TIER_2_HEALTH_LOSS: 160,
    TIER_3_HEALTH_GAIN: 1,
    TIER_3_HEALTH_LOSS: 170,

    // ==========================================
    // HEALTH STATES
    // ==========================================
    STARTING_STATE: 1,
    STARTING_HEALTH_PCT: 0.5,

    // ==========================================
    // STATE NAME DISPLAY
    // ==========================================
    STATE_NAME_COLORS: {
        limbo: '#888888',
        normal: '#ff77ff',
        hyper: '#ff00ff',
        ultra: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#4488FF'] // per letter U-L-T-R-A
    },

    // State announcement (middle of screen)
    STATE_ANNOUNCE_VERTICAL_OFFSET_PCT: 0.38, // % from top
    STATE_ANNOUNCE_INITIAL_SIZE: 72,           // px
    STATE_ANNOUNCE_FINAL_SIZE: 95,             // px
    STATE_ANNOUNCE_FADE_TIME: 2500,            // ms
    STATE_ANNOUNCE_LIMBO_DROP_DISTANCE: 40,    // px for limbo drop

    // ==========================================
    // BACKGROUND
    // ==========================================
    BG_CROSSFADE_TIME: 400,

    // ==========================================
    // SPEED LINES OVERLAY
    // ==========================================
    SPEEDLINE_SPAWN_Y_PCT: 0.589,
    SPEEDLINE_INITIAL_THICKNESS: 1.5,
    SPEEDLINE_FINAL_THICKNESS: 6,
    SPEEDLINE_SPAWN_DISTANCE: 8,
    SPEEDLINE_ACCEL_POWER: 1.6,
    SPEEDLINE_BASE_SPEED: 800,

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
    BREAD_TOTAL_FRAMES: 13,
    BREAD_COLS: 5,
    BREAD_ROWS: 3,
    BREAD_ANIM_FPS: 14,
    BREAD_MISS_ANIM_FPS: 28,
    BREAD_SHAKE_TIME: 250,
    BREAD_SHAKE_INTENSITY: 8,

    // ==========================================
    // BREAD PATTERN TIERS
    // ==========================================

    // Tier 1 patterns: sequential, zigzag, clusters, random burst
    TIER_1_PATTERN_MIN_LENGTH: 20,
    TIER_1_PATTERN_MAX_LENGTH: 40,
    TIER_1_ZIGZAG_STEP: 2,              // Step size for zigzag drift
    TIER_1_CLUSTER_SIZE: 3,             // Breads per cluster group
    TIER_1_RANDOM_BURST_LENGTH: 5,      // Number of random spawns in a row

    // Tier 2 patterns: sequential, stepping clusters
    TIER_2_PATTERN_MIN_LENGTH: 20,
    TIER_2_PATTERN_MAX_LENGTH: 40,
    TIER_2_CLUSTER_LENGTH: 5,           // Steps per stepping cluster
    TIER_2_CLUSTER_STEP: 1,             // How many lanes each cluster step moves

    // Tier 3 patterns: sequential w/ 2-lane jumps, clusters (original style)
    TIER_3_PATTERN_MIN_LENGTH: 20,
    TIER_3_PATTERN_MAX_LENGTH: 40,
    TIER_3_MAX_COLUMN_DISTANCE: 3,      // Max lanes between subsequent breads
    TIER_3_WIDE_JUMP_CHANCE: 0.5,       // Chance of 2-lane jump on direction change
    TIER_3_WIDE_JUMP_SIZE: 2,           // Lanes to jump
    TIER_3_CLUSTER_SIZE: 3,             // Cluster group size
    TIER_3_CLUSTER_MIN_CENTER: 2,       // Min center position for clusters
    TIER_3_CLUSTER_MAX_CENTER_OFFSET: 3,// Offset from NUM_STEPS for max center

    // ==========================================
    // DISCO BALL
    // ==========================================
    DISCO_ROTATION_DEG: 90,
    DISCO_OFFSET_X: 0,
    DISCO_OFFSET_Y_PCT: 0.13,
    DISCO_COLS: 4,
    DISCO_ROWS: 3,
    DISCO_TOTAL_FRAMES: 12,
    DISCO_ANIM_FPS: 24,
    DISCO_ANIM_DIRECTION: 1,
    DISCO_FLASH_OPACITY: 0.85,
    DISCO_FLASH_FADE_TIME: 350,
    DISCO_SCALE: 0.8,
    DISCO_RAINBOW_SPEED: 180,

    // ==========================================
    // PLAYER SPRITES
    // ==========================================
    PLAYER_UNIVERSAL_OFFSET_X: 0,
    PLAYER_UNIVERSAL_OFFSET_Y_PCT: -0.22,

    PLAYER_RUN_OFFSET_X: 0,
    PLAYER_RUN_OFFSET_Y: 60,
    PLAYER_RUN_FRAMES: 8,
    PLAYER_RUN_FPS: 12,

    PLAYER_DAMAGE_HOLD_OFFSET_X: 0,
    PLAYER_DAMAGE_HOLD_OFFSET_Y: 60,
    PLAYER_DAMAGE_HOLD_FRAMES: 8,
    PLAYER_DAMAGE_HOLD_FPS: 14,
    PLAYER_DAMAGE_HOLD_LOOPS: 2,

    PLAYER_DAMAGE_RECOVER_OFFSET_X: 0,
    PLAYER_DAMAGE_RECOVER_OFFSET_Y: 60,
    PLAYER_DAMAGE_RECOVER_FRAMES: 8,
    PLAYER_DAMAGE_RECOVER_FPS: 14,

    PLAYER_DEFEAT_KNEE_OFFSET_X: 0,
    PLAYER_DEFEAT_KNEE_OFFSET_Y: 60,
    PLAYER_DEFEAT_KNEE_FRAMES: 11,
    PLAYER_DEFEAT_KNEE_FPS: 10,

    PLAYER_SCALE: 0.8,

    // ==========================================
    // FUNNY GIFS
    // ==========================================
    GIF_CAT_FU: {
        x: 0.12, y: 0.45,
        cols: 5, rows: 4, frames: 20, fps: 15, scale: 1.4
    },
    GIF_CHEETAH: {
        x: 0.5, y: 0.35,
        cols: 2, rows: 3, frames: 6, fps: 10, scale: 1.6
    },
    GIF_DANCING_CAT: {
        x: 0.85, y: 0.45,
        cols: 6, rows: 3, frames: 18, fps: 12, scale: 0.7
    },

    // ==========================================
    // ANIME ACTION LINES
    // ==========================================
    ACTION_LINES_COUNT: 24,
    ACTION_LINES_LENGTH_MIN: 0.08,
    ACTION_LINES_LENGTH_MAX: 0.18,
    ACTION_LINES_THICKNESS: 3,
    ACTION_LINES_SPEED: 400,
    ACTION_LINES_OPACITY: 0.9,

    // ==========================================
    // PARTICLES
    // ==========================================
    PARTICLE_COUNT: 12,
    PARTICLE_SPEED_MIN: 100,
    PARTICLE_SPEED_MAX: 250,
    PARTICLE_LIFETIME: 0.6,
    PARTICLE_SIZE_MIN: 4,
    PARTICLE_SIZE_MAX: 10,
    PARTICLE_COLORS: ['#FFD700', '#FFA500', '#FF6347', '#FFFF00'],
    PARTICLE_RAINBOW_COLORS: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#8B00FF', '#FF00FF'],

    // ==========================================
    // DAMAGE FLASH EFFECT
    // ==========================================
    DAMAGE_FLASH_COLOR: [255, 0, 0],
    DAMAGE_FLASH_MAX_OPACITY: 0.5,
    DAMAGE_FLASH_MIN_OPACITY: 0.0,
    DAMAGE_FLASH_HEIGHT_PCT: 0.4,
    DAMAGE_FLASH_DURATION: 400,

    // ==========================================
    // FLOATING TEXT
    // ==========================================
    FLOAT_TEXT_DAMAGE_TEXTS: ['OUCH!', 'YIKES!'],
    FLOAT_TEXT_DAMAGE_COLOR: '#FF4444',
    FLOAT_TEXT_DAMAGE_FONT_SIZE: 32,
    FLOAT_TEXT_DAMAGE_RISE_DISTANCE: 80,
    FLOAT_TEXT_DAMAGE_DURATION: 800,
    FLOAT_TEXT_DAMAGE_OFFSET_Y: -50,

    FLOAT_TEXT_MAX_TEXTS: ['BREAD!', 'WOW!', 'YUM!', 'EPIC!', 'NICE!'],
    FLOAT_TEXT_MAX_FONT_SIZE: 36,
    FLOAT_TEXT_MAX_RISE_DISTANCE: 100,
    FLOAT_TEXT_MAX_DURATION: 1000,
    FLOAT_TEXT_MAX_OFFSET_Y: -60,
    FLOAT_TEXT_MAX_RAINBOW_SPEED: 360,

    // ==========================================
    // UI & TIMING
    // ==========================================
    GAME_OVER_PAUSE_TIME: 2500,
    RESUME_COUNTDOWN_SECONDS: 3,
    READY_GO_DELAY: 1000,
    GO_DISPLAY_TIME: 500,
};