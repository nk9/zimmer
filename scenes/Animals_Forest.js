import { SceneProgress, Layers } from './Base_Scene';
import { ANIMALS_FOREST, ANIMALS_CAVE } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import OutlineImage from '../components/outline_image';

import Animals_Base, { SelectionMode } from './Animals_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let FAIL_ALERT   = 'FAIL_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';

export default class Animals_Forest extends Animals_Base {
	constructor() {
        super(ANIMALS_FOREST);

        // initialize variables
		this.scan_limit = 5;
	}

    nextSceneKey() {
        return ANIMALS_CAVE;
    }

	preload() {
		super.preload();

		// Images
		this.load.image('forest_door_closed', this.assets.forest_door_closed.jpg);
		this.load.image('forest_door_open', this.assets.forest_door_open.png);

        // Audio
        this.load.audio('forest_night', this.assets.forest_night.mp3);
        this.load.audio('steps_forest', this.assets.steps_forest.mp3);
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
		this.sound.play('steps_forest');

		this.kratts = this.add.sprite(0-300, GAME_HEIGHT, 'kratts', 'normal');
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
			delay: 4500
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickKratts() {
		this.runAlert(INTRO1_ALERT);
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Oh hi!",
				content: "You are looking for a door? Martin and I are looking for VERTEBRATES. Those are animals with skeletons. Can you help us find them? While you are looking, we will check our map for your door.",
				buttonText: "Sure!",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Thank You!",
				content: `Use the X-ray gun to have a look at the animals first. Then drag all the vertebrates over to the scanner tube. But be careful! The scanner only has charge for ${this.scan_limit} scans.`,
				buttonText: "Got it",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[FAIL_ALERT]: {
				title: "Time to recharge",
				content: `We think there are ${this.success_count} vertebrates out there, but we are out of juice. We will be right back!`,
				buttonText: "OK :(",
				buttonAction: this.failAlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `You found all ${this.success_count} of the vertebrates. We found the door you were looking for. Thanks for your help!`,
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
