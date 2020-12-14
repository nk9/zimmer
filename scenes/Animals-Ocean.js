import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';
import OutlineImage from '../components/outline_image';
import XrayAnimal from '../components/xray_animal';

import oceanPicJpg from '../assets/pics/animals/ocean/*.jpg'
import oceanPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base, { SelectionMode } from './Animals-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';

class Animals_Ocean extends Animals_Base {
	constructor() {
        super(ANIMALS_OCEAN);

        // initialize variables
		this.scanLimit = 5;
		this.scanLimit = 5;
		this.animals_have_entered = false;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('underwater_door_closed', oceanPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', oceanPicPng.underwater_door_open);
        this.loadOutlineImage('amphisub');

        // Animals
        let aStr = ['crab', 'eel', 'octopus', 'lobster'];
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
		this.load.image(name+"_xray", oceanPicJpg[name+"_xray"]);
	}

	create() {
		super.create();
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
		this.scene.run(INTRO1_ALERT);
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

	createAnimals() {
		this.animals.push(
			new XrayAnimal(this, 'crab', true, 100, 600, GAME_WIDTH/2, GAME_HEIGHT+200, .3),
			new XrayAnimal(this, 'lobster', true, 300, 600, GAME_WIDTH/2, GAME_HEIGHT+200, .3),
			new XrayAnimal(this, 'octopus', true, 500, 600, GAME_WIDTH/2, GAME_HEIGHT+200, 1),
			new XrayAnimal(this, 'eel', false, 1000, 100, GAME_WIDTH*.8, -250),
			new XrayAnimal(this, 'eel', false, 700, 100, GAME_WIDTH*.8, -250),
			new XrayAnimal(this, 'eel', false, 500, 100, GAME_WIDTH*.8, -250),
		);
	}

	intro1AlertClicked() {
		this.scene.stop(INTRO1_ALERT);
		this.scene.run(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.scene.stop(INTRO2_ALERT);

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
}

export default Animals_Ocean;