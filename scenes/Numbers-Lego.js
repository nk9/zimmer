import BaseScene from './base-scene';
import { DRAG_THRESHOLD } from '../constants/config';
import { NUMBERS_LEGO } from '../constants/scenes';

var bricks = [];
var pouch_closed;
var pouch_open;
const LEGO_GRID = 29;
const SMALL_POUCH_X = 1000;
const SMALL_POUCH_Y = 700;

class Numbers_Lego extends BaseScene {
    constructor() {
        super(NUMBERS_LEGO);
    }

    init() {
        super.init();
    }

	create() {
        // super.create('a', 'b', true);
		var church_door = this.add.image(0, 0, 'church_door')
		church_door.setOrigin(0,0)

		// Inside brick bag background
		// var graphics = this.add.graphics();
		// graphics.fillStyle(0x000000, .5);
		// graphics.fillRoundedRect(31 * LEGO_GRID,
		// 						 1  * LEGO_GRID,
		// 						 8  * LEGO_GRID,
		// 						 20 * LEGO_GRID)

	    pouch_closed = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_closed');
	    pouch_closed.scale = .4;
	    pouch_closed.alpha = .5;
	    pouch_closed.setInteractive()
	    	.on('pointerover', () => { pouch_closed.alpha = 1; })
	    	.on('pointerout', () => { pouch_closed.alpha = .5; })
			.on('pointerup', pointer => { if (pointer.getDistance() < DRAG_THRESHOLD) { this.clickPouch() } });

	    this.input.dragDragThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });
	}

	update() {
		// Has to be called in update in order for the change to register
		// for (var i = bricks.length - 1; i >= 0; i--) {
		// 	bricks[i].angle = bricks[i].angle;
		// }
	}

	addBrick(brickName, x, y) {
		let brick = this.add.sprite(x * LEGO_GRID,
									y * LEGO_GRID,
									'yellow-bricks',
									brickName+".png")
		brick.setOrigin(0, 0);
		brick.setInteractive()
			// .on('pointerover', () => { console.log('brick!'); })
			.on('pointerup', pointer => { if (pointer.getDistance() < DRAG_THRESHOLD) { brick.angle += 90; } });
		this.input.setDraggable(brick);

		bricks.push(brick);
	}

	clickPouch() {
		pouch_closed.destroy();
	    
	    pouch_open = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_open');
	    pouch_open.scale=0.1;
	    var tween = this.tweens.add({
	    	targets: pouch_open,
	    	scale: .8,
	    	x: 36 * LEGO_GRID,
	    	y: 12 * LEGO_GRID,
	    	ease: 'Sine.easeOut',
	    	duration: 1000,
	    	onComplete: this.showBricks,
	    	onCompleteScope: this
	    });
	}

	showBricks(tween, targets, custom) {
		console.log("showBricks");

	    // Create bricks
	    const offset = 15 * LEGO_GRID;
	    this.addBrick('1x2', 29, 2);
	    this.addBrick('1x2', 32, 2);
	    this.addBrick('1x2', 35, 2);
	    this.addBrick('2x4', 29, 4);
	    this.addBrick('2x4', 34, 4);
	    this.addBrick('2x2', 29, 7);
	    this.addBrick('2x3', 32, 7);
	    this.addBrick('2x3', 29, 10);

		pouch_open.setDepth(1);

	    var tween = this.tweens.add({
	    	targets: bricks,
	    	y: '-='+offset,
	    	yoyo: true,
	    	repeat: 0,
	    	ease: 'Bounce.easeOut',
	    	duration: 500,
	    	onYoyo: function (tween, sprite) {
	    		sprite.setDepth(2);
	    	}
	    });
	}
}

export default Numbers_Lego;