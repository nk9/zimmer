import { shuffle, remove } from 'lodash-es';

import Base_Scene, { SceneProgress, Layers } from './Base_Scene';

import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import NumberSentenceImage from '../components/number_sentence_image';
import PieMeter from '../components/pie-meter';

import { NUMBERS_BOSS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME } from '../constants/storage';

const INTRO1_ALERT = 'INTRO1_ALERT';
const INTRO2_ALERT = 'INTRO2_ALERT';
const FAIL_ALERT = 'FAIL_ALERT';


export default class Numbers_Boss extends Base_Scene {
	constructor() {
		super(NUMBERS_BOSS);
	}

	get category() {
		return "Numbers";
	}

	init() {
		this.timer;
		this.correct_answers = [];
		this.ongoingFadeTweens = [];
	}

	preload() {
		super.preload();

        this.load.image('garmadon', this.categoryAssets.garmadon.png)
		this.load.image('forge', this.assets.forge.jpg);
		this.load.image('thanks', this.assets.boss_win.jpg);

		//
		// Audio
		//
		this.load.audio('bossfight', this.assets.bossfight.mp3);

		// Weapons
		this.load.audio('fireball', this.assets.fireball.mp3);
		this.load.audio('rocksmash', this.assets.rocksmash.mp3);
		this.load.audio('iceattack', this.assets.iceattack.mp3);
		this.load.audio('zap', this.assets.zap.mp3);

		// Boss speaking
		this.load.audio('sorcerer_whodares', this.assets.sorcerer_whodares.mp3);
		this.load.audio('sorcerer_taunt', this.assets.sorcerer_taunt.mp3);
		this.load.audio('sorcerer_defeated', this.assets.sorcerer_defeated.mp3);
		this.load.audio('sorcerer_lostcause', this.assets.sorcerer_lostcause.mp3);

		let keys = Object.keys(this.stored_data.items);
		for (const key of keys) {
	        this.loadProblemOutlineImage(key);
		}
	}

	loadProblemOutlineImage(name) {
        this.load.image(name, this.assets.problems[name].jpg);
        this.load.image(name+"_outline", this.assets.problems[name+"_outline"].jpg);
		this.load.image(name+"_answer", this.assets.problems[name+"_answer"].jpg);
	}

	create() {
		super.create();

		this.brick_store = this.createBricks();
		this.setupBricks();
		this.createBackground();
		this.createItems();
		this.resetItems();

		this.createGarmadon();
		this.createBoss();
		this.createWeapons();
		this.createTools();
		this.createCountdownTimer();
		this.createFailOverlay();

		this.createGem({gem: 'diamond'});
		this.createAudio();

		this.time.delayedCall(4000, this.introGarmadon, [], this);

		this.run_time = 30; // scene timer length
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

		this.thanks_image = this.add.image(center_x, center_y, 'thanks');
		this.thanks_image.depth = Layers.TRANSITION;
		this.thanks_image.visible = false;
	}

    createFailOverlay() {
        this.fail_overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0xffffff);
        this.fail_overlay.setOrigin(0, 0);
        this.fail_overlay.setDepth(Layers.OVERLAY);
        this.fail_overlay.alpha = 0;
        this.fail_overlay.visible = false;
    }

	outlineImage(key, image_data) {
		return new NumberSentenceImage(this, key, image_data);
	}

	resetItems(showItems=false) {
		var y = 30;

		for (const item of shuffle(this.items)) {
			item.reset();
			item.alpha = showItems ? 1 : 0;
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

		this.weapons = [
			this.createShuriken(),
			this.createScythe(),
			this.createNunchucks(),
			this.createSword(),
		];

		for (const w of this.weapons) {
			w.alpha = 0;
		}
	}

	// Shuriken of ice
	createShuriken() {
		let w = this.add.sprite(500, 100, 'weapons', 'shuriken');

		var particles = this.add.particles('flares');
		var line = new Phaser.Geom.Line(w.x, w.y, this.boss.x, this.boss.y);

		w.emitter = particles.createEmitter({
			frame: 'blue',
			on: false,
			speed: 50,
			scale: { start: 1, end: 0.3 },
			blendMode: 'ADD',
			emitZone: { type: 'edge', source: line, quantity: 20 },
			emitCallback: this.emitParticle,
			emitCallbackScope: this
		});
		w.sound = this.sound.add('iceattack');

		return w;
	}

	// Scythe of quakes
	createScythe() {
		let w = this.add.sprite(550, 300, 'weapons', 'scythe');
		this.weapons.push(w);

		let particles = this.add.particles('stone');
		let line = new Phaser.Geom.Line(w.x, w.y, this.boss.x, this.boss.y);

		w.emitter = particles.createEmitter({
			on: false,
			speed: { min: 30, max: 60 },
			alpha: { start: 1, end: 0 },
			scale: { start: 0.5, end: 0.1 },
			// rotate: { start: 0, end: 360, ease: 'Back.easeOut' },
			emitZone: { type: 'edge', source: line, quantity: 20 },
			emitCallback: this.emitParticle,
			emitCallbackScope: this
		});
		w.sound = this.sound.add('rocksmash');

		return w;
	}

	// Nunchucks of lightning
	createNunchucks() {
		let w = this.add.sprite(750, 420, 'weapons', 'nunchucks');

		let particles = this.add.particles('flares');
		let line = new Phaser.Geom.Line(w.x, w.y, this.boss.x, this.boss.y);

		w.emitter = particles.createEmitter({
			frame: 'white',
			on: false,
			speed: 50,
			scale: { start: 1, end: 0.3 },
			blendMode: 'ADD',
			emitZone: { type: 'edge', source: line, quantity: 20 },
			emitCallback: this.emitParticle,
			emitCallbackScope: this
		});
		w.sound = this.sound.add('zap');

		return w;
	}

	// Sword of fire
	createSword() {
		let w = this.add.sprite(1100, 420, 'weapons', 'sword');

		let particles = this.add.particles('flares');
		var line = new Phaser.Geom.Line(w.x, w.y, this.boss.x, this.boss.y);

		w.emitter = particles.createEmitter({
			frame: 'red',
			on: false,
			speed: 50,
			scale: { start: 1, end: 0.3 },
			blendMode: 'ADD',
			emitZone: { type: 'edge', source: line, quantity: 20 },
			emitCallback: this.emitParticle,
			emitCallbackScope: this
		});
		w.sound = this.sound.add('fireball');

		return w;
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

	createCountdownTimer() {
		let diameter = 30;

	    this.pie_meter = new PieMeter(this, GAME_WIDTH-100, GAME_HEIGHT-90, diameter, 0, 1);
	    this.pie_meter.visible = false;

	    this.pie_meter.text = this.add.text(this.pie_meter.x, this.pie_meter.y+diameter+10, `0.00`,
	    	{fill: "#fff", fontSize: `20pt`});
	    this.pie_meter.text.visible = false;
	    this.pie_meter.text.setOrigin(0.5, 0);
	}

	update() {
		this.updatePieTimer();
	}

	beginPieTimer() {
		this.pie_meter.visible = true;
		this.pie_meter.text.visible = true;
		this.timer = this.time.addEvent({
			delay: this.run_time*1000,
			repeat: 0,
			callback: this.fail,
			callbackScope: this
		});
	}

	updatePieTimer() {
		if (this.timer !== undefined) {
			let progress_deg = this.timer.getProgress() * 360;
			this.pie_meter.drawPie(progress_deg);

			let num = this.run_time - (this.timer.getElapsed() / 1000);
			let trimmed_num = num.toLocaleString("en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
			this.pie_meter.text.setText(`${trimmed_num}`);

			return (progress_deg == 360);
		}

		return false;
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
				offset: 750,
				onComplete: () => { this.beginPieTimer() },
				onCompleteScope: this
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

			let t = this.tweens.add({
				targets: target,
				alpha: 0,
				duration: 500,
				delay: 1000,
				onComplete: this.finishDropBrickTween,
				onCompleteScope: this
			});
			this.ongoingFadeTweens.push(t);
		}
	}

	finishDropBrickTween(tween) {
		remove(this.ongoingFadeTweens, tween);
	}

	fireNextWeapon() {
		let w = this.weapons[this.weapon_index];
		w.emitter.start();
		w.sound.play();

		this.weapon_index = (this.weapon_index + 1) % this.weapons.length;
	}

	destroyBoss() {
		this.handleGemClicked(this.boss);
		this.sound.play('sorcerer_defeated');
		this.timer.remove();
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
			onComplete: () => { this.showThanks() },
			onCompleteScope: this
		},{
			targets: this.background_sound,
			volume: 0,
			duration: 2000,
			offset: 0
		}];

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
				content: "I’ve finally found you. I will have its power!",
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
		this.sound.play('sorcerer_lostcause');
		this.fail_overlay.visible = true;

		let tweens = [{
			targets: this.fail_overlay,
			alpha: 1,
			duration: 1500,
			yoyo: true,
			onYoyo: this.resetAfterFail,
			onYoyoScope: this,
			onComplete: this.completeFailReset,
			onCompleteScope: this
		}]

		var timeline = this.tweens.timeline({ tweens: tweens });
	}

	resetAfterFail() {
		// Clear any alerts
    	for (const key of this.alert_keys) {
        	this.scene.stop(key);
    	}

    	for (const t of this.ongoingFadeTweens) {
    		t.stop();
    	}

    	this.ongoingFadeTweens = [];
    	this.correct_answers = [];

		this.resetItems(true);
	}

	completeFailReset() {
		this.beginPieTimer();
		this.fail_overlay.visible = false;
	}


	showThanks() {
		this.background_sound.stop();

		this.thanks_image.visible = true;

		let thanks_style = {
            fontFamily: 'ninjago',
            fill: '#fff',
            fontSize: '45pt',
            align: 'center',
            lineSpacing: 18
		};

		let name = this.game.config.storage.get(FLAVOR_NAME);
		let thanks_string = `Thanks ${name}\nWe could not have done\nit without you`;
	    let thanks_text = this.add.text(GAME_WIDTH/2, GAME_HEIGHT-55, thanks_string, thanks_style);
	    thanks_text.setOrigin(0.5, 1);
	    thanks_text.setDepth(Layers.TRANSITION_TEXT);

		this.tweens.add({
			targets: this.overlay,
			alpha: 0,
			duration: 750,
			onComplete: () => { this.overlay.visible = false },
			onCompleteScope: this
		})
	}
}
