import Phaser from 'phaser'

var bricks = [];
const kDragThreshold = 2;
const kLegoGrid = 29;

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

    // Create bricks
    addBrick.call(this, '2x4', 5, 6);
    addBrick.call(this, '1x4', 10, 6);
    addBrick.call(this, '1x1', 2, 6);

    this.input.dragDragThreshold = kDragThreshold;

    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
        gameObject.x = Phaser.Math.Snap.To(dragX, kLegoGrid);
        gameObject.y = Phaser.Math.Snap.To(dragY, kLegoGrid);
    });

	// var under_bridge = this.add.image(0, 0, 'under_bridge')
	// under_bridge.setOrigin(0,0)
}

function addBrick(brickName, x, y) {
	let brick = this.add.sprite(x * kLegoGrid,
								y * kLegoGrid,
								'yellow-bricks',
								brickName+".png")
	brick.setOrigin(0, 0);
	brick.setInteractive()
		// .on('pointerover', () => { console.log('brick!'); })
		.on('pointerup', pointer => { if (pointer.getDistance() < kDragThreshold) { brick.angle += 90; } });
	this.input.setDraggable(brick);

	bricks.push(brick);
}

function update() {
	// Has to be called in update in order for the change to register
	for (var i = bricks.length - 1; i >= 0; i--) {
		bricks[i].angle = bricks[i].angle;
	}
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
