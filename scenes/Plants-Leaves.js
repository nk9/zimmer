import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, PLANTS_LEAVES } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';

import plantPicJpg from '../assets/pics/plants/leaves/*.jpg'
import plantPicPng from '../assets/pics/plants/leaves/*.png'
import linkPicPng  from '../assets/pics/sprites/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Plants_Base, { SelectionMode } from './Plants-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let FAIL_ALERT   = 'Fail_Alert';
let SUCCESS_ALERT = 'Success_Alert';

class Plants_Leaves extends Plants_Base {
	constructor() {
        super(PLANTS_LEAVES);

        // initialize variables
		this.scan_limit = 5;
		this.animals_have_entered = false;
	}

	preload() {
		super.preload();

		// Doors
		this.load.image('hobbit_closed', plantPicJpg.hobbit_closed);
		this.load.image('hobbit_open', plantPicPng.hobbit_open);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);
	    }

	    // Link
	    this.load.image('link_wave', linkPicPng.link_wave);

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
	}

	loadOutlineImage(name) {
		this.load.image(name, plantPicPng[name]);
		this.load.image(name+"_outline", plantPicPng[name+"_outline"]);
	}

	create() {
		super.create();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'hobbit_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'hobbit_closed');
		this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		// this.sound.play('splash_bubble');

		this.link = this.add.sprite(0, GAME_HEIGHT+256, 'link', 'wave');
		this.link.setOrigin(0, 1);

		this.link.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => {
				this.clickCallToAction();
			});
		this.link.input.cursor = 'pointer';

		var tweens = [];

		tweens.push({
			targets: this.link,
			x: 0,
			y: GAME_HEIGHT,
			ease: 'Back',
			duration: 300
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
		this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
			title: "Welcome to Hobbiton!",
			content: "You are looking for a door? Koki and I are looking for invertebrates. Those are animals with no skeletons. Can you help us find them? While you are looking, we will check our map for your door.",
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

		return [INTRO1_ALERT, INTRO2_ALERT];
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
		this.scene.add(SUCCESS_ALERT, new Alert(SUCCESS_ALERT), true, {
			title: "Great work!",
			content: `You found all ${this.success_animals.length} of the invertebrates. We found the door you were looking for. Thanks for your help!`,
			buttonText: "Thank you",
			buttonAction: this.successAlertClicked,
			context: this
		});
	}

	successAlertClicked() {
		this.scene.stop(SUCCESS_ALERT);
		this.scene.remove(SUCCESS_ALERT);
		this.beginSuccessTransition();
	}

	startNextScene() {
        this.scene.start(MAIN_HALL);
        this.scene.shutdown();
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}

export default Plants_Leaves;