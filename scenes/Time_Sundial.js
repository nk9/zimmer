import log from 'loglevel';

import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_SUNDIAL, TIME_BEDROOM } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME } from '../constants/storage';

import OutlineTimeClock from '../components/outline_time_clock';
import OutlineImage from '../components/outline_image';

import Time_Base, { SelectionMode } from './Time_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let FAIL_ALERT = 'FAIL_ALERT';

export default class Time_Sundial extends Time_Base {
	constructor() {
		super(TIME_SUNDIAL);

		// initialize variables
		this.scan_limit = 5;
	}

    nextSceneKey() {
        return TIME_BEDROOM;
    }

	preload() {
		super.preload();

		// Images
		this.load.image('clock_field', this.assets.background.jpg);
		this.load.video('sundial', this.assets.sundial.webm);
	    this.loadOutlineImage('house');

 		// Audio
 		this.load.audio('background_sundial', this.assets.sundial_foley.mp3);
 		this.load.audio('grandfather', this.assets.grandfatherclock.mp3);
 		this.load.audio('tornado', this.assets.tornado.mp3);

		this.clocks_data = this.stored_data.clocks;

        // Clocks
		let keys = Object.keys(this.clocks_data);
		for (const key of keys) {
		    this.loadOutlineImage(key);
	        this.load.image(key+"_solved", this.assets[key+"_solved"].png);	    
		}
	}

	create() {
		super.create();

		this.setClocksInput(false); // Start with the clocks not being clickable
		this.createSundial();

		// Useful for testing the tornado without completing the level
		// this.startTornado();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'blue_swirl');

		this.background_closed = this.add.image(0, 0, 'clock_field');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_sundial', {volume: .4, loop: true});
		this.grandfather_sound = this.sound.add('grandfather', {volume: .4});
		this.tornado_sound = this.sound.add('tornado', {volume: .6});
	}

	createCallToAction() {
		this.items_dict['pedestal'].input.enabled = false;

		this.halt = this.add.sprite(0-300, GAME_HEIGHT, 'halt', 'tired');
		this.halt.setOrigin(1, 1);
		this.halt.setTint(0xaaaaaa);

		this.halt.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.halt.clearTint() })
			.on('pointerout', () => {
				if (this.halt.input.enabled) {
					this.halt.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickedHalt() });

		var tweens = [];

		tweens.push({
			targets: this.halt,
			x: this.halt.width,
			ease: 'Sine.easeOut',
			duration: 2500,
			delay: 1000
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	createClocks() {
		for (const key in this.clocks_data) {
			const cd = this.clocks_data[key];

			let clock = new OutlineTimeClock(this, key, cd);
			clock.on('pointerup', this.clickedClock.bind(this, clock));

			this.clocks.push(clock);
		}
	}

	createSundial() {
		this.video = this.add.video(GAME_WIDTH, GAME_HEIGHT, 'sundial');
		this.video.setVisible(false);
		this.video.setOrigin(1, 0); // Off-screen to start with
		this.video.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => { this.clickedVideo() });
	}

	clickedItem(clicked_object) {
		switch(clicked_object.name) {
			case 'pedestal': this.clickCallToAction(); break;
		}
	}

	clickedClock(clock) {
		let diff = Math.abs(clock.progress - this.video.getProgress());

		if (diff <= .02) {
			log.debug(`got it: ${diff}`);
	        clock.input.enabled = false;
			this.success_clocks.push(clock);
	        clock.markSolved();

	        if (this.success_clocks.length == this.clocks.length) {
	        	this.allClocksMatched();
	        } else {
		        this.sound.playAudioSprite('chimes', "tada");
	        }
		} else {
			let clock_num = clock.name.substring(5);
			this.sound.playAudioSprite('chimes', clock_num);
		}
	}

	clickedVideo() {
		if (this.video.isPlaying()) {
			this.video.stop();
			this.setClocksInput(true);
			log.debug("progress: ", this.video.getProgress());
		} else {
			this.video.play(true); // Loop video playback
			this.setClocksInput(false);
		}
	}

	clickCallToAction() {
		if (this.video.visible) {
			this.setItemsInput(false);
			this.video.input.enabled = false;

			this.tweens.add({
				targets: this.video,
				duration: 1000,
				ease: 'Sine',
				y: `+=${this.video.height}`,
				onComplete: () => {
					this.setItemsInput(true);
					this.video.stop();
					this.video.setVisible(false);
					this.setClocksInput(false);
				},
				onCompleteScope: this
			});

		} else {
			this.setItemsInput(false);
			this.video.setVisible(true);
			this.video.play(true); // Loop video playback

			this.tweens.add({
				targets: this.video,
				duration: 1000,
				ease: 'Sine',
				y: `-=${this.video.height}`,
				onComplete: () => {
					this.setItemsInput(true);
					this.video.input.enabled = true;
				},
				onCompleteScope: this
			});
		}
		

	}

	clickedHalt() {
		this.runAlert(INTRO1_ALERT);
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
			[INTRO1_ALERT]: {
				title: "I’ve been walking for ages!",
				content: "There’s a path here, but no matter how far I walk I don’t seem to be able to get anywhere. I think I’m missing something to do with these clocks.",
				buttonText: "I’ll have a look",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Wow, what a racket!",
				content: "That didn’t happen before. Let’s see if we can get somewhere now.",
				buttonText: "Let’s go!",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	intro1AlertClicked() {
		this.halt.setFrame('neutral');
		this.stopAlert(INTRO1_ALERT);

		this.tweens.add({
			delay: 500,
			targets: this.halt,
			x: 0,
			ease: 'Sine',
			duration: 1500,
			onComplete: () => { this.items_dict['pedestal'].input.enabled = true; },
			onCompleteScope: this
		});
	}

	allClocksMatched() {
    	this.grandfather_sound.play();

		this.halt.input.enabled = false;
		this.tweens.add({
			targets: this.halt,
			x: this.halt.width,
			ease: 'Sine.easeOut',
			duration: 1000,
			delay: 1500,
			onComplete: () => { this.runAlert(SUCCESS_ALERT); },
			onCompleteScope: this
		});
	}

	successAlertClicked() {
		log.debug("successAlertClicked")
		this.stopAlert(SUCCESS_ALERT);

		var tweens = [];

		tweens.push({
			targets: this.halt,
			x: 0,
			ease: 'Sine.easeOut',
			duration: 1000
		},{
			targets: this.video,
			y: GAME_HEIGHT,
			ease: 'Sine.easeOut',
			duration: 1000,
			offset: 0
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });

		this.startTornado();
	}

	startTornado() {
		this.tornado_sound.play();

		let bounds = new Phaser.Geom.Rectangle(250, 300, 175, 200);
	    let particle = this.add.particles('smoke');

	    this.emitter = particle.createEmitter({
	        blendMode: 'SOFT_LIGHT',
	        scale: { start: 0.2, end: 0.5 },
	        speed: { min: -100, max: 100 },
	        quantity: 5,
	        emitZone: {
		        source: new Phaser.Geom.Triangle(bounds.left, bounds.top, bounds.right, bounds.top, bounds.centerX, bounds.bottom),
		        type: 'random',
		        quantity: 35
	        },
	        lifespan: 300
	    });

		var path = new Phaser.Curves.Path(this.cache.json.get('house_path'));

		// Add to show the path the house will take
	    // var graphics = this.add.graphics().lineStyle(1, 0x2d2d2d, 1);
	    // path.draw(graphics);

	    this.follower = this.add.follower(path, 0, 0, 'house');
		this.follower.startFollow({
			duration: 7000,
			positionOnPath: true,
			ease: 'Linear',
	        rotateToPath: true,
		});

		this.time.delayedCall(7000, this.stopTornado, [], this);
	}

	stopTornado() {
		this.emitter.stop();
		this.follower.visible = false;
		let bounds = this.follower.getBounds();
		this.house = new OutlineImage(this, 'house', bounds.centerX, bounds.centerY);
		// this.house.input.cursor = 'pointer';
		// this.house.input.on('pointerup', )
		this.house.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => { this.beginSuccessTransition() });
	}

	willBeginSuccessTransition() {
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}
