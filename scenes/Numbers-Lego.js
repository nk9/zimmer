import BaseScene, { SceneProgress, Layers } from './base-scene';
import { DRAG_THRESHOLD, GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import PieMeter from '../components/pie-meter';

import numbersPicPng from '../assets/pics/numbers/*.png';


// Abstract class!
class Numbers_Lego extends BaseScene {
	preload() {
        this.load.image('pouch_open', numbersPicPng.pouch_open)
        this.load.image('pouch_closed', numbersPicPng.pouch_closed_small)
        this.load.image('pouch_closed_outlined', numbersPicPng.pouch_closed_small_outlined)
	}

	create() {
		super.create();
		
        // OVERRIDE THESE
		this.run_time = 1; // scene timer length

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

	    this.pouch_open = this.add.image(cta_closed_zone.x, cta_closed_zone.y, 'pouch_open');
	    this.pouch_open.scale = 0.1;
	    this.pouch_open.visible = false;

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

		this.createKeyZone();
		this.createCountdownTimer();

		this.portal_sound = this.sound.add('portal');
	}

	resetAfterFail() {
		// Clear any alerts
    	for (const key of this.alert_keys) {
        	this.scene.stop(key);
    	}

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
				let rect = this.rects[i];
				let r = rect.getBounds();
				var containedBricks = [];
				
				for (const brick of this.brick_store.bricks) {
					let br = brick.getBounds();

					let intersection = Phaser.Geom.Rectangle.Intersection(r, br);

					if (Phaser.Geom.Rectangle.Equals(intersection, br)) {
						console.log(`brick (${brick.legoTotal}) is inside rect ${i}`);
						containedBricks.push(brick);
					}
				}

				var emit = false;
				if (containedBricks.length == 2 && rect.brick_count == 2) {
					let brick1 = containedBricks[0],
						brick2 = containedBricks[1];
					let intersection = Phaser.Geom.Rectangle.Intersection(brick1.getBounds(),
																		  brick2.getBounds());
					if (intersection.isEmpty() && (brick1.legoTotal + brick2.legoTotal) == rect.legoTotal) {
						emit = true;
						completedRects.push(rect);
					}
				} else if (containedBricks.length == 1 && rect.brick_count == 1) {
					emit = true;
					completedRects.push(rect);
				}
				
				if (emit && !this.emitters[i].on) {
					this.emitters[i].start();
				} else if (!emit && this.emitters[i].on) {
					this.emitters[i].stop();
				}
			}

			if (completedRects.length == this.rects.length) {
				this.progress = SceneProgress.SUCCEEDED;
				this.succeed();
			}

			if (this.updatePieTimer()) {
				this.progress = SceneProgress.FAILED;
				this.fail();
			}
		}
	}

	createCountdownTimer() {
	    this.pie_meter = new PieMeter(this, 120, 120, 30, 0, 1);
	    this.pie_meter.visible = false;
	    this.pie_meter.text = this.add.text(120, 160, `0.00`,
	    	{fill: "#fff", fontSize: `20pt`});
	    this.pie_meter.text.visible = false;
	    this.pie_meter.text.setOrigin(0.5, 0);
	}

	createBackground() {
		this.underlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
		this.underlay.setOrigin(0,0);

		this.createBackgroundImages();
		this.swirl.visible = false;

		let bg_bounds = this.background_closed.getBounds();
		let underlay_bounds = this.underlay.getBounds();

		// Add screens if needed
		if (!Phaser.Geom.Rectangle.Equals(bg_bounds, underlay_bounds)) {
			let left_screen  = this.add.rectangle(0,
												   0,
												   bg_bounds.x,
												   GAME_HEIGHT,
												   0x000000);
			let right_screen = this.add.rectangle(bg_bounds.right,
												   0,
												   GAME_WIDTH-bg_bounds.right,
												   GAME_HEIGHT,
												   0x000000);
			left_screen.setOrigin(0, 0);
			right_screen.setOrigin(0, 0);
		}
	}

	setupBricks() {
		this.brick_store.shuffle();

		for (var brick of this.brick_store.bricks) {
			brick.on('pointerdown', this.dragBrick.bind(this, brick));

			// Make sure bricks don't respond to input until they enter the scene
			brick.input.enabled = false;
		}

	    // this.input.dragDistanceThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });
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

	disableBrickDragging() {
		for (const brick of this.brick_store.bricks) {
			brick.input.enabled = false;
		}
	}

	addRectangle(w, h, x, y, brick_count=2) {
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
		rect.brick_count = brick_count;
		rect.legoTotal = w*h;

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

	clickCallToAction(should_animate_open = true) {
		var tweens = [];

		if (should_animate_open) {
			this.pouch_open.visible = true;
			let pouch_position = this.pouchOpenPosition();

		    let pouch_open_tween = {
				targets: [this.pouch_open],
				scale: .8,
				x: pouch_position.x,
				y: pouch_position.y,
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
			y: -5*LEGO_GRID, // Just above the top of the screen
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

	createKeyZone() {
		let keyZoneRect = this.keyZoneRect();

		this.key_zone = this.make.zone(keyZoneRect)
			.setOrigin(0,0)
			.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => {
				this.clickKeyZone()
			});
		// this.input.enableDebug(this.key_zone, 0xff0000);
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
		this.emitters.map(e => e.stop());

		this.brick_fall_tween = this.tweens.add({
			targets: this.brick_store.bricks,
			ease:'Power2',
			duration: 2000,
			y: "+="+GAME_HEIGHT,
			delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
				return targetIndex * Phaser.Math.Between(0, 150);
			},
		});
	}

	succeed() {
		this.disableBrickDragging();
		this.sound.play('door_opens_heavy');

		this.time.delayedCall(750, this.doSuccessTransition, [], this);
	}

	doSuccessTransition() {
		this.portal_sound.play();
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
	    		alpha: 0,
	    	}]
	    });

	    this.time.delayedCall(5000, this.startNextScene, [], this);
	}

	startNextScene(key=null) {
		if (!key) {
			key = this.nextSceneKey();
		}

		this.portal_sound.stop();
		// this.background_sound.stop();
		this.willStartNextScene();
		
        this.scene.start(key);
        this.scene.shutdown();
	}

	// Overridden by subclasses to clean up before the next scene
	willStartNextScene() {
	}
}

export default Numbers_Lego;
