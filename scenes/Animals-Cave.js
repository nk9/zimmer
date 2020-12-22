import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_CAVE } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';

import cavePicJpg from '../assets/pics/animals/cave/*.jpg'
import cavePicPng from '../assets/pics/animals/cave/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base, { SelectionMode } from './Animals-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let INTRO3_ALERT = 'Intro3_Alert';
let INTRO4_ALERT = 'Intro4_Alert';
let SUCCESS_ALERT = 'Success_Alert';
let FAIL_ALERT = 'Fail_Alert';

class Animals_Cave extends Animals_Base {
	constructor() {
		super(ANIMALS_CAVE);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('cave_door_closed', cavePicJpg.cave_door_closed);
		this.load.image('cave_door_open', cavePicPng.cave_door_open);
		this.loadOutlineImage('amphisub');

		// Animals
		let animals_data = this.cache.json.get('animals_data')[this.key];

		for (const key in animals_data) {
			this.loadXrayOutlineImage(key);
		}

		// Audio
		this.load.audio('cave', audioMp3.cave);
		this.load.audio('steps_cave', audioMp3.steps_cave);
	}

	loadOutlineImage(name) {
		this.load.image(name, cavePicPng[name]);
		this.load.image(name+"_outline", cavePicPng[name+"_outline"]);
	}

	loadXrayOutlineImage(name) {
		this.loadOutlineImage(name)
		this.load.image(name+"_xray", cavePicJpg[name+"_xray"]);
	}

	create() {
		super.create();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'navy_swirl');

		this.background_open = this.add.image(0, 0, 'cave_door_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'cave_door_closed');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('cave', {volume: .4, loop: true});
	}

createCallToAction() {
		this.sound.play('steps_cave');

		this.kratts = this.add.sprite(0-300, GAME_HEIGHT, 'kratts', 'scared');
		this.kratts.setOrigin(1, 1);
		this.kratts.setTint(0xaaaaaa);
		// this.kratts.scale = .5;

		this.kratts.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.kratts.clearTint() })
			.on('pointerout', () => {
				if (this.kratts.input.enabled) {
					this.kratts.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickKratts() });

		var tweens = [];

		tweens.push({
			targets: this.kratts,
			x: this.kratts.width,
			ease: 'Sine.easeOut',
			duration: 2500,
			delay: 1000
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickKratts() {
		this.runAlert(INTRO1_ALERT);
	}

	clickCallToAction() {
		this.runAlert(INTRO1_ALERT);
	}

	createAlerts() {
		let scenes = [
			this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
				title: "It's so wet in here!",
				content: "All the water dripping through the ceiling is making it really slippery!",
				buttonText: "Hi again!",
				buttonAction: this.intro1AlertClicked,
				context: this
			}),
			this.scene.add(INTRO2_ALERT, new Alert(INTRO2_ALERT), false, {
				title: "How did you get here?",
				content: "You are trying to open that door? Martin and I might have some tools which can help!",
				buttonText: "Great!",
				buttonAction: this.intro2AlertClicked,
				context: this
			}),
			this.scene.add(INTRO3_ALERT, new Alert(INTRO3_ALERT), false, {
				title: "While you are waiting.",
				content: "Could you help us find invertebrates? They don't have bones, but they often have a hard shell called an exoskeleton.",
				buttonText: "Sure!",
				buttonAction: this.intro3AlertClicked,
				context: this
			}),
			this.scene.add(INTRO4_ALERT, new Alert(INTRO4_ALERT), false, {
				title: "Thank you!",
				content: `Use the X-ray gun to have a look at the animals first. Then put the invertebrates in the scanner like before. Remember! The scanner only has charge for ${this.scan_limit} scans.`,
				buttonText: "Got it",
				buttonAction: this.intro4AlertClicked,
				context: this
			}),
			this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
				title: "Time to recharge",
				content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
				buttonText: "OK :(",
				buttonAction: this.failAlertClicked,
				context: this
			}),
			this.scene.add(SUCCESS_ALERT, new Alert(SUCCESS_ALERT), false, {
				title: "Great work!",
				content: `You found all ${this.success_count} of the invertebrates. We managed to get the door open for you! Thanks for your help!`,
				buttonText: "Thank you!",
				buttonAction: this.successAlertClicked,
				context: this
			}),
		];

		return scenes.map(s => s.key);
	}

	intro1AlertClicked() {
		this.kratts.setFrame('determined');
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}
	intro2AlertClicked() {
		this.kratts.setFrame('normal');
		this.stopAlert(INTRO2_ALERT);
		this.runAlert(INTRO3_ALERT);
	}
	intro3AlertClicked() {
		this.kratts.setFrame('normal');
		this.stopAlert(INTRO3_ALERT);
		this.runAlert(INTRO4_ALERT);
	}
	intro4AlertClicked() {
		this.kratts.setFrame('thumbs');
		this.stopAlert(INTRO4_ALERT);

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

			tweens.push({
				targets: this.kratts,
				y: GAME_HEIGHT+350,
				ease: 'Sine',
				duration: 2000,
				offset: 0
			});

	    	this.tweens.timeline({ tweens: tweens });

			// Animate in tools
			this.revealTools();

			this.animals_have_entered = true;
		}
	}

	willBeginSuccessTransition() {
		this.tweens.add({
			targets: this.kratts,
			y: GAME_HEIGHT,
			ease: 'Sine',
			duration: 2000,
			onComplete: () => {this.runAlert(SUCCESS_ALERT);},
			onCompleteScope: this
		});
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

export default Animals_Cave;