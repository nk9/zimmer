import BaseScene from './base-scene';
import { DRAG_THRESHOLD } from '../constants/config';
import { NUMBERS_LEGO } from '../constants/scenes';

var bricks = [];
var rects = [];
var pouch_closed;
var pouch_open;
const LEGO_GRID = 29;
const SMALL_POUCH_X = 1000;
const SMALL_POUCH_Y = 700;
const POUCH_DEPTH = 10;
const UNDER_POUCH_DEPTH = 8;
const ABOVE_POUCH_DEPTH = 12;

class Numbers_Lego extends BaseScene {
    constructor() {
        super(NUMBERS_LEGO);
    }

    init() {
        super.init();
    }

	create() {
        // super.create('a', 'b', true);

	    this.createBricks();

		var church_door = this.add.image(0, 0, 'church_door')
		church_door.setOrigin(0,0)

		this.createRectangles();

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

		// for (var i = rects.length - 1; i >= 0; i--) {
		// 	let r = rects[i]
		// 	let topLeft = r.getTopLeft()
		// 	let size = Phaser.Geom.Rectangle.GetSize(r)
		// 	let overlap = this.physics.overlapRect(topLeft.x, topLeft.y, size.x, size.y);
		// 	console.log(overlap);
		// }
	}

	createBricks() {
		console.log("createBricks");

	    // Create bricks
	    const offset = 15 * LEGO_GRID;
	    this.addBrick(2, 1, 29, 3);
	    this.addBrick(2, 1, 32, 3);
	    this.addBrick(2, 1, 35, 3);
	    this.addBrick(4, 2, 29, 5);
	    this.addBrick(4, 2, 34, 5);
	    this.addBrick(2, 2, 29, 8);
	    this.addBrick(3, 2, 32, 8);
	    this.addBrick(3, 2, 29, 18);
	}

	addBrick(w, h, x, y) {
		let brick = this.add.sprite(x * LEGO_GRID, y * LEGO_GRID,
									'yellow-bricks',
									`${h}x${w}.png`)
		brick.setOrigin(0, 0);
		brick.setInteractive()
			.on('pointerup', pointer => {if (pointer.getDistance() < DRAG_THRESHOLD) { brick.angle += 90; }});
		this.input.setDraggable(brick);

		bricks.push(brick);
	}

	createRectangles() {
		this.addRectangle(2, 5, 2, 2);
		this.addRectangle(6, 2, 6, 2);
		this.addRectangle(3, 4, 6, 5);
	}

	addRectangle(w, h, x, y) {
		// Translated coordinates/dimensions
		let rect = this.add.grid(
			x*LEGO_GRID, y*LEGO_GRID,
			w*LEGO_GRID, h*LEGO_GRID,
			LEGO_GRID, LEGO_GRID, 0xffffff);
		rect.setOrigin(0,0);
		let rectCenter = rect.getTopCenter();

		let total = h * w;
		let text = this.add.text(rectCenter.x, rectCenter.y, `${total}`,
			{fill: "#fff", fontSize: "20pt"});
		text.setOrigin(0.5, 1);

		rects.push(rect);
	}

	clickPouch() {
		pouch_closed.destroy();
	    
	    pouch_open = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_open');
	    pouch_open.scale=0.1;

	    var timeline = this.tweens.timeline({
	    	tweens: [{
				targets: pouch_open,
				scale: .8,
				x: 36 * LEGO_GRID,
				y: 13 * LEGO_GRID,
				ease: 'Sine.easeOut',
				duration: 1000,
				onComplete: function (tween, sprite) {
					pouch_open.setDepth(POUCH_DEPTH);
				}
	    	}, {
				targets: bricks.slice().reverse(),
				y: -5*LEGO_GRID,
				yoyo: true,
				repeat: 0,
				ease: 'Sine.easeOut',
				duration: 350,
				onStart: function (tween, targets) {
					for (var i = targets.length - 1; i >= 0; i--) {
						targets[i].setDepth(UNDER_POUCH_DEPTH); // Move bricks on top of background, behind pouch
					}
				},
				onYoyo: function (tween, sprite) {
					sprite.setDepth(ABOVE_POUCH_DEPTH); // Move bricks on top of pouch
				},
				delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
					return targetIndex * Phaser.Math.Between(0, 250);
				}
	    	}]
	    });
	}
}

export default Numbers_Lego;