import { shuffle } from 'lodash-es';

import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import NumberSentenceImage from '../components/number_sentence_image';

import { NUMBERS_LEGO_BOSS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPics from '../assets/pics/numbers/*.*'
import bossPics from '../assets/pics/numbers/lego_boss/*.*'
import problemsPics from '../assets/pics/numbers/lego_boss/problems/*.jpg'
import audioMp3 from '../assets/audio/*.mp3';

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_Boss extends BaseScene {
	constructor() {
        super(NUMBERS_LEGO_BOSS);
	}

	init() {
		this.correct_answers = [];
	}

	preload() {
		super.preload();

		this.load.image('forge', bossPics.forge.jpg);
        this.load.image('garmadon', numbersPics.garmadon.png);

        // Audio
        this.load.audio('bossfight', audioMp3.bossfight);
        this.load.audio('sorcerer_whodares', audioMp3.sorcerer_whodares);
        this.load.audio('sorcerer_taunt', audioMp3.sorcerer_taunt);
        this.load.audio('sorcerer_defeated', audioMp3.sorcerer_defeated);

		let keys = Object.keys(this.stored_data.items);
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}
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
		this.setupItems();

		this.createGarmadon();
		this.createBoss();
		this.createWeapons();
		this.createTools();

		this.createAudio();

		this.time.delayedCall(4000, this.introGarmadon, [], this);

		this.run_time = 10; // scene timer length
	}

	createAudio() {
		this.background_sound = this.sound.add('bossfight', {volume: .3, loop: true});
	}

	introGarmadon() {
		this.garmadon_emitter.start();

		this.time.delayedCall(1500, this.finishIntroGarmadon, [], this);
	}

	createBackground() {
		this.swirl = {};

		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.background_closed = this.add.image(center_x, center_y, 'forge');
		this.background_closed.setOrigin(0.5, 0.5);
	}

    outlineImage(key, image_data) {
        return new NumberSentenceImage(this, key, image_data);
    }

	setupItems() {
		var y = 30;

		for (const item of shuffle(this.items)) {
			item.alpha = 0;
			item.input.dropZone = true;
			item.y = y;
			y += 70;
		}
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

		let bounds = this.garmadon.getBounds();
	    let particle = this.add.particles('smoke_purple');
	    this.garmadon_emitter = particle.createEmitter({
	    	on: false,
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
	}

	finishIntroGarmadon() {
		this.garmadon_emitter.stop();
		this.garmadon.visible = true;
		this.runAlert(INTRO1_ALERT);
	}

	createBoss() {
		this.sound.play('sorcerer_whodares');
		this.boss = this.add.sprite(900, 200, 'vangelis_boss');

		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNames('vangelis_boss', {prefix: 'vangelis_', start:10, end:31}),
			frameRate: 8,
			repeat: -1
		});

		this.boss.play('idle');

		let gbounds = this.garmadon.getBounds();
	    var line = new Phaser.Geom.Line(this.boss.x, this.boss.y, gbounds.centerX, gbounds.centerY);

		var particles = this.add.particles('flares');
	    this.boss.weaponEmitter = particles.createEmitter({
	    	frame: 'green',
	    	on: false,
	    	speed: 50,
	        scale: { start: 1, end: 0.3 },
	        blendMode: 'ADD',
	        emitZone: { type: 'edge', source: line, quantity: 60 },
	    	emitCallback: this.emitBossParticle,
	    	emitCallbackScope: this
	    });

	    this.boss.destroyEmitter = particles.createEmitter({
	    	on: false,
	        frame: [ 'red', 'blue', 'green', 'yellow' ],
	    	x: this.boss.x,
	    	y: this.boss.y,
	    	speed: 200,
	    	lifespan: 2000,
	    	blendMode: 'ADD'
	    });
	}

	createWeapons() {
		this.weapons = [];
		this.weapon_index = 0;

		this.weapons.push(
			this.add.sprite(500, 100, 'weapons', 'shuriken'),
			this.add.sprite(550, 300, 'weapons', 'scythe'),
			this.add.sprite(750, 420, 'weapons', 'nunchucks'),
			this.add.sprite(1100, 420, 'weapons', 'sword'),
			);

		var particles = this.add.particles('spark');
		for (const w of this.weapons) {
			w.alpha = 0;

		    var line = new Phaser.Geom.Line(w.x, w.y, this.boss.x, this.boss.y);

		    w.emitter = particles.createEmitter({
		    	on: false,
		    	speed: 50,
		        scale: { start: 0.6, end: 0.1 },
		        blendMode: 'ADD',
		        emitZone: { type: 'edge', source: line, quantity: 60 },
		    	emitCallback: this.emitParticle,
		    	emitCallbackScope: this
		    });
   		}
	}

	emitBossParticle(particle, emitter) {
		let ez = emitter.emitZone;

		if (ez.counter == ez.quantity - 1) {
			emitter.stop();
			this.fadeOutGarmadon();
		}
	}

	emitParticle(particle, emitter) {
		let ez = emitter.emitZone;

		if (ez.counter == ez.quantity - 1) {
			emitter.stop();

			if (this.correct_answers.length == this.items.length) {
				// All problems answered correctly
				this.destroyBoss();
			}
		}
	}

	createCallToAction() {
	}

	createTools() {
		this.createToolbar();

		for (const brick of this.brick_store.bricks) {
			brick.setDepth(Layers.OVER_POUCH);
			this.toolbar.add(brick);
		}
	}

	createToolbar() {
		this.toolbar = this.add.container(LEGO_GRID*9, LEGO_GRID*25);
		this.toolbar.setSize(LEGO_GRID*25, LEGO_GRID*5);

		let rectangle = this.add.rectangle(0, 0, LEGO_GRID*25, LEGO_GRID*5, 0x000000);
		rectangle.setOrigin(0, 0);
		rectangle.setStrokeStyle(2, 0xFFD700, 1);

		this.toolbar.add(rectangle);
	}

	clickIntro1Alert() {
		this.stopAlert(INTRO1_ALERT);

        this.sound.play('sorcerer_taunt');

        this.time.delayedCall(12000, this.finishTaunt, [], this);
	}

	finishTaunt() {
		// Boss fires at Garmadon
		this.boss.weaponEmitter.start();
	}

	fadeOutGarmadon() {
        this.background_sound.play();

		var tweens = [
			{ // Fade out Garmadon
				targets: this.garmadon,
				alpha: 0,
				duration: 750
			},
			{ // Slide in toolbar
				targets: this.toolbar,
				y: GAME_HEIGHT - this.toolbar.height,
				duration: 750,
				offset: 0
			},
			{ // Fade in weapons
				targets: [...this.weapons, ...this.items],
				alpha: 1,
				duration: 750,
				offset: 750
			}
		];

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	createBricks() {
		let brick_store = new BrickStore(this, 1, 1, false);

		brick_store.addRow(BSBrick.B1x1, BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x4, BSBrick.B1x5);
		brick_store.addRow(BSBrick.B1x6, BSBrick.B1x7, BSBrick.B1x8);

		return brick_store;
	}

	setupBricks() {
		this.brick_store.layoutBricks();
		this.brick_store.generateBricksArray();

		for (let brick of this.brick_store.bricks) {
			brick.on('dragstart', this.dragStartBrick.bind(this, brick))
				 .on('dragend', this.dragEndBrick.bind(this, brick))
				 .on('drop', (pointer, target) => {
					const bound = this.dropBrick.bind(this, brick, target);
					bound();
				 });
		}

	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.drag_image.x = dragX + gameObject.scene.toolbar.x;
	        gameObject.drag_image.y = dragY + gameObject.scene.toolbar.y;
	    });
	}

	dragStartBrick(dragged_brick) {
		let toolbar = dragged_brick.scene.toolbar;
		let drag_image = dragged_brick.drag_image;

		drag_image.x = dragged_brick.x + toolbar.x;
		drag_image.y = dragged_brick.y + toolbar.y;
		drag_image.visible = true;
	}

	dragEndBrick(dragged_brick) {
		let drag_image = dragged_brick.drag_image;
		drag_image.visible = false;
	}

	dropBrick(brick, target) {
		if (brick.legoTotal == target.info.answer) {
			this.correct_answers.push(target);

			target.revealAnswer();
			this.fireNextWeapon();

			this.tweens.add({
				targets: target,
				alpha: 0,
				duration: 500,
				delay: 1000
			});
		}
	}

	fireNextWeapon() {
		this.weapon_index = (this.weapon_index + 1) % this.weapons.length;

		let w = this.weapons[this.weapon_index];
		w.emitter.start();
	}

	destroyBoss() {
		this.sound.play('sorcerer_defeated');
		this.boss.destroyEmitter.start();
		this.time.delayedCall(2000, this.finishDestroyBoss, [], this);
	}

	finishDestroyBoss() {
		this.boss.visible = false;
		this.boss.destroyEmitter.stop();
		this.overlay.visible = true;
		
		let tweens = [{
			targets: this.overlay,
			alpha: 1,
			duration: 2000,
			onComplete: () => { this.startNextScene() },
			onCompleteScope: this
		},{
			targets: this.background_sound,
			volume: 0,
			duration: 2000,
			offset: 0
		}]

	    var timeline = this.tweens.timeline({ tweens: tweens });
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
				title: "Give me the Skull!",
				content: "",
				buttonText: "Have at you!",
				buttonAction: this.clickIntro1Alert,
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

	startNextScene() {
		this.background_sound.stop();

        this.scene.start(this.nextSceneKey());
        this.scene.shutdown();
	}
}

export default Numbers_Lego_Boss;