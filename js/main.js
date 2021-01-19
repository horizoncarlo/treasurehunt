// TODO:
/*
- Add rain effect (https://codepen.io/arickle/pen/XKjMZY) 
- Different map sets (snow, desert)
- Simple enemies that chase you? Including sword mechanics to fight back (or maybe you have to pick up a weapon)?
*/

var interval;
var objectives = [];
var loopIterations = 0;
var isPaused = false;
var lastActionIdle = true;
var playerDefeat = false;
var playerVictory = false;

function initMain() {
    // Create the player but hide them until the welcome is done
    initPlayer();
    hidePlayer();
    showWelcome();
}

function clickStartGame() {
    // Apply our custom difficulty fields if needed
    if (document.getElementById('custom').checked) {
        if (!areCustomFieldsValid()) {
            return;
        }
        
        applyCustomFieldsToDifficulty();
    }

    // Add some clutter and variety to the background
    // Setup the scoreboard, boost counter, monster, and town
    initBackground();
    initBoostFuel();
    initAscent();
    initProgress();
    
    // Hide our welcome and show the player model
    hideWelcome();
    showPlayer();
    
    // Start the heavy lifting of the actual game part
    startMainLoop();
}

function startMainLoop() {
    interval = setInterval(function() {
        mainLoop();
    }, 1000/60); // Those smooth 60fps
}

function stopMainLoop() {
    if (interval) {
        clearInterval(interval);
        interval = null;
    }
}

function mainLoop() {
    // Auto-pause if we lose focus
    if (!document.hasFocus()) {
        if (playerDefeat === false && playerVictory === false) {
            performPause();
            return;
        }
    }
    
    // Did we win yet?
    if (scoreboardText.nodeValue >= difficulty.POINTS_TO_WIN) {
        showVictory();
    }
    
    // Track how many loops we've done, which will help for tasks that run on a longer time cycle
    loopIterations++;
    
    // Only perform an auto move if we haven't done a manual move
    // If the user has requested a move, we cancel the auto move
    var autoMove = false;
    if (keysdown['ArrowUp'] === true || keysdown['ArrowDown'] === true || keysdown['ArrowLeft'] === true || keysdown['ArrowRight'] === true) {
        clearMoveTo();
    }
    else {
        if (moveRequest && moveRequest.x && moveRequest.y) {
            // Slight check to just line up our axis if we're "close enough"
            // This stops the player from bobbing up and down as it tries to align the axis manually from moving
            var goodCount = {};
            if (Math.abs(parseInt(player.div.style.top) - moveRequest.y) <= 5) {
                goodCount.y = true;
                player.div.style.top = moveRequest.y;
            }
            if (Math.abs(parseInt(player.div.style.left) - moveRequest.x) <= 5) {
                goodCount.x = true;
                player.div.style.left = moveRequest.x;
            }
            
            // Based on our previous checks if we're "close enough" then fulfill the move request
            if (goodCount.x && goodCount.y) {
                clearMoveTo();
            }
            else {
                if (!goodCount.x) {
                    if (parseInt(player.div.style.left) > moveRequest.x) {
                        autoMove = true;
                        keysdown['ArrowLeft'] = true;
                    }
                    else {
                        autoMove = true;
                        keysdown['ArrowRight'] = true;
                    }
                }
                
                if (!goodCount.y) {
                    if (parseInt(player.div.style.top) > moveRequest.y) {
                        autoMove = true;
                        keysdown['ArrowUp'] = true;
                    }
                    else {
                        autoMove = true;
                        keysdown['ArrowDown'] = true;
                    }
                }
            }
        }
    }
    
    // Handle movement
    var isIdle = true;
    if (keysdown['ArrowUp'] === true) {
        moveUp();
        isIdle = false;
        
        if (autoMove === true) { keysdown['ArrowUp'] = false; }
    }
    if (keysdown['ArrowDown'] === true) {
        moveDown();
        isIdle = false;
        
        if (autoMove === true) { keysdown['ArrowDown'] = false; }
    }
    if (keysdown['ArrowLeft'] === true) {
        moveLeft();
        isIdle = false;
        
        if (autoMove === true) { keysdown['ArrowLeft'] = false; }
    }
    if (keysdown['ArrowRight'] === true) {
        moveRight();
        isIdle = false;
        
        if (autoMove === true) { keysdown['ArrowRight'] = false; }
    }
    
    // Check if our action changed from idle to movement or vice versa
    // This will require us to update the animation used
    if (lastActionIdle !== isIdle) {
        if (isIdle === true) {
            setIdleAnimation();
        }
        else {
            setMoveAnimation();
        }
    }
    lastActionIdle = isIdle;
    
    // A lot is done if we moved, such as checking map boundaries and collisions
    if (isIdle === false) {
        // Ensure our map limitations are respected
        if (parseInt(player.div.style.top) <= 0) {
            player.div.style.top = '0px';
        }
        else if (parseInt(player.div.style.top) >= (getDocumentHeight() - parseInt(player.div.style.height))) {
            player.div.style.top = (getDocumentHeight() - parseInt(player.div.style.height)) + 'px';
        }
        if (parseInt(player.div.style.left) <= ASCENT_WIDTH) {
            player.div.style.left = ASCENT_WIDTH + 'px'; // Account for the ascent bar
        }
        else if (parseInt(player.div.style.left) >= (getDocumentWidth() - parseInt(player.div.style.width))) {
            player.div.style.left = (getDocumentWidth() - parseInt(player.div.style.width)) + 'px';
        }
        
        // Watch for collisions with objectives
        for (var objLoop = 0; objLoop < objectives.length; objLoop++) {
            if (isCollide(player.div, objectives[objLoop].div)) {
                var removed = objectives.splice(objLoop, 1);
                if (removed.length === 1) {
                    grabObjective(removed[0]);
                }
                else {
                    for (var removeLoop = 0; removeLoop < removed.length; removeLoop++) {
                        grabObjective(removed[removedLoop]);
                    }
                }
            }
        }
        
        // Check for any special terrain
        // Campfire restores our current boost fuel
        if (specialTerrain.campfire && isCollide(player.div, specialTerrain.campfire)) {
            difficulty.PLAYER_BOOST_CURRENT_FUEL = difficulty.PLAYER_BOOST_MAX_FUEL;
            updateBoostFuel();
        }
        // Banner sets the monster back like a mega-coin. Single use
        if (specialTerrain.banner && isCollide(player.div, specialTerrain.banner)) {
            setbackMonster(0.125);
            
            // Shake the monster for a second to lend some impact
            monster.div.className += ' shake';
            setTimeout(function() {
                monster.div.className = 'monster';
            }, 1000);
            
            // Banner is one use, remove after
            deleteChild(specialTerrain.banner);
            delete specialTerrain.banner;
        }
        // Potion speeds up the player temporarily. Single use
        if (specialTerrain.potion && isCollide(player.div, specialTerrain.potion)) {
            var originalSpeed = difficulty.PLAYER_SPEED;
            
            difficulty.PLAYER_SPEED += 6;
            player.div.style.filter = 'brightness(2.5)';
            
            setTimeout(function() {
                difficulty.PLAYER_SPEED = originalSpeed;
                player.div.style.filter = 'none';
            }, 5000);
            
            deleteChild(specialTerrain.potion);
            delete specialTerrain.potion;
        }
        // Wormhole teleports the player randomly. Single use
        if (specialTerrain.wormhole && isCollide(player.div, specialTerrain.wormhole)) {
            player.div.style.top = getRandomInt(0, getDocumentHeight() - parseInt(player.div.style.width)) + 'px';
            player.div.style.left = getRandomInt(ASCENT_WIDTH, getDocumentWidth() - parseInt(player.div.style.height)) + 'px'; 
            player.div.style.filter = 'blur(3px)';
            
            setTimeout(function() {
                player.div.style.filter = 'none';
            }, 800);
            
            deleteChild(specialTerrain.wormhole);
            delete specialTerrain.wormhole;
        }
        // Barrel spawns a bunch of new coins. Single use
        if (specialTerrain.barrel && isCollide(player.div, specialTerrain.barrel)) {
            // Have a super small chance for a ton of coins
            var barrelCount = getRandomInt(2, 6);
            if (Math.random() <= 0.05) {
                barrelCount = getRandomInt(10, 16);
            }
            for (var i = 0; i < barrelCount; i++) {
                createObjective(specialTerrain.barrel);
            }
            
            deleteChild(specialTerrain.barrel);
            delete specialTerrain.barrel;
        }
        // Book grabs nearby coins. Single use
        if (specialTerrain.book && isCollide(player.div, specialTerrain.book)) {
            actOnNearbyObjectives(function(loopObj) {
                grabObjective(loopObj);
                return true;
            }, 4);
            
            deleteChild(specialTerrain.book);
            delete specialTerrain.book;
        }
        // Anvil converts nearby coins to gold. Single use
        if (specialTerrain.anvil && isCollide(player.div, specialTerrain.anvil)) {
            actOnNearbyObjectives(function(loopObj) {
                // Get the underlying image
                if (loopObj.div.firstChild.tagName.toLowerCase() === 'img') {
                    // Make sure we're not already a gold coin
                    if (loopObj.div.firstChild.src.indexOf('gold_coin') === -1) {
                        loopObj.div.firstChild.src = './images/gold_coin.gif';
                        loopObj.points = Math.ceil(maxPoints/3.1);
                        loopObj.points += getRandomInt(0, loopObj.points/10);
                        applyGoldGlow(loopObj);
                        return true;
                    }
                }
                return false;
            }, 5);
            
            deleteChild(specialTerrain.anvil);
            delete specialTerrain.anvil;
        }
        // Mushroom grows the player temporarily. Single use
        if (specialTerrain.mushroom && isCollide(player.div, specialTerrain.mushroom)) {
            player.div.style.transform = 'scale(2)';
            
            setTimeout(function() {
                player.div.style.transform = 'scale(1)';        
            }, 7000);
            
            deleteChild(specialTerrain.mushroom);
            delete specialTerrain.mushroom;
        }
        
        // Check for any hazard collisions
        if (hazards && hazards.length > 0 && !player.iframe) {
            for (var i = 0; i < hazards.length; i++) {
                if (isCollide(player.div, hazards[i])) {
                    hazards[i].style.filter = 'drop-shadow(0 0 5px red)';
                    
                    setTimeout(function() {
                        hazards[i].style.filter = 'none';
                    }, 400);
                    
                    var originalSpeed = difficulty.PLAYER_SPEED;
                    difficulty.PLAYER_SPEED /= 2;
                    player.image.style.filter = 'invert(1)';
                    player.iframe = true;
                    
                    setTimeout(function() {
                        difficulty.PLAYER_SPEED = originalSpeed;
                        player.image.style.filter = 'none';
                    }, (difficulty.HAZARD_PAIN_TIME*1000));
                    
                    setTimeout(function() {
                        player.iframe = false;
                    }, (difficulty.HAZARD_IFRAME_TIME*1000));
                    
                    break;
                }
            }
        }
    }
    
    // Check for longer iteration tasks
    if (loopIterations % difficulty.OBJECTIVES_TIME === 0) {
        // If we don't have a ton of objectives then auto-add some
        if (objectives.length <= difficulty.OBJECTIVES_AUTOADD) {
            createObjective();
        }
        else if (objectives.length <= difficulty.OBJECTIVES_MAX && Math.random() >= difficulty.OBJECTIVES_CHANCE) {
            createObjective();
        }
    }
    if (loopIterations % difficulty.PLAYER_BOOST_RECHARGE === 0) {
        if ((difficulty.PLAYER_BOOST_CURRENT_FUEL+1) <= difficulty.PLAYER_BOOST_MAX_FUEL) {
            setCurrentBoostFuel(difficulty.PLAYER_BOOST_CURRENT_FUEL+1);
        }
    }
    if (loopIterations % difficulty.MONSTER_MOVE_TIME === 0) {
        if (playerDefeat === false && playerVictory === false) {
            var townRect = townDiv.getBoundingClientRect();
            
            // Move the monster up towards the town
            monster.div.style.top = (parseInt(monster.div.style.top) - getRandomInt(monster.minSpeed, monster.maxSpeed)) + 'px';
            
            // If we're passed the town just stop at it
            if (isNorthOf(monster.div, townDiv)) {
                monster.div.style.top = townRect.y + (townRect.height/1.3);
            }
            
            // If we collided with the town then attack it
            if (isCollide(monster.div, townDiv)) {
                monster.div.style.top = townRect.y + (townRect.height/1.3);
                
                monsterHitTown();
                
                if (monster.townHits >= difficulty.MONSTER_HITS_TO_WIN) {
                    playerDefeat = true;
                    showDefeat();
                }
            }
        }
    }
}

function keypressListener(e) {
    // Abandon hotkeys if we're still at the welcome screen
    if (document.getElementById('welcome').style.display !== 'none') {
        return;
    }
    
    if (e.code === 'Space') {
        if (isPaused === false) {
            performBoost();
        }
    }
    else if (e.code === 'KeyP') {
        if (playerDefeat === false && playerVictory === false) {
            performPause();
        }
    }
}

function performPause() {
    var pauseDiv = document.getElementById('pauseDiv');
    
    // Setup our pause div if we haven't
    if (!pauseDiv) {
        pauseDiv = document.createElement('div');
        pauseDiv.id = 'pauseDiv';
        pauseDiv.className = 'pauseOverlay';
        
        pauseDiv.onclick = function() {
            performPause();
        }

        pauseHeader = document.createElement('div');
        pauseHeader.className = 'overlayHeader';
        pauseHeader.textContent = 'Paused';
        pauseDiv.appendChild(pauseHeader);
        
        pauseChild = document.createElement('div');
        pauseChild.className = 'overlayContent';
        pauseChild.textContent = '(Click the screen or press [P] to unpause)';
        pauseDiv.appendChild(pauseChild);
        
        document.body.appendChild(pauseDiv);
    }
    
    // Start a pause
    if (interval) {
        document.getElementById('game').style.filter = 'blur(10px)';
        pauseDiv.style.display = 'block';
        stopMainLoop();
        
        isPaused = true;
    }
    // Unpause the game
    else {
        document.getElementById('game').style.filter = 'none';
        pauseDiv.style.display = 'none';
        startMainLoop();
        
        isPaused = false;
    }
}

function prepareOverlay() {
    hidePlayer();
    hideProgress();
    stopMainLoop();
    
    // Stop any weather
    var snow = document.getElementById('snowflakes');
    if (snow) {
        snow.style.display = 'none';
    }
}

function showDefeat() {
    prepareOverlay();
    
    document.getElementById('deadImage').src = player.avatar.dead;
    var defeatOverlay = document.getElementById('defeat');
    defeatOverlay.style.display = 'block';
    setTimeout(function() {
        defeatOverlay.style.opacity = '1.0';
    },100);
    
    setTimeout(function() {
        window.location.reload();
    }, 8000);
}

function showVictory() {
    prepareOverlay();
    
    var victoryOverlay = document.getElementById('victory');
    
    // Set our proper monster image
    document.getElementById('monsterLossImage').src = monster.image;
    document.getElementById('moveImage').src = player.avatar.move;
    
    // Only sometimes surround the monster with tentacles
    // And only if they were actually on the map (due to difficulty)
    if (difficulty.HAZARD_MAX > 0 && Math.random() > 0.3) {
        document.getElementById('tentacleBefore').src = './images/tentacle.gif';
        document.getElementById('tentacleAfter').src = './images/tentacle.gif';
    }
    
    // Transition the monster and his cohorts to run away
    setTimeout(function() {
        document.getElementById('monsterRun').style.marginLeft = "105%";
    }, 500);
    
    victoryOverlay.style.display = 'block';
    setTimeout(function() {
        victoryOverlay.style.opacity = '1.0';
    },100);
    
    setTimeout(function() {
        window.location.reload();
    }, 8000);
}

function showWelcome() {
    var welcomeOverlay = document.getElementById('welcome');
    welcomeOverlay.style.display = 'block';
    
    var playerName = document.getElementById('welcomeName');
    playerName.style.color = getRandomColor();
    playerName.textContent = player.name;
    
    var monsterName = document.getElementById('monsterName');
    monsterName.textContent = monster.name;
    document.getElementById('monsterWelcomeImage').src = monster.image;
    
    document.getElementById('welcomeIdleImage').src = player.avatar.idle;
    
    // Apply our default difficulty selection
    difficultyChanged("Easy");
    
    document.getElementById('startButton').focus();
}

function hideWelcome() {
    document.getElementById('welcome').style.display = 'none';
}

function updateScoreboard(pointsToAdd) {
    if (scoreboardText) {
        // Update the text
        scoreboardText.nodeValue = parseInt(scoreboardText.nodeValue) + pointsToAdd;
        
        // Prevent overscoring
        if (scoreboardText.nodeValue > difficulty.POINTS_TO_WIN) {
            scoreboardText.nodeValue = difficulty.POINTS_TO_WIN;
        }
        
        // Update the golden progress bar
        var progressDiv = document.getElementById('progressDone'); 
        var donePercent = Math.floor(scoreboardText.nodeValue / difficulty.POINTS_TO_WIN * 100);
        progressDiv.style.width = 'calc(' + donePercent + '% - ' + ASCENT_WIDTH + 'px)';
        if (!progressDiv.style.minWidth) {
            progressDiv.style.minWidth = '10px';
        }
    }
}

function updateBoostFuel() {
    if (boostDiv) {
        var percentLeft = Math.round(difficulty.PLAYER_BOOST_CURRENT_FUEL/difficulty.PLAYER_BOOST_MAX_FUEL*100);
        boostDiv.style.height = 'calc(' + percentLeft + '% - 20px)';
        
        var wrap = document.getElementById('boostWrap');
        if (wrap) {
            wrap.className = 'boostGaugeWrap';
        }
        
        if (percentLeft > 70) {
            boostDiv.style.backgroundColor = 'green';
        }
        else if (percentLeft <= 55 && percentLeft > 25) {
            boostDiv.style.backgroundColor = 'yellow';
        }
        else if (percentLeft <= 25) {
            boostDiv.style.backgroundColor = 'red';
            wrap.className += ' shake';
        }
    }
}

function showTownImage() {
    var images = document.getElementsByClassName('townImage');
    for (var i = 0; i < images.length; i++) {
        var currentImage = images[i];
        if (currentImage.tagName.toLowerCase() === 'img') {
            currentImage.src = player.townImage;
        }
    }
}

function difficultyChanged(newDiff) {
    if (newDiff === "Easy") {
        difficulty.POINTS_TO_WIN = 10000;
        difficulty.OBJECTIVES_MONSTER_SETBACK = 15000;
        difficulty.OBJECTIVES_AUTOADD = 4;
        difficulty.OBJECTIVES_MAX = 25;
        difficulty.OBJECTIVES_CHANCE = 0.55;
        difficulty.OBJECTIVES_TIME = 25;
        difficulty.OBJECTIVES_GLOW = true;
        difficulty.POWERUP_MAX = 2;
        difficulty.MONSTER_MOVE_TIME = 180;
        difficulty.MONSTER_HITS_TO_WIN = 6;
        difficulty.MONSTER_IDEAL_TIME_TO_WIN = 14;
        difficulty.MONSTER_START_AT = 15;
        difficulty.PLAYER_SPEED = 5;
        difficulty.PLAYER_BOOST_RECHARGE = 10;
        difficulty.PLAYER_BOOST_MIN = 25;
        difficulty.PLAYER_BOOST_MAX = 30;
        difficulty.PLAYER_BOOST_MAX_FUEL = 20;
        difficulty.PLAYER_BOOST_CURRENT_FUEL = 20;
        difficulty.HAZARD_MIN = 0;
        difficulty.HAZARD_MAX = 3;
        difficulty.HAZARD_IFRAME_TIME = 1;
        difficulty.HAZARD_PAIN_TIME = 1;
    }
    else if (newDiff === "Medium") {
        difficulty.POINTS_TO_WIN = 15000;
        difficulty.OBJECTIVES_MONSTER_SETBACK = 17000;
        difficulty.OBJECTIVES_AUTOADD = 3;
        difficulty.OBJECTIVES_MAX = 20;
        difficulty.OBJECTIVES_CHANCE = 0.88;
        difficulty.OBJECTIVES_TIME = 45;
        difficulty.OBJECTIVES_GLOW = true;
        difficulty.POWERUP_MAX = 1;
        difficulty.MONSTER_MOVE_TIME = 160;
        difficulty.MONSTER_HITS_TO_WIN = 4;
        difficulty.MONSTER_IDEAL_TIME_TO_WIN = 13;
        difficulty.MONSTER_START_AT = 15;
        difficulty.PLAYER_SPEED = 3.9;
        difficulty.PLAYER_BOOST_RECHARGE = 90;
        difficulty.PLAYER_BOOST_MIN = 25;
        difficulty.PLAYER_BOOST_MAX = 30;
        difficulty.PLAYER_BOOST_MAX_FUEL = 12;
        difficulty.PLAYER_BOOST_CURRENT_FUEL = 12;
        difficulty.HAZARD_MIN = 2;
        difficulty.HAZARD_MAX = 6;
        difficulty.HAZARD_IFRAME_TIME = 2;
        difficulty.HAZARD_PAIN_TIME = 2;
    }
    else if (newDiff === "Hard") {
        difficulty.POINTS_TO_WIN = 20000;
        difficulty.OBJECTIVES_MONSTER_SETBACK = 18000;
        difficulty.OBJECTIVES_AUTOADD = 4;
        difficulty.OBJECTIVES_MAX = 15;
        difficulty.OBJECTIVES_CHANCE = 0.85;
        difficulty.OBJECTIVES_TIME = 55;
        difficulty.OBJECTIVES_GLOW = false;
        difficulty.POWERUP_MAX = 0;
        difficulty.MONSTER_MOVE_TIME = 145;
        difficulty.MONSTER_HITS_TO_WIN = 3;
        difficulty.MONSTER_IDEAL_TIME_TO_WIN = 12;
        difficulty.MONSTER_START_AT = 15;
        difficulty.PLAYER_SPEED = 3.2;
        difficulty.PLAYER_BOOST_RECHARGE = 100;
        difficulty.PLAYER_BOOST_MIN = 25;
        difficulty.PLAYER_BOOST_MAX = 30;
        difficulty.PLAYER_BOOST_MAX_FUEL = 10;
        difficulty.PLAYER_BOOST_CURRENT_FUEL = 8;
        difficulty.HAZARD_MIN = 5;
        difficulty.HAZARD_MAX = 10;
        difficulty.HAZARD_IFRAME_TIME = 1;
        difficulty.HAZARD_PAIN_TIME = 4;
    }
    else if (newDiff === "Random") {
        difficulty.POINTS_TO_WIN = getRandomInt(8000, 120000);
        difficulty.POINTS_TO_WIN = difficulty.POINTS_TO_WIN - (difficulty.POINTS_TO_WIN % 1000) + 1000; // Round to nearest 500
        difficulty.OBJECTIVES_MONSTER_SETBACK = getRandomInt(12000, 20000);
        difficulty.OBJECTIVES_AUTOADD = getRandomInt(2, 6);
        difficulty.OBJECTIVES_MAX = getRandomInt(10, 30);
        difficulty.OBJECTIVES_CHANCE = (Math.random() * (0.99 - 0.3) + 0.3).toFixed(3);
        difficulty.OBJECTIVES_TIME = getRandomInt(30, 80);
        difficulty.OBJECTIVES_GLOW = Math.random() > 0.3 ? true : false;
        difficulty.POWERUP_MAX = getRandomInt(0, 8);
        difficulty.MONSTER_MOVE_TIME = getRandomInt(100, 200);
        difficulty.MONSTER_HITS_TO_WIN = getRandomInt(2, 6);
        difficulty.MONSTER_IDEAL_TIME_TO_WIN = getRandomInt(10, 15);
        difficulty.MONSTER_START_AT = 15;
        difficulty.PLAYER_SPEED = getRandomInt(2.5, 8);
        difficulty.PLAYER_BOOST_RECHARGE = getRandomInt(10, 200);
        difficulty.PLAYER_BOOST_MIN = getRandomInt(5, 60);
        difficulty.PLAYER_BOOST_MAX = getRandomInt(30, 120);
        difficulty.PLAYER_BOOST_MAX_FUEL = getRandomInt(5, 30);
        difficulty.PLAYER_BOOST_CURRENT_FUEL = difficulty.PLAYER_BOOST_MAX_FUEL;
        if (Math.random() > 0.4) {
            difficulty.HAZARD_MIN = getRandomInt(0, 10);
            difficulty.HAZARD_MAX = getRandomInt(10, 50);
        }
        difficulty.HAZARD_IFRAME_TIME = getRandomInt(1, 60);
        difficulty.HAZARD_PAIN_TIME = getRandomInt(1, 10);
    }
    
    if (document.getElementById('custom').checked) {
        applyDifficultyToCustomFields();
    }
}

function clickCustomDifficulty(show) {
    var customPanel = document.getElementById('customDifficultyPanel');
    if (show) {
        customPanel.style.display = 'table-row';
        
        applyDifficultyToCustomFields();
    }
    else {
        customPanel.style.display = 'none';
    }
}

function areCustomFieldsValid() {
    // Apply our difficulty custom difficulty fields if needed
    if (document.getElementById('custom').checked) {
        var panel = document.getElementById('customDifficultyPanel');
        var inputs = panel.getElementsByTagName('input');
        var failedValidation = false;
        for (var i = 0; i < inputs.length; i++) {
            var input = inputs[i];
            
            // Reset our border
            input.style.boxShadow = 'none';
            
            if (!input.value) {
                input.style.boxShadow = '0 0 10px 5px #FF0000';
                failedValidation = true;
            }
            else {
                if (parseFloat(input.value) < parseFloat(input.min)) {
                    input.value = input.min;
                    input.style.boxShadow = '0 0 10px 5px #FF9600';
                    failedValidation = true;
                }
                if (parseFloat(input.value) > parseFloat(input.max)) {
                    input.value = input.max;
                    input.style.boxShadow = '0 0 10px 5px #FF9600';
                    failedValidation = true;
                }
            }
        }
        
        if (failedValidation) {
            return false;
        }
    }
    
    return true;
}

function applyCustomFieldsToDifficulty() {
    if (document.getElementById('custom').checked) {
        difficulty.POINTS_TO_WIN = parseFloat(document.getElementById('points').value);
        difficulty.PLAYER_SPEED = parseFloat(document.getElementById('playerSpeed').value);
        difficulty.PLAYER_BOOST_RECHARGE = parseFloat(document.getElementById('boostRecharge').value);
        difficulty.PLAYER_BOOST_MIN = parseFloat(document.getElementById('boostMin').value);
        difficulty.PLAYER_BOOST_MAX = parseFloat(document.getElementById('boostMax').value);
        difficulty.PLAYER_BOOST_MAX_FUEL = parseFloat(document.getElementById('boostFuel').value);
        difficulty.PLAYER_BOOST_CURRENT_FUEL = parseFloat(document.getElementById('boostCurrentFuel').value);
        difficulty.MONSTER_MOVE_TIME = parseFloat(document.getElementById('monsterMove').value);
        difficulty.MONSTER_HITS_TO_WIN = parseFloat(document.getElementById('monsterHits').value);
        difficulty.MONSTER_IDEAL_TIME_TO_WIN = parseFloat(document.getElementById('monsterTurns').value);
        difficulty.OBJECTIVES_MONSTER_SETBACK = parseFloat(document.getElementById('setback').value);
        difficulty.OBJECTIVES_AUTOADD = parseFloat(document.getElementById('autoadd').value);
        difficulty.OBJECTIVES_MAX = parseFloat(document.getElementById('objMax').value);
        difficulty.OBJECTIVES_CHANCE = parseFloat(document.getElementById('objChance').value);
        difficulty.OBJECTIVES_TIME = parseFloat(document.getElementById('objTime').value);
        difficulty.OBJECTIVES_GLOW = document.getElementById('glow').checked;
        difficulty.POWERUP_MAX = parseFloat(document.getElementById('powerupMax').value);
        difficulty.HAZARD_MIN = parseFloat(document.getElementById('tentacleMin').value);
        difficulty.HAZARD_MAX = parseFloat(document.getElementById('tentacleMax').value);
        difficulty.HAZARD_PAIN_TIME = parseFloat(document.getElementById('tentacleTime').value);
        difficulty.HAZARD_IFRAME_TIME = parseFloat(document.getElementById('iframe').value);
        
        // A couple of rules around ranges, like to ensure max isn't smaller than min
        if (difficulty.PLAYER_BOOST_MIN > difficulty.PLAYER_BOOST_MAX) {
            var keep = difficulty.PLAYER_BOOST_MAX;
            difficulty.PLAYER_BOOST_MAX = difficulty.PLAYER_BOOST_MIN;
            difficulty.PLAYER_BOOST_MIN = keep;
        }
        if (difficulty.PLAYER_BOOST_MAX_FUEL <= 0) {
            difficulty.PLAYER_BOOST_CURRENT_FUEL = 0;
        }
        if (difficulty.OBJECTIVES_AUTOADD > difficulty.OBJECTIVES_MAX) {
            difficulty.OBJECTIVES_AUTOADD = difficulty.OBJECTIVES_MAX;
        }
        if (difficulty.HAZARD_MIN > difficulty.HAZARD_MAX) {
            var keep = difficulty.HAZARD_MAX;
            difficulty.HAZARD_MAX = difficulty.HAZARD_MIN;
            difficulty.HAZARD_MIN = keep;
        }
    }
}

function applyDifficultyToCustomFields() {
    // Apply existing values to our fields
    if (document.getElementById('custom').checked) {
        document.getElementById('points').value = difficulty.POINTS_TO_WIN;
        document.getElementById('playerSpeed').value = difficulty.PLAYER_SPEED;
        document.getElementById('boostRecharge').value = difficulty.PLAYER_BOOST_RECHARGE;
        document.getElementById('boostMin').value = difficulty.PLAYER_BOOST_MIN;
        document.getElementById('boostMax').value = difficulty.PLAYER_BOOST_MAX;
        document.getElementById('boostFuel').value = difficulty.PLAYER_BOOST_MAX_FUEL;
        document.getElementById('boostCurrentFuel').value = difficulty.PLAYER_BOOST_CURRENT_FUEL;
        document.getElementById('monsterMove').value = difficulty.MONSTER_MOVE_TIME;
        document.getElementById('monsterHits').value = difficulty.MONSTER_HITS_TO_WIN;
        document.getElementById('monsterTurns').value = difficulty.MONSTER_IDEAL_TIME_TO_WIN;
        document.getElementById('setback').value = difficulty.OBJECTIVES_MONSTER_SETBACK;
        document.getElementById('autoadd').value = difficulty.OBJECTIVES_AUTOADD;
        document.getElementById('objMax').value = difficulty.OBJECTIVES_MAX;
        document.getElementById('objChance').value = difficulty.OBJECTIVES_CHANCE;
        document.getElementById('objTime').value = difficulty.OBJECTIVES_TIME;
        document.getElementById('glow').checked = difficulty.OBJECTIVES_GLOW;
        document.getElementById('powerupMax').value = difficulty.POWERUP_MAX;
        document.getElementById('tentacleMin').value = difficulty.HAZARD_MIN;
        document.getElementById('tentacleMax').value = difficulty.HAZARD_MAX;
        document.getElementById('tentacleTime').value = difficulty.HAZARD_PAIN_TIME;
        document.getElementById('iframe').value = difficulty.HAZARD_IFRAME_TIME;
        
        areCustomFieldsValid();
    }
}

initMain();