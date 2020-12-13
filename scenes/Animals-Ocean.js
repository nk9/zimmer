import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';

import animalPicJpg from '../assets/pics/animals/ocean/*.jpg'
import animalPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base from './Animals-Base';

let INTRO_ALERT = 'Intro_Alert';

class Animals_Ocean extends Animals_Base {
	preload() {
		// Images
		this.load.image('underwater_door_closed', animalPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', animalPicPng.underwater_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
        this.loadOutlineImage('crab');
        this.loadOutlineImage('eel');

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
	}

	loadOutlineImage(name) {
		this.load.image(name, animalPicPng[name]);
		this.load.image(name+"_outline", animalPicPng[name+"_outline"]);
	}
	
	constructor() {
        super(ANIMALS_OCEAN);
	}

	create() {
		super.create();

		this.animalsEntered = false;

		// this.input.setDefaultCursor('url(assets/pics/raygun.png), pointer');
	}

	createBackground() {
// 		let center_x = GAME_WIDTH/2,
// 			center_y = GAME_HEIGHT/2;
// 
// 		this.swirl = this.add.image(center_x, center_y, 'aqua_swirl');
// 		this.swirl.scale += .1; // Aqua swirl isn't quite large enough to fill the space

		this.background_open = this.add.image(0, 0, 'underwater_door_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'underwater_door_closed');
		this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		this.sound.play('splash_bubble');

		this.submarine = new OutlineImage(this, 'amphisub', 150, 150, 125, -136, 1);
		this.submarine.setInteractive()
			.on('pointerup', pointer => {
				this.clickCallToAction();
			});

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
		this.scene.run(INTRO_ALERT);
	}

	createAlerts() {
		this.scene.add(INTRO_ALERT, new Alert(INTRO_ALERT), false, {
			title: "Hi Sea Explorer!",
			content: "Koki and I are looking for invertebrates. Those are animals with no skeletons. Can you drag all of those over to our submarine? You can use our X-ray gun to check.",
			buttonText: "Sure!",
			buttonAction: this.introAlertClicked,
			context: this
		});

		return [INTRO_ALERT];
	}

	createAnimals() {
		this.animals.push(
			new OutlineImage(this, 'crab', 500, 650, GAME_WIDTH/2, GAME_HEIGHT+200, .3),
			new OutlineImage(this, 'eel', 1000, 100, GAME_WIDTH*.8, -250),
		);
	}

	introAlertClicked() {
		this.scene.stop(INTRO_ALERT);

		if (!this.animalsEntered) {
			var tweens = [];

			// Animate in tools
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

			// Animate in X-ray screen

	    	this.tweens.timeline({ tweens: tweens });

			this.animalsEntered = true;
		}
	}
}

export default Animals_Ocean;