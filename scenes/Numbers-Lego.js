import BaseScene, { SceneProgress, Layers } from './base-scene';
import { DRAG_THRESHOLD, GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { NUMBERS_LEGO } from '../constants/scenes';

import Brick, { LEGO_GRID } from '../components/brick';
import PieMeter from '../components/pie-meter';

const SMALL_POUCH_X = 800;
const SMALL_POUCH_Y = 600;
const SMALL_POUCH_W = 40;
const SMALL_POUCH_H = 64;
const kKeyZone = {x: 550, y: 330, width: 60, height: 120};

var bricks = [];
var rects = [];
var rects_background;
var emitters = [];
var pouch_open;
var pie_meter;
var key_zone;

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

		var underlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
		underlay.setOrigin(0,0);

		// Shifted over slightly to line up with the lego grid rectangles
		var tarnished_door = this.add.image(GAME_WIDTH/2+10, GAME_HEIGHT/2, 'tarnished_door');
		tarnished_door.setOrigin(0.5,0.5)
		this.createRectangles();

	    let pouch_closed = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_closed');
	    let pouch_closed_outlined = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_closed_outlined');
	    pouch_closed.scale = .2;
	    pouch_closed_outlined.scale = .2;
	    pouch_closed.setVisible(true);
	    pouch_closed_outlined.setVisible(false);

	    let pouch_closed_zone = this.add.zone(SMALL_POUCH_X, SMALL_POUCH_Y, SMALL_POUCH_W, SMALL_POUCH_H)
	    	.setInteractive({useHandCursor: true})
	    	.on('pointerover', () => {
	    		console.log("pointerover");
	    		if (pouch_closed.visible) {
		    		pouch_closed.setVisible(false);
		    		pouch_closed_outlined.setVisible(true);
		    	}
	    	})
	    	.on('pointerout', () => {
	    		console.log("pointerout");
	    		if (!pouch_closed.visible) {
		    		pouch_closed.setVisible(true);
		    		pouch_closed_outlined.setVisible(false);
		    	}
	    	})
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					pouch_closed.destroy();
					pouch_closed_outlined.destroy();

					this.clickPouch()
					pouch_closed_zone.destroy();
				}
			});

		// let debug = this.add.rectangle(kKeyZone.x, kKeyZone.y, kKeyZone.width, kKeyZone.height, 0xff0000)
		// 			.setOrigin(0,0);
		key_zone = this.make.zone(kKeyZone)
			.setOrigin(0,0)
			.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => {
				this.clickKeyZone()
			});

	    this.input.dragDragThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });
	}

	update() {
		var completedRects = [];

		for (var i = rects.length - 1; i >= 0; i--) {
			let r = rects[i].getBounds();
			var containedBricks = [];
			
			for (var j = bricks.length - 1; j >= 0; j--) {
				let brick = bricks[j];
				let br = brick.getBounds();

				let intersection = Phaser.Geom.Rectangle.Intersection(r, br);

				if (Phaser.Geom.Rectangle.Equals(intersection, br)) {
					// console.log(`brick ${j} (${brick.legoTotal}) is inside rect ${i}`);
					containedBricks.push(brick);
				}
			}

			var emit = false;
			if (containedBricks.length == 2) {
				let brick1 = containedBricks[0],
					brick2 = containedBricks[1];
				let intersection = Phaser.Geom.Rectangle.Intersection(brick1.getBounds(),
																	  brick2.getBounds());
				if (intersection.isEmpty() && brick1.legoTotal + brick2.legoTotal == 10) {
					emit = true;
					completedRects.push(rects[i]);
				}
			}
			
			if (emit && !emitters[i].on) {
				emitters[i].start();
			} else if (!emit && emitters[i].on) {
				emitters[i].stop();
			}
		}

		if (completedRects.length == 3) {
			this.progress = SceneProgress.SUCCEEDED;
		}

		if (this.progress != SceneProgress.FAILED &&
			this.progress != SceneProgress.SUCCEEDED) {
			if (this.updatePieTimer()) {
				this.progress = SceneProgress.FAILED;
				console.log("failed");
			}
		}
	}

	createBricks() {
	    this.addBrick(2, 1, 29, 6);
	    this.addBrick(3, 1, 32, 6);
	    this.addBrick(2, 1, 36, 6);
	    this.addBrick(4, 2, 29, 8);
	    this.addBrick(2, 2, 29, 11);
	    this.addBrick(3, 2, 32, 11);
	    this.addBrick(2, 2, 36, 11);
	    this.addBrick(3, 1, 35, 14);
	    this.addBrick(5, 1, 29, 14);
	    this.addBrick(2, 1, 36, 16);
	    this.addBrick(3, 1, 29, 18);
	    this.addBrick(5, 1, 33, 18);
	}

	addBrick(w, h, x, y, angle=0) {
		let brick = new Brick(this, w, h, x, y, angle);
		brick.setInteractive().on('pointerdown', pointer => {
			for (var i = bricks.length - 1; i >= 0; i--) {
				if (bricks[i] == brick) {
					bricks[i].setDepth(Layers.DRAGGING);
				} else {
					bricks[i].setDepth(Layers.OVER_POUCH);
				}
			}
		});

		bricks.push(brick);
	}

	createRectangles() {
		rects_background = this.add.graphics();
		rects_background.fillStyle(0x000000, .6);
		rects_background.fillRoundedRect(17 * LEGO_GRID,
										 3  * LEGO_GRID,
										 8  * LEGO_GRID,
										 17 * LEGO_GRID);
		rects_background.setDepth(Layers.OVER_DOOR);
		rects_background.setAlpha(0);

		this.addRectangle(2, 5, 20, 5);
		this.addRectangle(2, 5, 18, 13);
		this.addRectangle(2, 5, 22, 13);
	}

	addRectangle(w, h, x, y) {
		// Translated coordinates/dimensions
		let rect = this.add.grid(
			x*LEGO_GRID, y*LEGO_GRID,
			w*LEGO_GRID, h*LEGO_GRID,
			LEGO_GRID, LEGO_GRID, 0xffffff);
		rect.setOrigin(0,0);
		rect.setDepth(Layers.OVER_DOOR);
		rect.setAlpha(0);
		let rectCenter = rect.getTopCenter();

		let total = h * w;
		let text = this.add.text(rectCenter.x, rectCenter.y, `${total}`,
			{fill: "#fff", fontSize: "20pt"});
		text.setOrigin(0.5, 1);
		text.setDepth(Layers.OVER_DOOR);
		text.setAlpha(0);
		rect.text = text;

		rects.push(rect);

	    let particle = this.add.particles('spark')
	    let emitter = particle.createEmitter({
	    	on: false,
	        x: rect.x,
	        y: rect.y,
	        blendMode: 'SCREEN',
	        scale: { start: 0.2, end: 0 },
	        speed: { min: -100, max: 100 },
	        quantity: 10,
	        emitZone: {
		        source: new Phaser.Geom.Rectangle(0, 0, rect.width, rect.height),
		        type: 'edge',
		        quantity: 50
	        }
	    });
		particle.setDepth(Layers.OVER_DOOR);

	    emitters.push(emitter);
	}

	clickPouch() {
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
					pouch_open.setDepth(Layers.POUCH);
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
						targets[i].setDepth(Layers.UNDER_POUCH); // Move bricks on top of background, behind pouch
					}
				},
				onComplete: function () {
				    pie_meter = new PieMeter(this, 120, 120, 30, 0, 1);

				    this.timer = this.time.addEvent({ delay: 32*1000, repeat: 0 });
				},
				onCompleteScope: this,
				onYoyo: function (tween, sprite) {
					sprite.setDepth(Layers.OVER_POUCH); // Move bricks on top of pouch
				},
				delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
					return targetIndex * Phaser.Math.Between(0, 150);
				},
	    	}]
	    });
	}

	clickKeyZone() {
		key_zone.destroy();
		this.tweens.add({
			targets: rects.concat([rects_background]).concat(rects.map(o => o.text)),
			ease: 'Sine.easeIn',
			duration: 1000,
			alpha: 1
		});
	}

	updatePieTimer() {
		if (this.timer !== undefined) {
			let progress_deg = this.timer.getProgress() * 360;
			pie_meter.drawPie(progress_deg);

			return (progress_deg == 360);
		}

		return false;
	}
}

export default Numbers_Lego;
