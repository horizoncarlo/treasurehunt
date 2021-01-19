var ASCENT_WIDTH = 100;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomBoolean() {
    return Math.random() >= 0.5;
}

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    
    return color;
}

function getRandomName() {
    var NAME_LIST = [
        'Roshan',
        'Sly',
        'Rainbow',
        'Happy',
        'Buttons',
        'Snowflake',
        'Jigglehat',
        'Sugar',
        'Rusty'
    ];
    return NAME_LIST[Math.floor(Math.random() * NAME_LIST.length)];
}

function getRandomMonsterImage() {
    var MONSTER_LIST = [
        "basilisk.png",
        "bugboy.png",
        "choppers.png",
        "cobragirl.png",
        "cultist.png",
        "deepfisher.png",
        "dragon.png",
        "drake.png",
        "eyegrab.png",
        "fire.png",
        "flapper.png",
        "fourarm.png",
        "goatman.png",
        "goblin.png",
        "golem.png",
        "harpy.png",
        "jelly.png",
        "icelord.png",
        "imp.png",
        "lizard.png",
        "lionman.png",
        "medusa.png",
        "minotaur.png",
        "mushroom.png",
        "orc.png",
        "pigman.png",
        "raiders.png",
        "ratking.png",
        "rider.png",
        "shade.png",
        "snakeface.png",
        "spider.png",
        "treeface.png",
        "watcher.png",
        "wizard.png",
        "wolf.png",
        "wurm.png",
        "zombies.png"
    ];
    return './images/monsters/' + MONSTER_LIST[Math.floor(Math.random() * MONSTER_LIST.length)];
}

function getRandomTownImage() {
    var TOWN_LIST = [
        "mushroom_blue.png",
        "mushroom_brown.png",
        "mushroom_crimson.png",
        "mushroom_green.png",
        "mushroom_purple.png",
        "mushroom_red.png",
        "mushroom_yellow.png"
    ];
    return './images/towns/' + TOWN_LIST[Math.floor(Math.random() * TOWN_LIST.length)];
}

function getRandomAvatar() {
    var AVATAR_LIST = [
        { name: 'dragon', width: '165px', height: '85px' },
        { name: 'elf', width: '47px', height: '47px' },
        { name: 'unicorn', width: '63px', height: '63px' },
    ];
    var selected = AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)];
    
    selected.file = './images/avatars/' + selected.name;
        
    return {
        idle: selected.file + '_idle.gif',
        move: selected.file + '_move.gif',
        dead: selected.file + '_dead.gif',
        width: selected.width,
        height: selected.height
    };
}

var docHeight = -1;
function getDocumentHeight() {
    if (docHeight === -1) {
        docHeight = document.body.getBoundingClientRect().height;
    }
    return docHeight;
}

var docWidth = -1;
function getDocumentWidth() {
    if (docWidth === -1) {
        docWidth = document.body.getBoundingClientRect().width;
    }
    return docWidth;
}

function isCollide(a, b) {
    var aRect = a.getBoundingClientRect();
    var bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height) < (bRect.top)) ||
        (aRect.top > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width) < bRect.left) ||
        (aRect.left > (bRect.left + bRect.width))
    );
}

function addChild(child) {
    document.getElementById('game').appendChild(child);
}

function deleteChild(child) {
    document.getElementById('game').removeChild(child);
}

// Check if A is north (lower Y coordinates) of B
function isNorthOf(a, b) {
    return parseInt(a.style.top) < parseInt(b.style.top);
}
