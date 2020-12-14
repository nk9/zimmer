import BaseScene, { SceneProgress, Layers } from './base-scene';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import ScanChargeBar from '../components/scan_charge_bar';

import animalPicPng from '../assets/pics/animals/*.png'
import audioMp3 from '../assets/audio/*.mp3'

export const SelectionMode = {
	NONE:    "none", 
	RAYGUN:  "raygun",
	GRABBER: "grabber"
}

class Animals_Base extends BaseScene {
	constructor(key) {
		super(key);

		// Subclasses need to set these
		this.scanLimit;
		this.targetAnimals;
		this.selectionMode = SelectionMode.NONE;
	}

	preload() {
		this.load.image('screen', animalPicPng.screen);
		this.load.image('scanner', animalPicPng.scanning_chamber);
		this.load.image('raygun', animalPicPng.raygun_small);
		this.load.image('grabber', animalPicPng.grabber_small);

		this.load.audio('xray', audioMp3.laser);
		this.load.audio('grab', audioMp3.squish);
		this.load.audio('scan', audioMp3.scan);
	}

	create() {
		super.create();

		this.animals = [];
		this.scanned_animals = [];

		this.createBackground();
		this.createTools();
		this.createCallToAction();
		this.createAnimals();
		this.setupAnimals();
	}

	update() {
	}

	setupAnimals() {
		for (const animal of this.animals) {
			animal.on('drop', this.scanAnimal);
			animal.on('pointerdown', this.pointerDownAnimal.bind(this, animal));
		}
	}

	pointerDownAnimal(animal) {
		if (this.selectionMode == SelectionMode.RAYGUN) {
			this.sound.play('xray');

			this.clickedXrayAnimal(animal);
		} else if (this.selectionMode == SelectionMode.GRABBER) {
			this.sound.play('grab');
		}
	}

	createTools() {
		// console.log("createTools");
		this.screen = this.add.image(GAME_WIDTH, GAME_HEIGHT, 'screen');
		this.screen.setOrigin(1, 0);

		this.scanner = this.add.image(-90, 230, 'scanner');
		this.scanner.setOrigin(0, 0);
		this.scanner.setInteractive({dropZone: true});

		this.scan = this.sound.add('scan');

		this.scan_charge_bar = new ScanChargeBar(this, -70, 450, 70, 15);
		this.updateScanChargeBar();

		this.toolbar = this.add.container(GAME_WIDTH/2, -100);
		this.toolbar.setSize(300, 100);

		let rectangle = this.add.rectangle(0, 0, 300, 100, 0x000000);
		rectangle.setOrigin(0.5, 0);
		rectangle.setStrokeStyle(2, 0xFFD700, 1);
		let raygun = this.add.image(-20, 10, 'raygun');
		raygun.setOrigin(1, 0);
		raygun.scale = .8;
		raygun.setInteractive({useHandCursor: true})
			.on('pointerup', () => this.chooseRaygun());

		let grabber = this.add.image(20, 10, 'grabber');
		grabber.setOrigin(0, 0);
		grabber.scale = .8;
		grabber.setInteractive({useHandCursor: true})
			.on('pointerup', () => this.chooseGrabber());

		this.toolbar.add(rectangle);
		this.toolbar.add(raygun);
		this.toolbar.add(grabber);

		this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			if (this.selectionMode == SelectionMode.GRABBER) {
				gameObject.x = dragX;
				gameObject.y = dragY;
			}
		});
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
			y: '-=305',
			ease: 'Sine',
			duration: 1200,
			offset: 0
		},{
			targets: this.scan_charge_bar,
			x: 50,
			ease: 'Sine',
			duration: 1200,
			offset: 0
		},{
			targets: this.scanner,
			x: 40,
			ease: 'Sine.easeOut',
			duration: 1200,
			offset: 0
		}]});

		this.chooseRaygun(); // Raygun by default
	}

	chooseGrabber() {
		this.selectionMode = SelectionMode.GRABBER;
		this.input.setDefaultCursor(`url(${animalPicPng.grabber_small}), pointer`);
		this.clickedXrayAnimal(null);
		this.setAnimalsDraggable(true);
	}

	chooseRaygun() {
		this.selectionMode = SelectionMode.RAYGUN;
		this.input.setDefaultCursor(`url(${animalPicPng.raygun_small}), pointer`);
		this.setAnimalsDraggable(false);
	}

	scanAnimal(pointer, target) {
		let scene = this.scene;
		scene.scan.play();
		scene.scan.once('complete', (music) => {scene.resetAnimals([this])});

		this.visible = false;
		scene.scanned_animals.push(this);
		scene.updateScanChargeBar();
	}

	updateScanChargeBar() {
		let collectedCount = this.scanned_animals.length;
		let percentRemaining = (this.scanLimit - collectedCount) / this.scanLimit;
		this.scan_charge_bar.drawBar(percentRemaining);
	}

	clickedXrayAnimal(animal) {
		for (const a of this.animals) {
			a.xrayImg.visible = (animal == a);
		}
	}

	setAnimalsDraggable(canDrag) {
		for (const a of this.animals) {
			this.input.setDraggable(a, canDrag);
		}
	}

	resetAnimals(animals) {
		var tweens = [];
		let animals_to_reset = (animals === null) ? this.scanned_animals : animals;

		for (const a of animals_to_reset) {
			a.visible = true;
			tweens.push({
				targets: a,
				x: a.targetX,
				y: a.targetY,
				ease: 'Sine',
				duration: 1200,
				offset: 0
			})
		}

		this.tweens.timeline({ tweens: tweens });
	}
}

export default Animals_Base;