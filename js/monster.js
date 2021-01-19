var monster = {
    minSpeed: 1,
    maxSpeed: 1,
    townHits: 0,
    image: getRandomMonsterImage(),
};

function makeMonster() {
    // Monster
    monster.div = document.createElement('div');
    monster.div.id = 'monster';
    monster.div.className = 'monster';
    monster.div.style.top = (getDocumentHeight() - 64 - difficulty.MONSTER_START_AT) + 'px'; // Start at our base (accounting for image size) plus any startAt modifiers
    
    var monsterImage = document.createElement('img');
    monsterImage.src = monster.image;
    
    monster.div.appendChild(monsterImage);
    
    // Also calculate our move speed based on the window height
    // We basically want the monster to win in 30 seconds, so ~15 moves at a 2 second rate
    var averageSpeed = getDocumentHeight()/difficulty.MONSTER_IDEAL_TIME_TO_WIN;
    monster.minSpeed = averageSpeed - getRandomInt(1, 3);
    monster.maxSpeed = averageSpeed + getRandomInt(1, 3);
    
    return monster.div;
}

function monsterHitTown() {
    // Shake the monster to show their fury
    if (monster.div.className.indexOf('attack') === -1) {
        monster.div.className += ' attack';
        
        // Remove our attack animation after it completes in 1.5s
        setTimeout(function() {
            monster.div.className = 'monster';
        }, 1500);
    }
    
    // Count successful hits
    monster.townHits++;
    
    initTownFire();
}

function initTownFire() {
    // Light some fires baby
    var fire = document.createElement('img');
    fire.src = './images/fire.gif';
    fire.className = 'fire';
    
    // Get the rectangle of the entire ascent bar, then create fires inside it
    var townRect = document.getElementById('ascent').getBoundingClientRect();
    // Subtract the image width so the fire stays inside the ascent
    fire.style.left = (getRandomInt(townRect.left, townRect.width) - 25) + 'px';
    // Make sure we don't place a fire over the scoreboard
    var topPlacement = getRandomInt(townRect.top, townRect.height) - 25; // Subtract image height so we don't go offscreen
    if (topPlacement < document.getElementById('scoreboard').offsetHeight) {
        topPlacement = document.getElementById('scoreboard').offsetHeight;
    }
    fire.style.top = topPlacement + 'px';
    
    townDiv.appendChild(fire);
}

function applyName() {
    var strippedName = monster.image;
    strippedName = strippedName.substring(strippedName.lastIndexOf('/')+1, strippedName.lastIndexOf('.'));
    strippedName = strippedName.substring(0, 1).toUpperCase() + strippedName.substring(1, strippedName.length);
    
    monster.name = strippedName;
}

applyName();
