import BaseScene, { SceneProgress, Layers } from './base-scene';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import animalPicPng from '../assets/pics/animals/*.png'

class Animals_Base extends BaseScene {
	preload() {
		this.load.image('screen', animalPicPng.screen);
		this.load.image('raygun', animalPicPng.raygun_small);
		this.load.image('grabber', animalPicPng.grabber_small);
	}

	create() {
		super.create();

		this.animals = [];

		this.createBackground();
		this.createCallToAction();
		this.createAlerts();
		this.createAnimals();
		this.createTools();
	}

	createTools() {
		// console.log("createTools");
		this.screen = this.add.image(GAME_WIDTH, GAME_HEIGHT, 'screen');
		this.screen.setOrigin(1, 0);

		this.toolbar = this.add.container(GAME_WIDTH/2, -100);
		this.toolbar.setSize(300, 100);

		let rectangle = this.add.rectangle(0, 0, 300, 100, 0x000000);
		rectangle.setOrigin(0.5, 0);
		rectangle.setStrokeStyle(2, 0xFFD700, 1);
		let raygun = this.add.image(-20, 10, 'raygun');
		raygun.setOrigin(1, 0);
		raygun.scale = .8;
		let grabber = this.add.image(20, 10, 'grabber');
		grabber.setOrigin(0, 0);
		grabber.scale = .8;

		this.toolbar.add(rectangle);
		this.toolbar.add(raygun);
		this.toolbar.add(grabber);
	}

	revealTools() {
		// console.log("revealTools");
		this.tweens.timeline({ tweens: [{
			targets: this.toolbar,
			y: 0,
			ease: 'Sine',
			duration: 1200
		},{
			targets: this.screen,
			y: '-=230',
			ease: 'Sine',
			duration: 1200,
			offset: 0
		}]});
	}

	update() {

	}
}

export default Animals_Base;