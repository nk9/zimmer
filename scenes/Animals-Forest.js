import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, ANIMALS_FOREST } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';

import forestPicJpg from '../assets/pics/animals/forest/*.jpg'
import forestPicPng from '../assets/pics/animals/forest/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base, { SelectionMode } from './Animals-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let FAIL_ALERT   = 'Fail_Alert';
let SUCCESS_ALERT = 'Success_Alert';

class Animals_Forest extends Animals_Base {
	constructor() {
        super(ANIMALS_FOREST);

        // initialize variables
		this.scan_limit = 5;
		this.animals_have_entered = false;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('forest_door_closed', forestPicJpg.forest_door_closed);
		this.load.image('forest_door_open', forestPicPng.forest_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
		for (const key in this.animals_data) {
	        this.loadXrayOutlineImage(key);
	    }

        // Audio
        this.load.audio('forest_night', audioMp3.forest_night);
	}

	loadOutlineImage(name) {
		this.load.image(name, forestPicPng[name]);
		this.load.image(name+"_outline", forestPicPng[name+"_outline"]);
	}

	loadXrayOutlineImage(name) {
		this.loadOutlineImage(name)
		this.load.image(name+"_xray", forestPicJpg[name+"_xray"]);
	}

	create() {
		super.create();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(635, center_y, 'aqua_swirl');

		this.background_open = this.add.image(0, 0, 'forest_door_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'forest_door_closed');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('forest_night', {loop: true});
	}

	createCallToAction() {
// 		this.submarine = new OutlineImage(this, 'amphisub', 150, 150, 125, -136, 1);
// 		this.submarine
// 			.on('pointerup', pointer => {
// 				this.clickCallToAction();
// 			});
// 		this.submarine.input.cursor = 'pointer';
// 
// 		var tweens = [];
// 
// 		tweens.push({
// 			targets: this.submarine,
// 			x: this.submarine.targetX,
// 			y: this.submarine.targetY,
// 			ease: 'Sine.easeOut',
// 			duration: 2500,
// 			delay: 500
// 		});
// 
// 	    var timeline = this.tweens.timeline({ tweens: tweens });
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
		this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
			title: "Oh hi again!",
			content: "You are looking for a door? Martin and I are looking for vertebrates. Those are animals with skeletons. Can you help us find them? While you are looking, we will check our map for your door.",
			buttonText: "Sure!",
			buttonAction: this.intro1AlertClicked,
			context: this
		});
		this.scene.add(INTRO2_ALERT, new Alert(INTRO2_ALERT), false, {
			title: "Thank You!",
			content: `Use the X-ray gun to have a look at the animals first. Then drag all the invertebrates over to the scanner. But be careful! The scanner only has charge for ${this.scan_limit} scans.`,
			buttonText: "Got it",
			buttonAction: this.intro2AlertClicked,
			context: this
		});
		this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
			title: "Time to recharge",
			content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
			buttonText: "OK :(",
			buttonAction: this.failAlertClicked,
			context: this
		});
		this.scene.add(SUCCESS_ALERT, new Alert(SUCCESS_ALERT), false, {
			title: "Great work!",
			content: `You found all ${this.success_count} of the invertebrates. We found the door you were looking for. Thanks for your help!`,
			buttonText: "Thank you",
			buttonAction: this.successAlertClicked,
			context: this
		});

		return [INTRO1_ALERT, INTRO2_ALERT, FAIL_ALERT, SUCCESS_ALERT];
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
		// This alert needs to be created at runtime because success_animals
		// isn't populated until after createAlerts() is already run.
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

export default Animals_Forest;