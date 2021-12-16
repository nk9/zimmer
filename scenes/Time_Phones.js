import moment from 'moment';
import log from 'loglevel';
import { random } from 'lodash-es';

import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_PHONES } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME, FLAVOR_BDAY } from '../constants/storage';

import OutlineImage from '../components/outline_image';
import Lockscreen from '../components/lockscreen';
import Time_Base, { SelectionMode } from './Time_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let FAIL_ALERT = 'FAIL_ALERT';

let PHONE1_LOCK = 'PHONE1_LOCK';
let PHONE2_LOCK = 'PHONE2_LOCK';
let PHONE3_LOCK = 'PHONE3_LOCK';

export default class Time_Phones extends Time_Base {
	constructor() {
		super(TIME_PHONES);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('dali', this.assets.background.jpg);

		let keys = Object.keys(this.stored_data.screens);
		for (const key of keys) {
	        this.load.image(key, this.assets[key].png)
		}
 
 		// Audio
 		this.load.audio('background_phones', this.assets.phonesFoley.mp3);
	}

	create() {
		super.create();

		this.createLockscreens();
		this.success_lockscreens = [];
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'navy_swirl');

		this.background_closed = this.add.image(0, 0, 'dali');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_phones', {volume: .4, loop: true});

		this.black_screens = [];
		this.createBlackScreens();
	}

	createCallToAction() {
		for (const item of this.items) {
			if (item.name.startsWith('call')) {
				item.visible = false;
			}
		}

// 		this.sound.play('steps_cave');
// 
// 		this.kratts = this.add.sprite(0-300, GAME_HEIGHT, 'kratts', 'scared');
// 		this.kratts.setOrigin(1, 1);
// 		this.kratts.setTint(0xaaaaaa);
// 		// this.kratts.scale = .5;
// 
// 		this.kratts.setInteractive({useHandCursor: true})
// 			.on('pointerover', () => { this.kratts.clearTint() })
// 			.on('pointerout', () => {
// 				if (this.kratts.input.enabled) {
// 					this.kratts.setTint(0xaaaaaa);
// 				}
// 			})
// 			.on('pointerup', pointer => { this.clickKratts() });
// 
// 		var tweens = [];
// 
// 		tweens.push({
// 			targets: this.kratts,
// 			x: this.kratts.width,
// 			ease: 'Sine.easeOut',
// 			duration: 2500,
// 			delay: 1000
// 		});
// 
// 	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	createClocks() {
	}

	createBlackScreens() {
		let keys = Object.keys(this.stored_data.screens);
		for (const key of keys) {
			let screen_dict = this.stored_data.screens[key];
	        let screen = this.add.image(screen_dict.x, screen_dict.y, key);
	        this.black_screens.push(screen);
		}
	}

	clickedItem(clicked_object) {
		switch(clicked_object.name) {
			case 'button1': this.clickHomeButton1(); break;
			case 'button2': this.clickHomeButton2(); break;
			case 'button3': this.clickHomeButton3(); break;
			case 'call1': this.clickCallButton1(); break;
			case 'call2': this.clickCallButton2(); break;
			case 'call3': this.clickCallButton3(); break;
		}
	}

	clickHomeButton1() {
		log.debug("Home Button 1");
		this.runLockscreen(PHONE1_LOCK);
	}

	clickHomeButton2() {
		log.debug("Home Button 2");
		this.runLockscreen(PHONE2_LOCK);
	}

	clickHomeButton3() {
		log.debug("Home Button 3");
		this.runLockscreen(PHONE3_LOCK);
	}

	unlockPhone(phoneNum) {
		this.black_screens[phoneNum-1].visible = false;
		this.showCallButton(phoneNum)
		this.disableHomeButton(phoneNum)
	}

	clickCallButton1() {
		log.debug("Call Button 1");
	}

	clickCallButton2() {
		log.debug("Call Button 2");
	}

	clickCallButton3() {
		log.debug("Call Button 3");
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
		};

		return alerts;
	}

	showCallButton(phoneNum) {
		let button = this.items_dict[`call${phoneNum}`]
		button.visible = true;
	}

	disableHomeButton(phoneNum) {
		let button = this.items_dict[`button${phoneNum}`]
		button.input.enabled = false;
	}

	createLockscreens() {
		let bday_diff = this.calculateAnswerLockscreen1();
		let friday_count = this.calculateAnswerLockscreen2();
		let answer3 = this.calculateAnswerLockscreen3();

		let lockscreen_alerts = {
			[PHONE1_LOCK]: {
				title: "How many days ago were you born?",
				content: "Count all days, even partial ones. Don't forget leap years!",
				buttonText: "Cancel",
				answer: bday_diff.toString(),
				phoneNum: 1,
				buttonAction: this.lockscreen1ButtonClicked,
				context: this
			},
			[PHONE2_LOCK]: {
				title: "How many Fridays are there",
				content: "in the current year?",
				buttonText: "Cancel",
				answer: `${friday_count}`,
				phoneNum: 2,
				buttonAction: this.lockscreen2ButtonClicked,
				context: this
			},
			[PHONE3_LOCK]: {
				title: "Enter the number of minutes",
				content: `between ${answer3.t1} and ${answer3.t2} PM.`,
				buttonText: "Cancel",
				answer: `${answer3.minuteDiff}`,
				phoneNum: 3,
				buttonAction: this.lockscreen3ButtonClicked,
				context: this
			},
		}

		log.debug(lockscreen_alerts);

        this.lockscreen_keys = [];

        for (const [key, data] of Object.entries(lockscreen_alerts)) {
            this.lockscreen_keys.push(key);
            this.scene.add(key, new Lockscreen(key), false, data)
        }

        // Dispose of alerts on shutdown to clear namespace
        this.events.once('shutdown', () => {
            for (const key of this.lockscreen_keys) {
                this.scene.remove(key);
            }
            this.input.setDefaultCursor('default');
        });
	}

	calculateAnswerLockscreen1() {
		// Calculate birthday diff
		let bday_str = this.game.config.storage.get(FLAVOR_BDAY);

		let bday = moment.utc(bday_str, 'YYYY-MM-DD')
		let today = moment.utc()
		return today.diff(bday, 'days') + 1;
	}

	calculateAnswerLockscreen2() {
		// Count Fridays in the current year
		// Adapted from https://stackoverflow.com/a/41194523
		var start = moment().startOf('year'),
	    	end   = moment().endOf('year'),
	    	target_day   = 5; // Friday

		var result = [];
		var current = start.clone();

		// Move to the first target day, if we aren't already there
		if (current.day() != target_day) {
			current.day(target_day);
		}
		result.push(current); // Add the first target day to the result list

		// Step through the year, week by week, adding target days as we go
		while (current.day(7 + target_day).isSameOrBefore(end)) {
		  result.push(current.clone());
		}

		return result.length;
	}

	calculateAnswerLockscreen3() {
		// Randomize and caclulate time difference
		let t1 = random(1,6);
		let t2 = random(7,11);
		return {t1: t1, t2: t2, minuteDiff: (t2 - t1) * 60};
	}

    // Disable the main scene's input while the alert scene is showing
    runLockscreen(scene_key, info=null) {
        log.debug(`runLockscreen: ${scene_key}`);
        this.input.enabled = false;
        this.scene.run(scene_key, info);
		event.stopPropagation(); // Doesn't work?? Probably a Phaser bug.
    }

    stopLockscreen(scene_key) {
        log.debug(`stopLockscreen: ${scene_key}`);
        this.scene.stop(scene_key);
        this.input.enabled = true;
    }

	lockscreen1ButtonClicked() {
		this.stopLockscreen(PHONE1_LOCK);
	}

	lockscreen2ButtonClicked() {
		this.stopLockscreen(PHONE2_LOCK);
	}

	lockscreen3ButtonClicked() {
		this.stopLockscreen(PHONE3_LOCK);
	}

	lockscreenSuccess(key, phoneNum) {
		log.debug(`Finished ${key}`)
		this.stopLockscreen(key);
		this.success_lockscreens.push(key);
		this.unlockPhone(phoneNum);
	}

	lockscreenFailure(key) {
		log.debug(`Failed at ${key}, dismiss scene`)
		this.stopLockscreen(key);
	}

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
