import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN, ANIMALS_FOREST } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import OutlineImage from '../components/outline_image';

import oceanPicJpg from '../assets/pics/animals/ocean/*.jpg'
import oceanPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base, { SelectionMode } from './Animals-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let FAIL_ALERT   = 'Fail_Alert';
let SUCCESS_ALERT = 'Success_Alert';

class Animals_Ocean extends Animals_Base {
	constructor() {
        super(ANIMALS_OCEAN);

        // initialize class variables
		this.scan_limit = 5;
	}

    nextSceneKey() {
        return ANIMALS_FOREST;
    }

	preload() {
		super.preload();

		// Images
		this.load.image('underwater_door_closed', oceanPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', oceanPicPng.underwater_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
		for (const key in this.animals_data) {
	        this.loadXrayOutlineImage(key);
	    }

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
        this.load.audio('underwater', audioMp3.underwater);
	}

	loadOutlineImage(name) {
		this.load.image(name, oceanPicPng[name]);
		this.load.image(name+"_outline", oceanPicPng[name+"_outline"]);
	}

	loadXrayOutlineImage(name) {
		this.loadOutlineImage(name)
		this.load.image(name+"_xray", oceanPicJpg[name+"_xray"]);
	}

	create() {
		super.create();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'aqua_swirl');

		this.background_open = this.add.image(0, 0, 'underwater_door_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'underwater_door_closed');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('underwater', {volume: .4, loop: true});
	}

	createCallToAction() {
		this.sound.play('splash_bubble');

		this.submarine = new OutlineImage(this, 'amphisub', 150, 150, 125, -136, 1);
		this.submarine
			.on('pointerup', pointer => {
				this.clickCallToAction();
			});
		this.submarine.input.cursor = 'pointer';

		var tweens = [];

		tweens.push({
			targets: this.submarine,
			x: this.submarine.targetX,
			y: this.submarine.targetY,
			ease: 'Sine.easeOut',
			duration: 2500,
			delay: 500
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickCallToAction() {
		this.runAlert(INTRO1_ALERT);
	}

	resetCallToActionTween() {
		let submarine_reset_tween = {
			targets: this.submarine,
			y: -300,
			ease: 'Sine',
			duration: 1500,
			yoyo: true,
			hold: 2000,
			offset: 0
		}

		return submarine_reset_tween
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Hi Sea Explorer!",
				content: "You are looking for a door? Koki and I are looking for invertebrates. Those are animals with no skeletons. Can you help us find them? While you are looking, we will check our map for your door.",
				buttonText: "Sure!",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Thank You!",
				content: `Use the X-ray gun to have a look at the animals first. Then drag all the invertebrates over to the scanner. But be careful! The scanner only has charge for ${this.scan_limit} scans.`,
				buttonText: "Got it",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[FAIL_ALERT]: {
				title: "Time to recharge",
				content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
				buttonText: "OK :(",
				buttonAction: this.failAlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `You found all ${this.success_count} of the invertebrates. We found the door you were looking for. Thanks for your help!`,
				buttonText: "Thank you",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	intro1AlertClicked() {
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.stopAlert(INTRO2_ALERT);

		if (!this.animals_have_entered) {
			var tweens = [];

			// Animate in animals
			for (const animal of this.animals) {
				tweens.push({
					targets: animal,
					x: animal.targetX,
					y: animal.targetY,
					ease: 'Sine.easeOut',
					duration: 2000,
					offset: 0 // All at once
				})
			}

	    	this.tweens.timeline({ tweens: tweens });

			// Animate in tools
			this.revealTools();

			this.animals_have_entered = true;
		}
	}

	willBeginSuccessTransition() {
		this.runAlert(SUCCESS_ALERT);
	}

	successAlertClicked() {
		this.stopAlert(SUCCESS_ALERT);

		this.beginSuccessTransition();
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}

export default Animals_Ocean;