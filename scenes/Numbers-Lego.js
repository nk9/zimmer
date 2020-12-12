import BaseScene, { SceneProgress, Layers } from './base-scene';
import { DRAG_THRESHOLD, GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { NUMBERS_LEGO } from '../constants/scenes';

import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import PieMeter from '../components/pie-meter';
import Alert from '../components/alert';

const SMALL_POUCH_X = 800;
const SMALL_POUCH_Y = 600;
const SMALL_POUCH_W = 40;
const SMALL_POUCH_H = 64;
const kKeyZone = {x: 550, y: 330, width: 60, height: 120};

const FAIL_ALERT = 'FailAlert';

class Numbers_Lego extends BaseScene {
    constructor() {
        super(NUMBERS_LEGO);
    }

    init() {
        super.init();
    }

	create() {
        // super.create('a', 'b', true);

		this.rects = [];
		this.emitters = [];
		this.timer;
		this.run_time = 30; // 30 seconds
		this.pie_meter;

		// Create these first so they are under the background picture
	    this.createBricks();

		this.createBackground();
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
		this.key_zone = this.make.zone(kKeyZone)
			.setOrigin(0,0)
			.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => {
				this.clickKeyZone()
			});

		this.createCountdownTimer()

	    this.input.dragDragThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });

		console.log("create alert");
		this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
			title: "Whoops",
			content: "You're gonna have to be faster than that!",
			buttonText: "Try Again",
			buttonAction: this.resetAfterFail,
			context: this
		});

        // this.events.on('transitionstart', function(fromScene, duration){
        // 	fromScene.scene.remove(FAIL_ALERT);
        // });

	}

	resetAfterFail() {
		this.scene.stop(FAIL_ALERT); // clear alert

		this.pie_meter.visible = false;
		this.pie_meter_text.visible = false;
		this.timer = undefined;
		this.brick_fall_tween.stop();

		this.clickPouch(false);
		this.progress = SceneProgress.BEGIN;
	}

	update() {
		var completedRects = [];

		if (this.progress != SceneProgress.FAILED &&
			this.progress != SceneProgress.SUCCEEDED) {

			for (var i = this.rects.length - 1; i >= 0; i--) {
				let r = this.rects[i].getBounds();
				var containedBricks = [];
				
				for (const brick of this.brick_store.bricks) {
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
						completedRects.push(this.rects[i]);
					}
				}
				
				if (emit && !this.emitters[i].on) {
					this.emitters[i].start();
				} else if (!emit && this.emitters[i].on) {
					this.emitters[i].stop();
				}
			}

			if (completedRects.length == 3) {
				this.progress = SceneProgress.SUCCEEDED;
				this.succeed();
			}

			if (this.updatePieTimer()) {
				this.progress = SceneProgress.FAILED;
				this.fail();
			}
		}

		this.swirl.rotation += 0.01;
	}

	createBackground() {
		this.underlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
		this.underlay.setOrigin(0,0);

		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		let swirl_y = center_y - 10;
		this.swirl = this.add.image(center_x, swirl_y, 'aqua_swirl');
		this.swirl.scale += .1;
		// this.swirl.visible = false;

		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x+0;
		this.background_open = this.add.image(bg_x, center_y, 'tarnished_door_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(bg_x, center_y, 'tarnished_door');
		this.background_closed.setOrigin(0.5, 0.5);

		let bg_bounds = this.background_closed.getBounds();
		this.left_screen  = this.add.rectangle(0,
											   0,
											   bg_bounds.x,
											   GAME_HEIGHT,
											   0x000000);
		this.right_screen = this.add.rectangle(bg_bounds.right,
											   0,
											   GAME_WIDTH-bg_bounds.right,
											   GAME_HEIGHT,
											   0x000000);
		this.left_screen.setOrigin(0, 0);
		this.right_screen.setOrigin(0, 0);
	}

	createCountdownTimer() {
	    this.pie_meter = new PieMeter(this, 120, 120, 30, 0, 1);
	    this.pie_meter.visible = false;
	    this.pie_meter_text = this.add.text(120, 160, `0.00`,
	    	{fill: "#fff", fontSize: `20pt`});
	    this.pie_meter_text.visible = false;
	    this.pie_meter_text.setOrigin(0.5, 0);
	}

	createBricks() {
		this.brick_store = new BrickStore(this, 29, 6);

		this.brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x2);
		this.brick_store.addRow(BSBrick.B2x4);
		this.brick_store.addRow(BSBrick.B2x2, BSBrick.B2x3, BSBrick.B2x2);
		this.brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);
		this.brick_store.addRow(BSBrick.B1x2);
		this.brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);

		this.brick_store.shuffle();

		for (var brick of this.brick_store.bricks) {
			brick.setInteractive().on('pointerdown', pointer => {
				for (var i = this.brick_store.bricks.length - 1; i >= 0; i--) {
					if (this.brick_store.bricks[i] == brick) {
						this.brick_store.bricks[i].setDepth(Layers.DRAGGING);
					} else {
						this.brick_store.bricks[i].setDepth(Layers.OVER_POUCH);
					}
				}
			});

			// Make sure bricks don't respond to input until they enter the scene
			brick.input.enabled = false;
		}
	}

	createRectangles() {
		this.rects_background = this.add.graphics();
		this.rects_background.fillStyle(0x000000, .6);
		this.rects_background.fillRoundedRect(17 * LEGO_GRID,
										 3  * LEGO_GRID,
										 8  * LEGO_GRID,
										 17 * LEGO_GRID);
		this.rects_background.setDepth(Layers.OVER_DOOR);
		this.rects_background.setAlpha(0);

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

		this.rects.push(rect);

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

	    this.emitters.push(emitter);
	}

	clickPouch(should_open_pouch = true) {
		var tweens = [];

		console.log(this.brick_store.bricks);

		if (should_open_pouch) {
		    this.pouch_open = this.add.image(SMALL_POUCH_X, SMALL_POUCH_Y, 'pouch_open');
		    this.pouch_open.scale=0.1;

		    let pouch_open_tween = {
				targets: [this.pouch_open],
				scale: .8,
				x: 36 * LEGO_GRID,
				y: 13 * LEGO_GRID,
				ease: 'Sine.easeOut',
				duration: 1000,
				onComplete: function (tween, targets) {
					targets[0].setDepth(Layers.POUCH);
				}
	    	};
	    	tweens.push(pouch_open_tween);
		}

	    let intro_legos_tween = {
			targets: this.brick_store.bricks, //.slice().reverse(),
			y: -5*LEGO_GRID,
			yoyo: true,
			repeat: 0,
			ease: 'Sine.easeOut',
			duration: 350,
			onStart: function (tween, targets) {
				for (const brick of targets) {
					brick.setDepth(Layers.UNDER_POUCH); // Move bricks on top of background, behind pouch
					brick.resetPosition(); // Reset position if needed
					brick.input.enabled = true;
				}
			},
			onComplete: function () {
				console.log("oncomplete");
				this.pie_meter.visible = true;
				this.pie_meter_text.visible = true;
			    this.timer = this.time.addEvent({
			    	delay: this.run_time*1000,
			    	repeat: 0
			    });
			},
			onCompleteScope: this,
			onYoyo: function (tween, sprite) {
				sprite.setDepth(Layers.OVER_POUCH); // Move bricks on top of pouch
			},
			delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
				return targetIndex * Phaser.Math.Between(0, 150);
			},
    	};
	    tweens.push(intro_legos_tween);

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickKeyZone() {
		this.key_zone.destroy();
		this.tweens.add({
			targets: this.rects.concat([this.rects_background]).concat(this.rects.map(o => o.text)),
			ease: 'Sine.easeIn',
			duration: 1000,
			alpha: 1
		});
	}

	updatePieTimer() {
		if (this.timer !== undefined) {
			let progress_deg = this.timer.getProgress() * 360;
			// console.log(progress_deg);
			this.pie_meter.drawPie(progress_deg);

			let num = this.run_time - (this.timer.getElapsed() / 1000);
			let trimmed_num = num.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
			this.pie_meter_text.setText(`${trimmed_num}`);

			return (progress_deg == 360);
		}

		return false;
	}

	fail() {
		this.brick_fall_tween = this.tweens.add({
			targets: this.brick_store.bricks,
			ease:'Power2',
			duration: 2000,
			y: "+="+GAME_HEIGHT,
			delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
				return targetIndex * Phaser.Math.Between(0, 150);
			},
		});

		this.scene.run(FAIL_ALERT);

		// When do I destroy it??
	}

	succeed() {
		this.sound.play('door_opens_heavy');

		this.time.delayedCall(750, this.doSceneTransition, [], this);
	}

	doSceneTransition() {
		this.emitters.map(e => e.stop());
		this.swirl.visible = true;

		let fadeObjects = [
			...this.brick_store.bricks,
			this.pouch_open,
			...this.rects,
			...this.rects.map(r => r.text),
			this.rects_background,
			this.pie_meter_text,
			this.pie_meter,
			this.background_closed
		];

	    var timeline = this.tweens.timeline({
	    	tweens: [{
	    		targets: fadeObjects,
	    		duration: 2000,
	    		alpha: 0
	    	}]
	    });
	}

}

export default Numbers_Lego;
