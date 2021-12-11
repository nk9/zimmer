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
		console.log("T_S constructor");
		super(TIME_SUNDIAL);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();
		console.log("Time_Sundial preload");

		// Images
		this.load.image('clock_field', this.assets.background.jpg);
		this.load.video('sundial', this.assets.sundial.mp4);
// 		this.load.image('cave_door_open', this.assets.cave_door_open.png);
// 		this.load.image('cave_party', this.assets.kratts_christmas.png);
// 
// 		// Audio
// 		this.load.audio('cave', this.assets.cave.mp3);
// 		this.load.audio('steps_cave', this.assets.steps_cave.mp3);
// 		this.load.audio('kratts_christmas', this.assets.kratts_christmas.mp3);

		this.clocks_data = this.stored_data.clocks;

        // Clocks
		let keys = Object.keys(this.clocks_data);
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}
	}

	create() {
		super.create();

		this.createClocks();
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'navy_swirl');

		this.background_closed = this.add.image(0, 0, 'clock_field');
		this.background_closed.setOrigin(0, 0);

// 		this.background_open = this.add.image(0, 0, 'cave_door_open');
// 		this.background_open.setOrigin(0, 0);
// 
// 		this.background_closed = this.add.image(0, 0, 'cave_door_closed');
// 		this.background_closed.setOrigin(0, 0);

		// this.background_sound = this.sound.add('cave', {volume: .4, loop: true});
	}

	createCallToAction() {
		this.video = this.add.video(500, 500, 'sundial');
		this.video.setScale(.5);
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
		console.log("create clocks")

		for (const key in this.clocks_data) {
			const cd = this.clocks_data[key];

			let clock = new OutlineTimeClock(this, key, cd);
			// clock.on('drop', this.scanAnimal);
			clock.on('pointerdown', this.pointerDownClock.bind(this, clock));

			// if (cd.success) {
			// 	this.success_clocks.push(clock);
			// }

			this.clocks.push(clock);
		}
	}

// 	clickKratts() {
// 		this.runAlert(INTRO1_ALERT);
// 	}
// 
// 	clickCallToAction() {
// 		this.runAlert(INTRO1_ALERT);
// 	}

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
