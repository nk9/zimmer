import BaseScene, { SceneProgress, Layers } from './base-scene';
import { DRAG_THRESHOLD, GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import PieMeter from '../components/pie-meter';
import Alert from '../components/alert';

const FAIL_ALERT = 'FailAlert';

class Numbers_Lego extends BaseScene {
    constructor(key) {
        super(key);
    }

	create() {
    	console.log('create Numbers_Lego');
        // super.create('a', 'b', true);

        // OVERRIDE THESE
		this.run_time = 30; // scene timer length

		// Variables
		this.rects = [];
		this.emitters = [];
		this.timer;
		this.pie_meter;

	    this.brick_store = this.createBricks();
	    this.setupBricks();
		this.createBackground();
		this.createRectangles();

		let [cta_closed, cta_closed_outlined, cta_closed_zone] = this.createCallToAction();

	    cta_closed_zone.setInteractive({useHandCursor: true})
	    	.on('pointerover', () => {
	    		if (cta_closed.visible) {
		    		cta_closed.setVisible(false);
		    		cta_closed_outlined.setVisible(true);
		    	}
	    	})
	    	.on('pointerout', () => {
	    		if (!cta_closed.visible) {
		    		cta_closed.setVisible(true);
		    		cta_closed_outlined.setVisible(false);
		    	}
	    	})
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					cta_closed.destroy();
					cta_closed_outlined.destroy();

					this.clickCallToAction()
					cta_closed_zone.destroy();
				}
			});

		let keyZoneRect = this.keyZoneRect()
		// let debug = this.add.rectangle(keyZoneRect.x, keyZoneRect.y, keyZoneRect.width, keyZoneRect.height, 0xff0000)
		// 			.setOrigin(0,0);
		this.key_zone = this.make.zone(keyZoneRect)
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

	    let alert_keys = this.createAlerts();

        this.events.on('transitionstart', function(fromScene, duration){
        	for (const key of alert_keys) {
	        	fromScene.scene.remove(key);
        	}
        });

	}

	resetAfterFail() {
		this.scene.stop(FAIL_ALERT); // clear alert

		this.pie_meter.visible = false;
		this.pie_meter.text.visible = false;
		this.timer = undefined;
		this.brick_fall_tween.stop();

		this.clickCallToAction(false);
		this.progress = SceneProgress.BEGIN;
	}

	update() {
		var completedRects = [];

		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;

		// Before the scene is complete (one way or the other), do update work
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
	}

	createBackground() {
		this.underlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
		this.underlay.setOrigin(0,0);

		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'aqua_swirl');
		this.swirl.scale += .1; // Aqua swirl isn't quite large enough to fill the space
		this.swirl.visible = false;

		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
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
	    this.pie_meter.text = this.add.text(120, 160, `0.00`,
	    	{fill: "#fff", fontSize: `20pt`});
	    this.pie_meter.text.visible = false;
	    this.pie_meter.text.setOrigin(0.5, 0);
	}

	createBricks() {
		let brick_store = new BrickStore(this, 29, 6);

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x2);
		brick_store.addRow(BSBrick.B2x4);
		brick_store.addRow(BSBrick.B2x2, BSBrick.B2x3, BSBrick.B2x2);
		brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);
		brick_store.addRow(BSBrick.B1x2);
		brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);

		return brick_store;
	}

	setupBricks() {
		this.brick_store.shuffle();

		for (var brick of this.brick_store.bricks) {
			brick.setInteractive().on('pointerdown', this.dragBrick.bind(this, brick));

			// Make sure bricks don't respond to input until they enter the scene
			brick.input.enabled = false;
		}
	}

	dragBrick(dragged_brick) {
		for (const brick of this.brick_store.bricks) {
			if (brick == dragged_brick) {
				brick.setDepth(Layers.DRAGGING);
			} else {
				brick.setDepth(Layers.OVER_POUCH);
			}
		}
	}

	keyZoneRect() {
		return {x: 550, y: 330, width: 60, height: 120};
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

	callToActionRect() {
		return {x: 800, y: 600, width: 40, height: 64};
	}

	createCallToAction() {
		let cta_rect = this.callToActionRect();
	    let cta_closed = this.add.image(cta_rect.x, cta_rect.y, 'pouch_closed');
	    let cta_closed_outlined = this.add.image(cta_rect.x, cta_rect.y, 'pouch_closed_outlined');
	    let cta_closed_zone = this.add.zone(cta_rect.x, cta_rect.y, cta_rect.width, cta_rect.height)

	    cta_closed.scale = .2;
	    cta_closed_outlined.scale = .2;
	    cta_closed.setVisible(true);
	    cta_closed_outlined.setVisible(false);

	    this.pouch_open = this.add.image(cta_closed_zone.x, cta_closed_zone.y, 'pouch_open');
	    this.pouch_open.scale = 0.1;
	    this.pouch_open.visible = false;

	    return [cta_closed, cta_closed_outlined, cta_closed_zone];
	}

	createAlerts() {
		this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
			title: "Whoops",
			content: "You're gonna have to be faster than that!",
			buttonText: "Try Again",
			buttonAction: this.resetAfterFail,
			context: this
		});

		return [FAIL_ALERT];
	}

	clickCallToAction(should_animate_open = true) {
		var tweens = [];

		if (should_animate_open) {
			this.pouch_open.visible = true;

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
			targets: this.brick_store.bricks.slice().reverse(),
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
				this.pie_meter.visible = true;
				this.pie_meter.text.visible = true;
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
			this.pie_meter.text.setText(`${trimmed_num}`);

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
			this.pie_meter.text,
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
