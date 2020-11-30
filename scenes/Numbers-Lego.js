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
const KEY_ZONE_X = 460;
const KEY_ZONE_Y = 520;
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

		// Create these first so they are under the background picture
	    this.createBricks();
		this.createRectangles();

		var church_door = this.add.image(0, 0, 'church_door')
		church_door.setOrigin(0,0)

	    pouch_closed = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_closed');
	    pouch_closed.scale = .2;
	    pouch_closed.alpha = .2;
	    pouch_closed.setInteractive({ useHandCursor: true })
	    	.on('pointerover', () => { pouch_closed.alpha = 1; })
	    	.on('pointerout', () => { pouch_closed.alpha = .2; })
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					this.clickPouch()
				}
			});

		// let debug = this.add.rectangle(KEY_ZONE_X, KEY_ZONE_Y, 40, 40, 0xff0000)
		let key_zone = this.add.zone(KEY_ZONE_X, KEY_ZONE_Y, 40, 40)
			.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => {
				this.clickKeyholes()
			})

	    this.input.dragDragThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });
	}

	update() {
		for (var i = rects.length - 1; i >= 0; i--) {
			let r = rects[i].getBounds();
			var overlapCount = 0;
			
			for (var j = bricks.length - 1; j >= 0; j--) {
				let brick = bricks[j];
				let br = brick.getBounds();

				var intersection = Phaser.Geom.Rectangle.Intersection(r, br);

				if (Phaser.Geom.Rectangle.Equals(intersection, br)) {
					console.log(`brick ${j} (${brick.legoTotal}) is inside rect ${i}`);
				}
			}
		}
	}

	createBricks() {
	    // Create bricks
	    const offset = 15 * LEGO_GRID;
	    this.addBrick(2, 1, 29, 6);
	    this.addBrick(3, 1, 32, 6);
	    this.addBrick(2, 1, 36, 6);
	    this.addBrick(4, 2, 29, 8);
	    this.addBrick(4, 2, 34, 8);
	    this.addBrick(2, 2, 29, 11);
	    this.addBrick(3, 2, 32, 11);
	    this.addBrick(2, 2, 36, 11);
	    this.addBrick(3, 1, 35, 14);
	    this.addBrick(5, 1, 29, 14);
	    this.addBrick(6, 1, 29, 16);
	    this.addBrick(2, 1, 36, 16);
	    this.addBrick(3, 1, 29, 18);
	    this.addBrick(5, 1, 33, 18);
	    this.addBrick(7, 1, 30, 20);
	}

	addBrick(w, h, x, y) {
		let wL = w * LEGO_GRID;
		let hL = h * LEGO_GRID;

		var container = this.add.container(x * LEGO_GRID, y * LEGO_GRID);
		container.setSize(wL, hL);
		container.legoTotal = w*h;
		container.legoW = w;
		container.legoH = h;
		
		let brick = this.add.sprite(0, 0,
									'yellow-bricks',
									`${h}x${w}.png`);
		brick.setOrigin(0, 0);
		let brickCenter = brick.getCenter();

		let text = this.add.text(brickCenter.x, brickCenter.y, `${w*h}`,
			{fill: "#000", fontSize: "17pt", stoke: "#fff", strokeThickness: 5});
		text.setOrigin(0.5, 0.5);

		container.setInteractive({
			hitArea:new Phaser.Geom.Rectangle(wL/2, hL/2, wL, hL),
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		})
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					container.angle += 90; text.angle -= 90;
				}
			});
		this.input.setDraggable(container);

		container.add(brick);
		container.add(text);

		bricks.push(container);
	}

	createRectangles() {
		this.addRectangle(2, 5, 12, 7);
		this.addRectangle(2, 5, 10, 15);
		this.addRectangle(2, 5, 14, 15);
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
		rect.text = text;

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

	clickKeyholes() {
		console.log("clicked!")
	}
}

export default Numbers_Lego;
