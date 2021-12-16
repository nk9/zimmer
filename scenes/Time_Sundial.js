import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_SUNDIAL } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME } from '../constants/storage';

import OutlineTimeClock from '../components/outline_time_clock';

import Time_Base, { SelectionMode } from './Time_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let FAIL_ALERT = 'FAIL_ALERT';

export default class Time_Sundial extends Time_Base {
	constructor() {
		super(TIME_SUNDIAL);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('clock_field', this.assets.background.jpg);
		this.load.video('sundial', this.assets.sundial.webm);

 		// Audio
 		this.load.audio('background_sundial', this.assets.sundial_foley.mp3);

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
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'navy_swirl');

		this.background_closed = this.add.image(0, 0, 'clock_field');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_sundial', {volume: .4, loop: true});
	}

	createCallToAction() {
		this.video = this.add.video(GAME_WIDTH, GAME_HEIGHT, 'sundial');
		this.video.setVisible(false);
		this.video.setOrigin(1, 0); // Off-screen to start with

		this.video.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => { this.clickedVideo() });
	}

	createClocks() {
		for (const key in this.clocks_data) {
			const cd = this.clocks_data[key];

			let clock = new OutlineTimeClock(this, key, cd);
			clock.on('pointerup', this.clickedClock.bind(this, clock));

			this.clocks.push(clock);
		}
	}

	clickedItem(clicked_object) {
		switch(clicked_object.name) {
			case 'pedestal': this.clickCallToAction(); break;
		}
	}

	clickedClock(clock) {
		let diff = Math.abs(clock.progress - this.video.getProgress());

		if (diff <= .02) {
			console.log(`got it: ${diff}`);
	        clock.input.enabled = false;
			this.success_clocks.push(clock);
	        this.sound.playAudioSprite('chimes', "tada");
	        clock.markSolved();
		} else {
			let clock_num = clock.name.substring(5);
			this.sound.playAudioSprite('chimes', clock_num);
		}
	}

	clickedVideo() {
		if (this.video.isPlaying()) {
			this.video.stop();
			this.setClocksInput(true);
			console.log("progress: ", this.video.getProgress());
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

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
		};

		return alerts;
	}

// 	intro1AlertClicked() {
// 		this.kratts.setFrame('determined');
// 		this.stopAlert(INTRO1_ALERT);
// 		this.runAlert(INTRO2_ALERT);
// 	}
// 	intro2AlertClicked() {
// 		this.kratts.setFrame('normal');
// 		this.stopAlert(INTRO2_ALERT);
// 		this.runAlert(INTRO3_ALERT);
// 	}
// 	intro3AlertClicked() {
// 		this.kratts.setFrame('normal');
// 		this.stopAlert(INTRO3_ALERT);
// 		this.runAlert(INTRO4_ALERT);
// 	}
// 	intro4AlertClicked() {
// 		this.kratts.setFrame('thumbs');
// 		this.stopAlert(INTRO4_ALERT);
// 
// 		if (!this.animals_have_entered) {
// 			var tweens = [];
// 
// 			// Animate in animals
// 			for (const animal of this.animals) {
// 				tweens.push({
// 					targets: animal,
// 					x: animal.targetX,
// 					y: animal.targetY,
// 					ease: 'Sine.easeOut',
// 					duration: 2000,
// 					offset: 0 // All at once
// 				})
// 			}
// 
// 			tweens.push({
// 				targets: this.kratts,
// 				y: GAME_HEIGHT+350,
// 				ease: 'Sine',
// 				duration: 2000,
// 				offset: 0
// 			});
// 
// 	    	this.tweens.timeline({ tweens: tweens });
// 
// 			// Animate in tools
// 			this.revealTools();
// 
// 			this.animals_have_entered = true;
// 		}
// 	}

	willBeginSuccessTransition() {
		// this.tweens.add({
		// 	targets: this.kratts,
		// 	y: GAME_HEIGHT,
		// 	ease: 'Sine',
		// 	duration: 2000,
		// 	onComplete: () => {this.runAlert(SUCCESS_ALERT);},
		// 	onCompleteScope: this
		// });
	}

	doSuccessTransition() {
	}


	successAlertClicked() {
// 		this.kratts_christmas.play();
// 		this.stopAlert(SUCCESS_ALERT);
// 		this.party.visible = true;
// 		this.overlay.visible = true;
// 
// 	    var timeline = this.tweens.timeline({
// 	    	tweens: [{
// 				targets: this.party,
// 				scale: 1,
// 				angle: 0,
// 				duration: 12000,
// 			},{
// 	    		targets: this.overlay,
// 	    		alpha: 1,
// 	    		duration: 2500,
// 	    	}]
// 	    });
// 
// 	    this.time.delayedCall(14500, this.startNextScene, [], this);
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}
