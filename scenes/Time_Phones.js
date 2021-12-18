import moment from 'moment';
import log from 'loglevel';
import { random, range, sample, sampleSize } from 'lodash-es';

import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_PHONES, TIME_SUNDIAL } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME, FLAVOR_BDAY } from '../constants/storage';

import OutlineImage from '../components/outline_image';
import Lockscreen from '../components/lockscreen';
import Time_Base, { SelectionMode } from './Time_Base';

let CALL1_ALERT = 'CALL1_ALERT';
let CALL2_ALERT = 'CALL2_ALERT';
let CALL3_ALERT = 'CALL3_ALERT';
let HALT_ALERT = 'HALT_ALERT';

let PHONE1_LOCK = 'PHONE1_LOCK';
let PHONE2_LOCK = 'PHONE2_LOCK';
let PHONE3_LOCK = 'PHONE3_LOCK';

export default class Time_Phones extends Time_Base {
	constructor() {
		super(TIME_PHONES);

		// initialize variables
		this.scan_limit = 5;
	}

    nextSceneKey() {
        return TIME_SUNDIAL;
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

		this.background_closed = this.add.image(0, 0, 'dali');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_phones', {volume: .4, loop: true});

		this.black_screens = [];
		this.createBlackScreens();
	}

	createCallToAction() {
		let callButtons = this.items.filter(i => i.name.startsWith("call"));

		for (const button of callButtons) {
			button.visible = false;
		}


		this.halt = this.add.sprite(0-300, GAME_HEIGHT, 'halt', 'uncertain');
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

		// var tweens = [];

		// tweens.push({
		// 	targets: this.halt,
		// 	x: this.halt.width,
		// 	ease: 'Sine.easeOut',
		// 	duration: 2500,
		// 	delay: 1000
		// });

	 //    var timeline = this.tweens.timeline({ tweens: tweens });
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
			case 'call1': this.clickCallButton(); break;
			case 'call2': this.clickCallButton(); break;
			case 'call3': this.clickCallButton(); break;
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

	clickCallButton() {
		let alert_key = `CALL${this.success_lockscreens.length}_ALERT`;
		this.runAlert(alert_key);
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);
		let title = "Hello? Who is this?"
		let content = "You fell through time too? Hang on, I'll be right there."

		let alerts = {
			[CALL1_ALERT]: {
				title: this.fuzzed(.66, title),
				content: this.fuzzed(.66, content),
				buttonText: "Hang up",
				buttonAction: this.alert1ButtonClicked,
				context: this
			},
			[CALL2_ALERT]: {
				title: this.fuzzed(.30, title),
				content: this.fuzzed(.50, content),
				buttonText: "Hang up",
				buttonAction: this.alert2ButtonClicked,
				context: this
			},
			[CALL3_ALERT]: {
				title: title,
				content: content,
				buttonText: "Who?",
				buttonAction: this.alert3ButtonClicked,
				context: this
			},
			[HALT_ALERT]: {
				title: "Halt! Who are you?",
				content: "Hmm, well we can get out of this together. I think I’ve found the right path. Follow me.",
				buttonText: "Right behind ya",
				buttonAction: this.haltAlertButtonClicked,
				context: this
			},
		};

		return alerts;
	}

	fuzzed(percent, string) {
		var letters = string.split("");
		let indexes = sampleSize(range(string.length), Math.floor(string.length * percent))
		let fuzz = [".", "%", "@", "^", "_", "⸘", "℥", "✳︎", "⧻"]

		for (const i of indexes) {
			letters[i] = sample(fuzz)
		}

		return letters.join("")
	}

	alert1ButtonClicked() {
		this.stopAlert(CALL1_ALERT);
	}

	alert2ButtonClicked() {
		this.stopAlert(CALL2_ALERT);
	}

	alert3ButtonClicked() {
		this.stopAlert(CALL3_ALERT);

		this.tweens.add({
			delay: 500,
			targets: this.halt,
			x: this.halt.width,
			ease: 'Sine',
			duration: 1500,
		});
	}

	clickedHalt() {
		this.runAlert(HALT_ALERT);
	}

	haltAlertButtonClicked() {
		this.stopAlert(HALT_ALERT);

		this.succeed();
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
		let answer1 = this.calculateAnswerLockscreen1();
		let answer2 = this.calculateAnswerLockscreen2();
		let answer3 = this.calculateAnswerLockscreen3();

		let lockscreen_alerts = {
			[PHONE1_LOCK]: {
				title: `How many days ago was ${answer1.target}?`,
				content: `Example: ${answer1.example} was 31 days ago. Don't forget leap years!`,
				buttonText: "Cancel",
				answer: answer1.answer,
				phoneNum: 1,
				buttonAction: this.lockscreen1ButtonClicked,
				context: this
			},
			[PHONE2_LOCK]: {
				title: `How many Fridays are there in ${answer2.year}?`,
				content: "TGIF!",
				buttonText: "Cancel",
				answer: `${answer2.count}`,
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
		return {
			target: bday.format('ll'),
			answer: today.diff(bday, 'days').toString(),
			example: moment().subtract(31, 'd').format('ll')
		};
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

		return {year: start.year(), count: result.length};
	}

	calculateAnswerLockscreen3() {
		// Randomize and caclulate time difference
		let t1 = random(1,5);
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

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}
