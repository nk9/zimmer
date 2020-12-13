import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';
import XrayAnimal from '../components/xray_animal';

import oceanPicJpg from '../assets/pics/animals/ocean/*.jpg'
import oceanPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base from './Animals-Base';

let INTRO_ALERT = 'Intro_Alert';

const SelectionMode = {
	NONE:    "none", 
	RAYGUN:  "raygun",
	GRABBER: "grabber"
}

class Animals_Ocean extends Animals_Base {
	constructor() {
        super(ANIMALS_OCEAN);
	}

	preload() {
		super.preload();

		// Images
		this.load.image('underwater_door_closed', oceanPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', oceanPicPng.underwater_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
        let aStr = ['crab', 'eel'];
        aStr.map(a => this.loadXrayOutlineImage(a));

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
	}

	loadOutlineImage(name) {
		this.load.image(name, oceanPicPng[name]);
		this.load.image(name+"_outline", oceanPicPng[name+"_outline"]);
	}

	loadXrayOutlineImage(name) {
		this.loadOutlineImage(name)
		this.load.image("xray_"+name, oceanPicJpg["xray_"+name]);
	}

	create() {
		super.create();

		this.animalsEntered = false;
		this.selectionMode = SelectionMode.NONE;

		// let cursor = oceanPicPng.raygun_small
		// this.input.setDefaultCursor(`url(${oceanPicPng.raygun_small}), pointer`);
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
		this.submarine.setInteractive() // { useHandCursor: true }
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
			new XrayAnimal(this, 'crab', 500, 600, GAME_WIDTH/2, GAME_HEIGHT+200, .3),
			new XrayAnimal(this, 'eel', 1000, 100, GAME_WIDTH*.8, -250),
		);
	}

	clickedXrayAnimal(animal) {
		console.log(animal);
	}

	introAlertClicked() {
		this.scene.stop(INTRO_ALERT);

		if (!this.animalsEntered) {
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

			this.animalsEntered = true;
		}
	}
}

export default Animals_Ocean;