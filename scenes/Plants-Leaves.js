import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, PLANTS_LEAVES } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import Alert from '../components/alert';

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
		this.plants_have_entered = false;
	}

	preload() {
		super.preload();

		// Doors
		this.load.image('hobbit_closed', plantPicJpg.hobbit_closed);
		this.load.image('hobbit_open', plantPicPng.hobbit_open);

		// Lock
		this.load.image('harp_lock', plantPicPng.harp_lock);
		this.load.image('harp_lock_outline', plantPicPng.harp_lock_outline);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);
	    }

	    // Triquetra
	    this.load.image('leaf_lock', plantPicPng.leaf_lock);
	    this.load.image('leaf_lock_bottom_left', plantPicPng.leaf_lock_bottom_left);
	    this.load.image('leaf_lock_bottom_right', plantPicPng.leaf_lock_bottom_right);
	    this.load.image('leaf_lock_top', plantPicPng.leaf_lock_top);

        // Audio
        this.load.audio('woosh', audioMp3.woosh);
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

		this.swirl = this.add.image(360, 300, 'aqua_swirl');

		this.background_open = this.add.image(0, 0, 'hobbit_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'hobbit_closed');
		this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		this.sound.play('woosh', {volume: .3});

		this.link = this.add.sprite(0, GAME_HEIGHT+256, 'link', 'wave');
		this.link.setOrigin(0, 1);
		this.link.setTint(0xaaaaaa);

		this.link.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.link.clearTint() })
			.on('pointerout', () => {
				if (this.link.input.enabled) {
					this.link.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickLink() });
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

	    this.createHarpLock();
	}

	createHarpLock() {
		this.harp_lock_container = this.add.container(360, 350);
		this.harp_lock = this.add.image(0, 0, 'harp_lock');
		this.harp_lock_outline = this.add.image(0, 0, 'harp_lock_outline');
		this.harp_lock_container.add(this.harp_lock);
		this.harp_lock_container.add(this.harp_lock_outline);

		let bounds = this.harp_lock.getBounds();
		this.harp_lock_container.setSize(bounds.width, bounds.height);

		this.harp_lock_outline.visible = false;

	    this.harp_lock_container.scale = .3;

	    this.harp_lock_container.setInteractive({useHandCursor: true})
	    	.on('pointerover', () => {
	    		this.harp_lock_outline.visible = true;
	    	})
	    	.on('pointerout', () => {
	    		this.harp_lock_outline.visible = false;
	    	})
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					this.harp_lock_container.visible = false;
					this.clickHarpLock();
				}
			});
	}

	clickLink() {
		this.link.input.enabled = false;
		this.link.clearTint();
		this.runAlert(INTRO1_ALERT);
	}

	clickHarpLock() {
		this.harp_lock_container.visible = false;
		this.leaf_lock_container.visible = true;

		this.tweens.add({
			targets: this.leaf_lock_container,
			x: 1000,
			y: 150,
			alpha: 1,
			scale: 1,
			duration: 1000
		});
	}

// 	resetCallToActionTween() {
// 		let submarine_reset_tween = {
// 			targets: this.submarine,
// 			y: -300,
// 			ease: 'Sine',
// 			duration: 1500,
// 			yoyo: true,
// 			hold: 2000,
// 			offset: 0
// 		}
// 
// 		return submarine_reset_tween
// 	}

	createAlerts() {
		this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
			title: "Welcome to Hyrule!",
			content: "I lost the key to my door! Do you think you could help me get it back?",
			buttonText: "You bet",
			buttonAction: this.intro1AlertClicked,
			context: this
		});
		this.scene.add(INTRO2_ALERT, new Alert(INTRO2_ALERT), false, {
			title: "Thanks!",
			content: `Some of these plants have the right leaves to make a new key.`,
			buttonText: "Roger",
			buttonAction: this.intro2AlertClicked,
			context: this
		});
		// this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
		// 	title: "Time to recharge",
		// 	content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
		// 	buttonText: "OK :(",
		// 	buttonAction: this.failAlertClicked,
		// 	context: this
		// });

		return [INTRO1_ALERT, INTRO2_ALERT];
	}

	createTools() {
		super.createTools();

		// Create the triangle
		let bounds = this.harp_lock_container.getBounds();
		this.leaf_lock_container = this.add.container(bounds.x, bounds.y);

		let segments = ['leaf_lock', 'leaf_lock_top', 'leaf_lock_bottom_left', 'leaf_lock_bottom_right'];

		for (const segment of segments) {
			this[segment] = this.add.image(0, 0, segment);
			this[segment].visible = false;
			this.leaf_lock_container.add(this[segment]);
		}

		this.leaf_lock.visible = true;
		this.leaf_lock_container.visible = false;
		this.leaf_lock_container.alpha = 0;
		this.leaf_lock_container.scale = .3;
	}

	intro1AlertClicked() {
		this.link.setFrame('laugh');
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.link.setFrame('happy');
		this.stopAlert(INTRO2_ALERT);

		if (!this.plants_have_entered) {
			var tweens = [];

			// Animate in plants
			for (const animal of this.plants) {
				tweens.push({
					targets: animal,
					alpha: 1,
					ease: 'Sine.easeOut',
					duration: 1500,
					offset: 0 // All at once
				})
			}

	    	this.tweens.timeline({ tweens: tweens });

			// Animate in tools
			this.revealTools();

			this.plants_have_entered = true;
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