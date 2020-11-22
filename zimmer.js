import Phaser from 'phaser'

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

    var brick = this.add.sprite(100,100, 'yellow-bricks', '2x4.png')
    brick.setInteractive()
    	.on('pointerover', () => { console.log('brick!'); });
    this.input.setDraggable(brick);

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {

        gameObject.x = dragX;
        gameObject.y = dragY;

    });

	// var under_bridge = this.add.image(0, 0, 'under_bridge')
	// under_bridge.setOrigin(0,0)
}

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 768,
	scene: {
		preload: preload,
		create: create,
	},
}

const game = new Phaser.Game(config)
