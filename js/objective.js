var maxPoints = Math.max(document.body.getBoundingClientRect().width, document.body.getBoundingClientRect().height); // Max points is the biggest of the width or height of the page

function createObjective(origin) {
    var newObj = {
        points: 100
    };
    
    newObj.div = document.createElement('div');
    newObj.div.className = 'o';
    
    // If we have an origin create the objective near it, otherwise just randomly
    if (origin) {
        var dim = origin.getBoundingClientRect();
        newObj.div.style.top = (dim.top + (getRandomInt(50, 150) * (getRandomBoolean() ? -1 : 1))) + 'px';
        newObj.div.style.left = (dim.left + (getRandomInt(50, 150) * (getRandomBoolean() ? -1 : 1))) + 'px';
        
        // Ensure our creation fits inside the map
        if (parseInt(newObj.div.style.left) < ASCENT_WIDTH) {
            newObj.div.style.left = (ASCENT_WIDTH + getRandomInt(5, 15)) + 'px';
        }
        else if (parseInt(newObj.div.style.left) > (getDocumentWidth()-32)) {
            newObj.div.style.left = (getDocumentWidth()-32-getRandomInt(5, 15)) + 'px';
        }
        if (parseInt(newObj.div.style.top) < 0) {
            newObj.div.style.top = getRandomInt(10, 20) + 'px';
        }
        else if (parseInt(newObj.div.style.top) > (getDocumentHeight()-32)) {
            newObj.div.style.top = (getDocumentHeight()-32-getRandomInt(5, 15)) + 'px';
        }
    }
    else {
        newObj.div.style.top = getRandomInt(0, getDocumentHeight()-32) + 'px';
        newObj.div.style.left = getRandomInt(ASCENT_WIDTH, getDocumentWidth()-32) + 'px'; // Account for ascent bar on the left
    }
    
    if (difficulty.OBJECTIVES_GLOW) {
        newObj.div.style.boxShadow = '0 0 10px 5px rgba(201,112,80,0.8)';
    }
    
    // On click try to move the player to the coin
    newObj.div.onclick = clickMoveFunction;
    
    // Scale points based on initial distance
    newObj.points = Math.max(
        (Math.abs(parseInt(player.div.style.top) - parseInt(newObj.div.style.top))),
        (Math.abs(parseInt(player.div.style.left) - parseInt(newObj.div.style.left))));
    
    // Apply a tooltip for the exact points value
    newObj.div.title = 'Points: ' + newObj.points;
    
    // Figure out an applicable image
    var tier = 'copper';
    if (newObj.points >= (maxPoints/3)) {
        tier = 'gold';
        applyGoldGlow(newObj);
    }
    else if (newObj.points >= (maxPoints/4.5)) {
        tier = 'silver';
        if (difficulty.OBJECTIVES_GLOW) {
            newObj.div.style.boxShadow = '0 0 10px 5px rgba(146,148,167,0.7)';
        }
    }
    
    var image = document.createElement('img');
    image.src = './images/' + tier + '_coin.gif';
    newObj.div.appendChild(image);
    
    objectives.push(newObj);
    
    addChild(newObj.div);
}

function applyGoldGlow(obj) {
    if (difficulty.OBJECTIVES_GLOW) {
        obj.div.style.boxShadow = '0 0 10px 5px rgba(223,189,0,0.6)';
    }
}

function addObjectiveBorder(div) {
    div.style.border = '2px solid gold';
}

function clearObjectiveBorder(div) {
    div.style.border = 'none';
    div.style.boxShadow = 'none';
}

function grabObjective(obj) {
    // Give points
    updateScoreboard(obj.points);
    
    // Clear any movement border
    clearObjectiveBorder(obj.div);
    
    // Move the objective to the monster
    var monsterRect = monster.div.getBoundingClientRect();
    obj.div.style.top = (monsterRect.top + (monsterRect.height/3)) + 'px';
    obj.div.style.left = (monsterRect.left + (monsterRect.width/3)) + 'px';
    obj.div.style.opacity = '0.8';
    
    // Adjust the monster as we pay them off
    // We want to move the monster backwards a percentage equal to the points, so that it scales with the screen
    setbackMonster(obj.points/difficulty.OBJECTIVES_MONSTER_SETBACK);
    
    // Remove the objective
    setTimeout(function() {
        deleteChild(obj.div);
    }, 1100);
}

/**
 * Perform the passed function (as fnc) on the nearest "applyCount" objectives to the player
 */
function actOnNearbyObjectives(fnc, applyCount) {
    // Do nothing if we don't actually have a function
    if (!fnc && typeof fnc !== 'function') {
        console.error("Action requested on nearby coins but no function was passed");
        return;
    }
    
    // Look for nearby objectives
    var playerTop = player.div.getBoundingClientRect().top;
    var playerLeft = player.div.getBoundingClientRect().left;
    var currentCount = 0;
    for (var objLoop = 0; objLoop < objectives.length; objLoop++) {
        var currentObj = objectives[objLoop].div.getBoundingClientRect();
        
        if (Math.abs(currentObj.top - playerTop) <= getDocumentHeight()/5 ||
            Math.abs(currentObj.left - playerLeft) <= getDocumentWidth()/4) {
            if (fnc(objectives[objLoop])) {
                currentCount++;
            }
        }
        
        if (currentCount > applyCount) {
            break;
        }
    }
}

function setbackMonster(amount) {
    // Move the monster back the desired amount
    var monsterRect = monster.div.getBoundingClientRect();
    var distance = getDocumentHeight() * amount;
    monster.div.style.top = Math.floor((monsterRect.y + distance)) + 'px';
    
    // See if we moved the monster too far
    if (parseInt(monster.div.style.top) > (getDocumentHeight() - 64 - difficulty.MONSTER_START_AT)) {
        monster.div.style.top = (getDocumentHeight() - 64 - difficulty.MONSTER_START_AT) + 'px';
    }
}