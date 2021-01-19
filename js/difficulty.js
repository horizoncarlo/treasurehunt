var difficulty = {
    POINTS_TO_WIN: 20000,
    OBJECTIVES_MONSTER_SETBACK: 18000, // Increase to make the game harder
    OBJECTIVES_AUTOADD: 3, // Minimum objectives before we auto-add with no chance roll
    OBJECTIVES_MAX: 20, // Max on the screen at once, higher is easier
    OBJECTIVES_CHANCE: 0.90, // Chance to spawn an objective, higher is easier
    OBJECTIVES_TIME: 60, // How often we check on adding new objectives, lower is easier (in ticks)
    OBJECTIVES_GLOW: true,
    POWERUP_MAX: 2,
    // Player setup
    PLAYER_SPEED: 3,
    PLAYER_BOOST_RECHARGE: 120, // How often our boost recharges a tick, lower is easier (in ticks)
    PLAYER_BOOST_MIN: 25,
    PLAYER_BOOST_MAX: 30,
    PLAYER_BOOST_MAX_FUEL: 10,
    PLAYER_BOOST_CURRENT_FUEL: 10,
    // Monster setup
    MONSTER_MOVE_TIME: 180, // Default 180 (3 seconds), decrease to make harder
    MONSTER_HITS_TO_WIN: 3, // Number of hits to win, decrease to make harder
    MONSTER_IDEAL_TIME_TO_WIN: 12, // Factors into how far the monster moves, default 12 (in seconds), decrease to make harder
    MONSTER_START_AT: 15, // Pixels from the bottom to start the monster at, increase to make harder
    HAZARD_MIN: 5,
    HAZARD_MAX: 10,
    HAZARD_PAIN_TIME: 1,
    HAZARD_IFRAME_TIME: 1,
}
