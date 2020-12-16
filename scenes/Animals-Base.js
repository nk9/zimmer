import BaseScene, { SceneProgress, Layers } from './base-scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import XrayAnimal from '../components/xray_animal';
import ScanChargeBar from '../components/scan_charge_bar'

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

		this.success_animals = [];

		// Subclasses need to set these
		this.scan_limit;
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
		this.swirl.visible = false;

		this.createTools();
		this.createCallToAction();
		this.createAnimals();
	}

	update() {
		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;
	}

	createAnimals() {
		let animals_data = this.cache.json.get('animals_data')[this.key];

		for (const key in animals_data) {
			const ad = animals_data[key];

			let animal = new XrayAnimal(this, key, ad.success, ad.targetX, ad.targetY, ad.scale);
			animal.on('drop', this.scanAnimal);
			animal.on('pointerdown', this.pointerDownAnimal.bind(this, animal));

			if (ad.success) {
				this.success_animals.push(animal);
			}

			this.animals.push(animal);
		}
	}

	pointerDownAnimal(pointer_down_animal) {
		if (this.selectionMode == SelectionMode.RAYGUN) {
			this.sound.play('xray');

			this.clickedXrayAnimal(pointer_down_animal);
		} else if (this.selectionMode == SelectionMode.GRABBER) {
			this.sound.play('grab');
		}

		for (const a of this.animals) {
			if (a == pointer_down_animal) {
				a.setDepth(Layers.DRAGGING);
			} else {
				a.setDepth(Layers.OVER_POUCH);
			}
		}
	}

	createTools() {
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
		console.log("scanned");
		let scene = this.scene;
		scene.scan.play();
		scene.scan.once('complete', scene.didScanAnimal.bind(scene, this));

		this.visible = false;
		scene.scanned_animals.push(this);
		scene.updateScanChargeBar();
	}

	didScanAnimal(animal) {
		if (this.allSuccessAnimalsScanned()) {
			animal.visible = true;
			console.log("success!");
			this.disperseAnimals();

			this.succeed();
		} else {
			this.resetAnimals([animal]);
		}

	}

	allSuccessAnimalsScanned() {
		var success_count = 0;

		for (const sAnimal of this.success_animals) {
			if (this.scanned_animals.some(a => a.name === sAnimal.name)) {
				success_count++;
			}
		}

		return (this.success_animals.length == success_count);
	}

	updateScanChargeBar() {
		let collected_count = this.scanned_animals.length;
		let percentRemaining = (this.scan_limit - collected_count) / this.scan_limit;
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

	disperseAnimals() {
		var tweens = [];

		let inner = new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
		Phaser.Geom.Rectangle.Inflate(inner, 150, 150);

		for (const a of this.animals) {
			let point = nearestPointOnRect(inner, a);
			tweens.push({
				targets: a,
				x: point.x,
				y: point.y,
				ease: 'Cubic.easeOut',
				duration: 750,
				offset: 0
			})
		}

		this.tweens.timeline({ tweens: tweens });
	}

	succeed() {
		this.input.enabled = false;
		this.input.setDefaultCursor(`default`);
		this.willBeginSuccessTransition();
	}

	// Overridden by subclasses to interrupt the success transition
	willBeginSuccessTransition() {
		this.beginSuccessTransition();
	}

	beginSuccessTransition() {
		this.sound.play('door_opens_heavy');

		this.time.delayedCall(750, this.doSuccessTransition, [], this);
	}

	doSuccessTransition() {
		this.swirl.visible = true;

		let fadeObjects = [
			this.background_closed
		];

	    var timeline = this.tweens.timeline({
	    	tweens: [{
	    		targets: fadeObjects,
	    		duration: 2000,
	    		alpha: 0,
	    	}]
	    });

	    this.time.delayedCall(5000, this.startNextScene, [], this);
	}
}

export default Animals_Base;