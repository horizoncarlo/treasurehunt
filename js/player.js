var player = {
    currentBoost: 0,
    townImage: '',
    avatar: {}
};
var moveRequest = {}; // x, y

function initPlayer() {
    player.name = getRandomName();
    player.townImage = getRandomTownImage();
    player.avatar = getRandomAvatar();
    showTownImage();
    
    player.div = document.createElement('div');
    player.div.id = 'player';
    player.div.style.position = 'absolute';
    player.div.style.top = getDocumentHeight()/2 + 'px';
    player.div.style.left = getDocumentWidth()/2 + 'px';
    player.div.style.width = player.avatar.width;
    player.div.style.height = player.avatar.height;
    player.div.style.zIndex = '100';
    
    var image = document.createElement('img');
    player.image = image;
    setIdleAnimation();
    player.div.appendChild(player.image);
    
    addChild(player.div);
}

function hidePlayer() {
    player.div.style.display = 'none';
}

function showPlayer() {
    player.div.style.display = 'block';
    player.div.className += ' pulse';
}

function setCurrentBoostFuel(newBoostFuel) {
    difficulty.PLAYER_BOOST_CURRENT_FUEL = newBoostFuel;
    
    updateBoostFuel();
}

function determineCurrentBoost() {
    if (player.currentBoost > 0) {
        var toReturn = player.currentBoost;
        player.currentBoost = 0;
        return toReturn;
    }
    return 0;
}

function performBoost() {
    if (difficulty.PLAYER_BOOST_CURRENT_FUEL > 0) {
        player.currentBoost = getRandomInt(difficulty.PLAYER_BOOST_MIN, difficulty.PLAYER_BOOST_MAX);
        
        setCurrentBoostFuel(difficulty.PLAYER_BOOST_CURRENT_FUEL-1);
    }
}

function moveUp() {
    player.div.style.top = parseInt(player.div.style.top) - (difficulty.PLAYER_SPEED + determineCurrentBoost());
}

function moveDown() {
    player.div.style.top = parseInt(player.div.style.top) + (difficulty.PLAYER_SPEED + determineCurrentBoost());
}

function moveLeft() {
    // Give a slight innate speed bonus when going horizontal due to widescreen monitors
    player.div.style.left = parseInt(player.div.style.left) - ((difficulty.PLAYER_SPEED * 1.1) + determineCurrentBoost());
    
    // Only flip if we don't have a different scale effect applied
    if (!player.div.style.transform || player.div.style.transform.indexOf('1)') !== -1) {
        player.div.style.transform = 'scaleX(-1)';
    }
}

function moveRight() {
    // Give a slight innate speed bonus when going horizontal due to widescreen monitors
    player.div.style.left = parseInt(player.div.style.left) + ((difficulty.PLAYER_SPEED * 1.1) + determineCurrentBoost());
    if (!player.div.style.transform || player.div.style.transform.indexOf('1)') !== -1) {
        player.div.style.transform = 'scaleX(1)';
    }
}

function clickMoveFunction() {
    // Determine if we're already selected, purely by our border like a barbarian
    if (!this.style.border || this.style.border === 'none') {
        addObjectiveBorder(this);
        requestMoveTo(this, parseInt(this.style.left), parseInt(this.style.top));
    }
    else {
        clearObjectiveBorder(this);
        clearMoveTo();
    }
}

function requestMoveTo(target, x, y) {
    if (moveRequest && moveRequest.target) {
        clearObjectiveBorder(moveRequest.target);
    }
    
    moveRequest = {
        target: target,
        x: x,
        y: y
    }
}

function clearMoveTo() {
    if (moveRequest && moveRequest.target) {
        clearObjectiveBorder(moveRequest.target);
    }
    
    moveRequest = null;
}

function setMoveAnimation() {
    player.image.src = player.avatar.move;
}

function setIdleAnimation() {
    player.image.src = player.avatar.idle;
}
