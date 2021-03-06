import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, ANIMALS_CAVE } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME } from '../constants/storage';

import OutlineImage from '../components/outline_image';

import Animals_Base, { SelectionMode } from './Animals_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let FAIL_ALERT = 'FAIL_ALERT';

export default class Animals_Cave extends Animals_Base {
	constructor() {
		super(ANIMALS_CAVE);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('cave_door_closed', this.assets.cave_door_closed.jpg);
		this.load.image('cave_door_open', this.assets.cave_door_open.png);
		this.load.image('cave_party', this.assets.kratts_christmas.png);

		// Audio
		this.load.audio('cave', this.assets.cave.mp3);
		this.load.audio('steps_cave', this.assets.steps_cave.mp3);
		this.load.audio('kratts_christmas', this.assets.kratts_christmas.mp3);
	}

	create() {
		super.create();

		this.kratts_christmas = this.sound.add('kratts_christmas');
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

	createTools() {
		super.createTools();

		this.party = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'cave_party');
		this.party.scale = 1.3;
		this.party.angle = 15;
		this.party.visible = false;
		this.party.setDepth(Layers.TRANSITION);
	}

	clickKratts() {
		this.runAlert(INTRO1_ALERT);
	}

	clickCallToAction() {
		this.runAlert(INTRO1_ALERT);
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
			[INTRO1_ALERT]: {
				title: "Careful!",
				content: "All the water dripping through the ceiling is making it really slippery!",
				buttonText: "Hi again!",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: `What do you need ${name}?`,
				content: "You are trying to open that door? Martin and I might have some tools which can help!",
				buttonText: "Great!",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[INTRO3_ALERT]: {
				title: "While you are waiting",
				content: "Could you help us find INVERTEBRATES? They don't have bones, but they often have a hard shell called an exoskeleton.",
				buttonText: "Sure!",
				buttonAction: this.intro3AlertClicked,
				context: this
			},
			[INTRO4_ALERT]: {
				title: "Thank you!",
				content: `Use the X-ray gun to have a look at the animals first. Then put the invertebrates in the scanner like before. Remember! The scanner only has charge for ${this.scan_limit} scans.`,
				buttonText: "Got it",
				buttonAction: this.intro4AlertClicked,
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
				content: `Thanks for your help ${name}! While you were working we managed to get the door open for you!`,
				buttonText: "Thank you!",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
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

	doSuccessTransition() {
	}


	successAlertClicked() {
		this.kratts_christmas.play();
		this.stopAlert(SUCCESS_ALERT);
		this.party.visible = true;
		this.overlay.visible = true;

	    var timeline = this.tweens.timeline({
	    	tweens: [{
				targets: this.party,
				scale: 1,
				angle: 0,
				duration: 12000,
			},{
	    		targets: this.overlay,
	    		alpha: 1,
	    		duration: 2500,
	    	}]
	    });

	    this.time.delayedCall(14500, this.startNextScene, [], this);
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}
