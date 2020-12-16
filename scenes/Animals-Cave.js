import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, ANIMALS_CAVE } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';

import oceanPicJpg from '../assets/pics/animals/ocean/*.jpg'
import oceanPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base, { SelectionMode } from './Animals-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let SUCCESS_ALERT = 'Success_Alert';

class Animals_Ocean extends Animals_Base {
	constructor() {
        super(ANIMALS_CAVE);

        // initialize variables
		this.scan_limit = 5;
		this.animals_have_entered = false;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('underwater_door_closed', oceanPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', oceanPicPng.underwater_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
        console.log("Hello world");
		let animals_data = this.cache.json.get('animals_data')[this.key];

		for (const key in animals_data) {
	        this.loadXrayOutlineImage(key);
	    }

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
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

	createAlerts() {
		this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
			title: "Hi Sea Explorer!",
			content: "You are looking for a door? Koki and I are looking for invertebrates. Those are animals with no skeletons. Can you help us find them? While you are looking, we will check our map for your door.",
			buttonText: "Sure!",
			buttonAction: this.intro1AlertClicked,
			context: this
		});
		this.scene.add(INTRO2_ALERT, new Alert(INTRO2_ALERT), false, {
			title: "Thank You!",
			content: `Use the X-ray gun to have a look at the animals first. Then drag all the invertebrates over to the scanner. But be careful! The scanner only has charge for ${this.scanLimit} scans.`,
			buttonText: "Got it",
			buttonAction: this.intro2AlertClicked,
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
		// This alert needs to happen at runtime because success_animals
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
}

export default Animals_Ocean;