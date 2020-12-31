import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_BOSS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPics from '../assets/pics/numbers/*.*'
import bossPics from '../assets/pics/numbers/lego_boss/*.*'
import problemsPics from '../assets/pics/numbers/lego_boss/problems/*.jpg'

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_Boss extends BaseScene {
	constructor() {
        super(NUMBERS_LEGO_BOSS);
	}

	preload() {
		super.preload();

		this.load.image('forge', bossPics.forge.jpg);
        this.load.image('garmadon', numbersPics.garmadon.png);
	}

	loadOutlineImage(name) {
		this.load.image(name, problemsPics[name]);
		this.load.image(name+"_outline", problemsPics[name+"_outline"]);
		this.load.image(name+"_answer", problemsPics[name+"_answer"]);
	}

	create() {
		super.create();

	    this.brick_store = this.createBricks();
	    this.setupBricks();
		this.createBackground();
		this.createItems();

		this.createGarmadon();
		this.createBoss();
		this.createWeapons();
		this.createTools();

		this.run_time = 10; // scene timer length
	}

	createBackground() {
		this.swirl = {};

		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.background_closed = this.add.image(center_x, center_y, 'forge');
		this.background_closed.setOrigin(0.5, 0.5);
	}

	garmadonPosition() {
		return {x: 150, y: 400};
	}

	createGarmadon() {
		this.sound.play('woosh_long');
		
		// The man himself
		let gpos = this.garmadonPosition();
		this.garmadon = this.add.image(gpos.x, gpos.y, 'garmadon');
		this.garmadon.scale = .5;
		this.garmadon.setOrigin(.5, 1);
		this.garmadon.setTint(0xaaaaaa);
		this.garmadon.visible = false;

		this.garmadon.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.garmadon.clearTint() })
			.on('pointerout', () => {
				if (this.garmadon.input.enabled) {
					this.garmadon.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickGarmadon() });

		let bounds = this.garmadon.getBounds();
	    let particle = this.add.particles('smoke_purple');
	    this.emitter = particle.createEmitter({
	        blendMode: 'SCREEN',
	        scale: { start: 1, end: 2 },
	        speed: { min: -100, max: 100 },
	        quantity: 5,
	        emitZone: {
		        source: new Phaser.Geom.Triangle(bounds.left, bounds.top, bounds.right, bounds.top, bounds.centerX, bounds.bottom),
		        type: 'random',
		        quantity: 20
	        },
	        lifespan: 300
	    });
		// particle.setDepth(Layers.OVER_DOOR);

		this.time.delayedCall(1500, this.clearSmoke, [], this);
	}

	createBoss() {
		let boss = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, 'vangelis_boss');

		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNames('vangelis_boss', {prefix: 'vangelis_', start:10, end:31}),
			frameRate: 10,
			repeat: -1
		});

		boss.play('idle');
	}

	createWeapons() {
		this.weapons = [];


	}

	createCallToAction() {
	}

	createTools() {
		this.createToolbar();

		for (const brick of this.brick_store.bricks) {
			brick.setDepth(Layers.OVER_POUCH);
		}
	}

	createToolbar() {
		this.toolbar = this.add.container(LEGO_GRID*9, LEGO_GRID*18);
		this.toolbar.setSize(LEGO_GRID*25, LEGO_GRID*5);

		let rectangle = this.add.rectangle(0, 0, LEGO_GRID*25, LEGO_GRID*5, 0x000000);
		rectangle.setOrigin(0, 0);
		rectangle.setStrokeStyle(2, 0xFFD700, 1);

		this.toolbar.add(rectangle);
	}

	clearSmoke() {
		this.emitter.stop();
		this.garmadon.visible = true;
	}

	clickGarmadon() {
		this.runAlert(INTRO1_ALERT);
	}

	clickIntro1Alert() {
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	clickIntro2Alert() {
		this.stopAlert(INTRO2_ALERT);

		this.tweens.add({
			targets: this.garmadon,
			alpha: 0,
			duration: 750
		})
	}

	createBricks() {
		let brick_store = new BrickStore(this, 10, 19, false);

		brick_store.addRow(BSBrick.B1x1, BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x4, BSBrick.B1x5);
		brick_store.addRow(BSBrick.B1x6, BSBrick.B1x7, BSBrick.B1x8);

		return brick_store;
	}

	setupBricks() {
		this.brick_store.layoutBricks();

		for (var brick of this.brick_store.bricks) {
			brick.on('dragstart', this.dragStartBrick.bind(this, brick))
				 .on('dragend', this.dragEndBrick.bind(this, brick))

			// Make sure bricks don't respond to input until they enter the scene
			// brick.input.enabled = false;
		}

	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.drag_image.x = dragX;
	        gameObject.drag_image.y = dragY;
	    });
	}

	dragStartBrick(dragged_brick) {
		let drag_image = dragged_brick.drag_image;
		drag_image.x = dragged_brick.x;
		drag_image.y = dragged_brick.y;
		drag_image.visible = true;
	}

	dragEndBrick(dragged_brick) {
		let drag_image = dragged_brick.drag_image;
		drag_image.visible = false;
	}

	keyZoneRect() {
		return {x: 0, y: 0, width: 0, height: 0};
	}

	pouchOpenPosition() {
		return {x: 0, y: 0};
	}

	createRectangles() {
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Hahaha!",
				content: "I will have the power of the Skull of Hazza D’ur!",
				buttonText: "As If!",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "You won't find the key!",
				content: "And how will you know what shape of key you need? By clicking on the keyhole? Hahahaha! ",
				buttonText: "By clicking?",
				buttonAction: this.clickIntro2Alert,
				context: this
			},
			[FAIL_ALERT]: {
				title: "Whoops",
				content: "I need to find the right pieces faster next time!",
				buttonText: "Try Again",
				buttonAction: this.resetAfterFail,
				context: this
			},
		};

		return alerts;
	}

	fail() {
		super.fail();

		this.scene.run(FAIL_ALERT);
	}
}

export default Numbers_Lego_Boss;