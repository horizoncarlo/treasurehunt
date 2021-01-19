var keysdown = {};
var scoreboardText;
var boostDiv;
var townDiv;
var specialTerrain = {};
var hazards = [];

function init() {
    // Bring focus to the body if possible, to help with keypress capturing
    document.body.focus();
    
    // Watch for keyup, keydown, and keypress
    document.body.onkeyup = 
    document.body.onkeydown = function(e) {
        keysdown[e.code] = (e.type === 'keydown');
    };
    document.body.onkeypress = keypressListener;
}

function initBackground() {
    var backgroundObjects = getDocumentWidth() * getDocumentHeight() / 10000; // Count of how many objects to make
    
    // Have a chance for a less or more populated map
    if (Math.random() >= 0.65) {
        if (Math.random() > 0.5) {
            backgroundObjects = backgroundObjects - (backgroundObjects / 3);
        }
        else {
            backgroundObjects = backgroundObjects + (backgroundObjects / 4.5);
        }
    }
    
    // Have a chance for no rocks, normal rocks, or a ton or rocks
    var rockChance = Math.random();
    if (rockChance <= 0.1) {
        rockChance = 0;
    }
    else if (rockChance <= 0.9) {
        rockChance = 0.09;
    }
    else {
        rockChance = 0.65;
    }
    
    for (var backgroundLoop = 0; backgroundLoop < backgroundObjects; backgroundLoop++) {
        currentBackground = makeBackgroundObject();
        
        // Check for rocks first, then go into minor/major other terrain
        if (Math.random() <= rockChance) {
            currentBackground.src = './images/terrain/rock' + getRandomInt(1, 6) + '.png';
            currentBackground.style.zIndex = 4;
            currentBackground.style.transform = 'none';
        }
        else {
            // Minor small terrain
            if (Math.random() >= 0.06) {
                if (Math.random() >= 0.035) {
                    currentBackground.style.zIndex = 1;
                    
                    if (Math.random() >= 0.88) {
                        // Don't count our tiny terrain
                        backgroundLoop--;
                        if (Math.random() >= 0.25) {
                            currentBackground.src = './images/terrain/forest_dark_tiny.png';
                        }
                        else {
                            currentBackground.src = './images/terrain/stump.png';
                            currentBackground.style.zIndex = 2;
                        }
                    }
                    else {
                        currentBackground.src = './images/terrain/forest_dark_small.png';
                        currentBackground.style.transform = 'rotate(' + getRandomInt(10, 360) + 'deg)';
                    }
                }
                else {
                    currentBackground.src = './images/terrain/flowers.png';
                    currentBackground.style.zIndex = 3;
                    currentBackground.style.transform = 'rotate(' + getRandomInt(10, 360) + 'deg)';
                }
            }
            // Major bigger terrain
            else {
                if (Math.random() >= 0.4) {
                    currentBackground.src = './images/terrain/forest_dark_big.png';
                    currentBackground.style.zIndex = 1;
                    currentBackground.style.transform = 'rotate(' + getRandomInt(10, 360) + 'deg)';
                }
                else {
                    currentBackground.src = './images/terrain/grass.png';
                    currentBackground.style.zIndex = 2;
                }
            }
        }
        
        addChild(currentBackground);
    }
    
    // Trees, including a rare chance for none
    if (Math.random() >= 0.2) {
        var numTrees = getRandomInt(1, backgroundObjects/20);
        
        // Also have a rare chance for a more dense forest
        if (Math.random() >= 0.92) {
            numTrees *= 2;
        }
        
        var hasBig = false; // Only include a single massive tree
        for (var i = 0; i < numTrees; i++) {
            var suffix = getRandomInt(1,8);
            if (!hasBig && Math.random() > 0.8) {
                hasBig = true;
                suffix = '_big';
            }
            
            applyBackgroundObject('./images/terrain/trees/green/tree' + suffix + '.png', 5);
        }
    }
    
    // Add some special objectives and powerups, which are applied in main.js
    if (difficulty.POWERUP_MAX > 0) {
        for (var i = 0; i < difficulty.POWERUP_MAX; i++) {
            applyPowerup();
        }
        applyPowerupClasses();
    }
    
    // Unique single objects and seasonal effects
    if (Math.random() > 0.7) {
        applyBackgroundObject('./images/terrain/house.png');
    }
    if (Math.random() > 0.78) {
        applyBackgroundObject('./images/terrain/water_big' + getRandomInt(1, 3) + '.png');
    }
    if (Math.random() > 0.8) {
        applyBackgroundObject('./images/terrain/ruins.png', 4);
    }
    if (Math.random() > 0.4) {
        for (var i = 0; i < getRandomInt(1, 2); i++) {
            applyBackgroundObject('./images/terrain/dirt' + getRandomInt(1, 2) + '.png', 1, true);
        }
    }
    var isHalloween = (new Date().getMonth() === 9);
    var isChristmas = (new Date().getMonth() === 11);
    var christmasChance = isChristmas ? 0.1 : 0.93;
    if (Math.random() > christmasChance) { // Of course have a Christmas tree in December
        var christmasCount = isChristmas ? getRandomInt(3, 6) : 1;
        for (var i = 0; i < christmasCount; i++) {
            applyBackgroundObject('./images/terrain/christmas_tree.png', 5);
        }
    }
    if (isHalloween) {
        for (var i = 0; i < getRandomInt(15, 50); i++) {
            applyBackgroundObject('./images/terrain/pumpkin' + getRandomInt(1, 3) + '.png', 4);
        }
    }
    
    // Weather effects
    if (isChristmas || (Math.random() > 0.89 && !isHalloween)) {
        var snowflakes = document.createElement('div');
        snowflakes.id = 'snowflakes';
        for (var i = 0; i < getRandomInt(10, 15); i++) {
            var type = Math.random();
            var currentSnowflake = document.createElement('div');
            currentSnowflake.className = 'snowflake';
            
            if (type <= 0.33) {
                currentSnowflake.innerHTML = '&#10052;';
            }
            else if (type <= 0.66) {
                currentSnowflake.innerHTML = '&#10053;';
            }
            else {
                currentSnowflake.innerHTML = '&#10054;';
            }
            snowflakes.appendChild(currentSnowflake);
        }
        document.body.appendChild(snowflakes);
    }
    
    // Hazards of our tentacles
    if (difficulty.HAZARD_MAX > 0) {
        for (var i = 0; i < getRandomInt(difficulty.HAZARD_MIN, difficulty.HAZARD_MAX); i++) {
            // Show the growing animation, then when it's complete (based on the GIF timing) switch to the normal animation
            setTimeout(function() {
                var newTentacle = applyBackgroundObject('./images/tentacle_grow.gif', 10);
                hazards.push(newTentacle);
                setTimeout(function() {
                    newTentacle.src = './images/tentacle.gif';
                }, 1040);
            }, 0);
        }
    }
}

function makeBackgroundObject(src) {
    var obj = document.createElement('img');
    obj.style.top = getRandomInt(0, getDocumentHeight()-10) + 'px';
    obj.style.left = getRandomInt(ASCENT_WIDTH, getDocumentWidth()-10) + 'px';
    obj.className = 'bo';
    if (src) {
        obj.src = src;
    }
    return obj;
}

function applyBackgroundObject(src, zIndex, rotate) {
    var obj = makeBackgroundObject(src);
    if (typeof zIndex !== 'undefined') {
        obj.style.zIndex = zIndex;
    }
    if (rotate) {
        obj.style.transform = 'rotate(' + getRandomInt(10, 360) + 'deg)';
    }
    addChild(obj);
    return obj;
}

/**
 * Generate and apply a new powerup as a background object
 * This will recursively call itself to make sure no duplicates are done
 */
function applyPowerup(recurseCount) {
    if (typeof recurseCount === 'undefined') {
        recurseCount = 0;
    }
    
    // Bit of a hacky failsafe, but just make sure this function doesn't recurse forever
    //  in case more than our available unique powerups are requested
    if (recurseCount > 100) {
        console.error("Couldn't create a unique powerup, were too many requested?");
        return;
    }
    
    switch (getRandomInt(1, 8)) {
        case 1:
            if (specialTerrain.campfire) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.campfire = applyBackgroundObject('./images/powerups/campfire.gif', 7);
        break;
        case 2:
            if (specialTerrain.banner) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.banner = applyBackgroundObject('./images/powerups/banner.gif', 7);
        break;
        case 3:
            if (specialTerrain.potion) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.potion = applyBackgroundObject('./images/powerups/potion.png', 7);
        break;
        case 4:
            if (specialTerrain.wormhole) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.wormhole = applyBackgroundObject('./images/powerups/wormhole.png', 7);
        break;
        case 5:
            if (specialTerrain.barrel) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.barrel = applyBackgroundObject('./images/powerups/barrel.png', 7);
        break;
        case 6:
            if (specialTerrain.book) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.book = applyBackgroundObject('./images/powerups/book.png', 7);
        break;
        case 7:
            if (specialTerrain.anvil) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.anvil = applyBackgroundObject('./images/powerups/anvil.png', 7);
        break;
        case 8:
            if (specialTerrain.mushroom) {
                applyPowerup(recurseCount+1);
                return;
            }
            specialTerrain.mushroom = applyBackgroundObject('./images/powerups/mushroom.png', 7);
        break;
    }
}

/**
 * Apply a ring around the base of each powerup to better draw attention
 */
function applyPowerupClasses() {
    for (var key in specialTerrain) {
        if (specialTerrain.hasOwnProperty(key)) {
            specialTerrain[key].className += ' powerup';
            
            specialTerrain[key].onclick = clickMoveFunction;
        }
    }
}

function initBoostFuel() {
    // Only show our boost if we have any
    if (difficulty.PLAYER_BOOST_MAX_FUEL > 0) {
        mainBoost = document.createElement('div');
        mainBoost.id = 'boostWrap';
        mainBoost.className = 'boostGaugeWrap';
        
        var boostIcon = document.createElement('img');
        boostIcon.src = './images/boost.png';
        boostIcon.className = 'boostIcon';
        mainBoost.appendChild(boostIcon);
        
        boostDiv = document.createElement('div');
        boostDiv.id = 'boostGauge';
        boostDiv.className = 'boostGauge';
        mainBoost.appendChild(boostDiv);
        updateBoostFuel();
        
        addChild(mainBoost);
    }
}

function initAscent() {
    // The left "ascent" bar has the scoreboard, advancing monster, and cowering town
    var ascentDiv = document.createElement('div');
    ascentDiv.id = 'ascent';
    ascentDiv.className = 'ascent';
    ascentDiv.style.width = ASCENT_WIDTH + 'px';
    
    // Randomize gradient
    ascentDiv.style.background = 'linear-gradient(' + getRandomColor() + ', ' + getRandomColor() + ')';
    
    // Town
    townDiv = document.createElement('div');
    townDiv.id = 'town';
    townDiv.className = 'town';
    
    var townImage = document.createElement('img');
    townImage.src = player.townImage;
    
    townDiv.appendChild(townImage);
    
    // Now store the relative position as absolute for the town to make future calculations easier
    setTimeout(function() {
        var townImageRect = townImage.getBoundingClientRect();
        townDiv.style.top = townImageRect.top + 'px';
        townDiv.style.left = townImageRect.left + 'px';
        townDiv.style.position = 'absolute';
    },0);
    
    // Put it all together
    ascentDiv.appendChild(makeScoreboard());
    ascentDiv.appendChild(townDiv);
    ascentDiv.appendChild(makeMonster());
    addChild(ascentDiv);
}

function initProgress() {
    // For easy visualization of score there is a gold progress bar along the top of the screen
    var progressDiv = document.createElement('div');
    progressDiv.id = 'progress';
    progressDiv.className = 'progress';
    progressDiv.style.width = 'calc(100% - ' + ASCENT_WIDTH + 'px)';
    progressDiv.style.left = ASCENT_WIDTH + 'px';
    
    var progressDoneDiv = document.createElement('div');
    progressDoneDiv.id = 'progressDone';
    progressDoneDiv.className = 'progressDone';
    progressDoneDiv.style.left = ASCENT_WIDTH + 'px';
    
    addChild(progressDiv);
    addChild(progressDoneDiv);
}

function hideProgress() {
    document.getElementById('progress').style.display = 'none';
    document.getElementById('progressDone').style.display = 'none';
}

function showProgress() {
    document.getElementById('progress').style.display = 'block';
    document.getElementById('progressDone').style.display = 'block';
}

function makeScoreboard() {
    var mainScoreboard = document.createElement('div');
    mainScoreboard.id = 'scoreboard';
    mainScoreboard.className = 'scoreboard';
    mainScoreboard.style.background = 'linear-gradient(black 50%, transparent)';
    
    var scoreboardHeaderDiv = document.createElement('div');
    scoreboardHeaderDiv.appendChild(document.createTextNode("Coins"));
    
    var scoreboardTextDiv = document.createElement('div');
    scoreboardText = document.createTextNode("0");
    scoreboardTextDiv.appendChild(scoreboardText);
    scoreboardTextDiv.appendChild(document.createElement('br'));
    scoreboardTextDiv.appendChild(document.createTextNode("of"));
    scoreboardTextDiv.appendChild(document.createElement('br'));
    scoreboardTextDiv.appendChild(document.createTextNode(difficulty.POINTS_TO_WIN));
    
    mainScoreboard.appendChild(scoreboardHeaderDiv);
    mainScoreboard.appendChild(scoreboardTextDiv);
    
    return mainScoreboard;
}
