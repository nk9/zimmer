import Phaser from 'phaser'

var brick;

function preload() {
	// this.load.setBaseURL('http://labs.phaser.io')
	this.load.image('hallway', 'assets/pics/hallway.jpg')
	this.load.image('under_bridge', 'assets/pics/under_the_bridge.jpg')

	// Lego Sprites
    this.load.atlas('yellow-bricks', 'assets/sprites/yellow-bricks-spritesheet.png', 'assets/sprites/yellow-bricks-spritesheet.json');
}

function create() {
	var hallway = this.add.image(0, 0, 'hallway')
	hallway.setOrigin(0,0)

    const helloButton = this.add.text(100, 200, 'Hello Phaser!', { fill: '#0f0' });
    helloButton.setInteractive();
    helloButton.on('pointerover', () => { console.log('pointerover'); });

    brick = this.add.sprite(100,100, 'yellow-bricks', '2x4.png')
    brick.setOrigin(0.5);
    brick.setInteractive()
    	.on('pointerover', () => { console.log('brick!'); })
    	.on('pointerup', pointer => { if (pointer.getDistance() < 1) { brick.angle += 90; } });
    this.input.setDraggable(brick);
    this.input.dragDragThreshold = 1;

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

    });

	// var under_bridge = this.add.image(0, 0, 'under_bridge')
	// under_bridge.setOrigin(0,0)
}

function update() {
	// Has to be called in update in order for the change to register
	brick.angle = brick.angle;
}

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 768,
	scene: {
		preload: preload,
		create: create,
		update: update,
	},
}

const game = new Phaser.Game(config)
