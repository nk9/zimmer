import BaseScene, { SceneProgress, Layers } from './base-scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import OutlinePlant from '../components/outline_plant'
import LightboxAlert from '../components/lightbox_alert'

import plantsPicPng from '../assets/pics/plants/*.png'
import audioMp3 from '../assets/audio/*.mp3'

const hmm_count = 7;
var random = require('lodash.random');

export const SelectionMode = {
	NONE:    "none", 
	MAGNIFY: "magnify",
	PICK: 	 "pick"
}

const LIGHTBOX_ALERT = 'Lightbox_Alert';

class Plants_Base extends BaseScene {
	constructor(key) {
		super(key);

		this.success_plants = [];

		// Subclasses need to set these
		this.selectionMode = SelectionMode.NONE;
	}

	preload() {
		this.load.image('magnifying_glass', plantsPicPng.magnifying_glass);
		this.load.image('fingers', plantsPicPng.fingers);

		this.load.audio('pick', audioMp3.pick);
		this.load.audio('twinkle', audioMp3.twinkle);

		this.plants_data = this.cache.json.get('plants_data')[this.key];

		// Count success animals, needed for alerts
		this.success_count = 0;
		for (const key in this.plants_data) {
			const ad = this.plants_data[key];
			if (ad.success) {
				this.success_count++;
			}
		}
	}

	create() {
		super.create();

		this.plants = [];
		this.scanned_animals = [];

		this.createBackground();
		this.swirl.visible = false;

		this.createCallToAction();
		this.createTools();
		this.createPlants();
	}

	update() {
		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;
	}

	createPlants() {
		for (const key in this.plants_data) {
			const pd = this.plants_data[key];

			if ('x' in pd && 'y' in pd) {
				let plant = this.createPlant(key, pd);
				plant.alpha = 0;

				plant.on('pointerdown', this.pointerDownPlant.bind(this, plant))
					.on('dragstart', this.dragStartPlant.bind(this, plant))
					.on('dragend', this.dragEndPlant.bind(this, plant));
				
				this.plants.push(plant);
			}

// 
// 			if (pd.success) {
// 				this.success_plants.push(plant);
// 			}
// 
// 			this.plants.push(plant);
		}
	}

	pointerDownPlant(plant) {
		if (this.selectionMode == SelectionMode.MAGNIFY) {
			// random hmm
			let hmm_num = random(0, hmm_count);
			this.sound.playAudioSprite('hmm', `${hmm_num}`);

			this.clickedPlant(plant);
		}
		else if (this.selectionMode == SelectionMode.PICK) {
			this.sound.play('pick');
			this.input.setDefaultCursor(`url(${plantsPicPng.fingers_pinch}), pointer`);
		}
	}

	dragStartPlant(plant) {
		let drag_image = plant.drag_image;
		drag_image.x = plant.x;
		drag_image.y = plant.y;
		drag_image.visible = true;
	}

	dragEndPlant(plant) {
		let drag_image = plant.drag_image;
		drag_image.visible = false;
	}

	createTools() {
		this.twinkle = this.sound.add('twinkle');

		this.createToolbar();

		this.scene.add(LIGHTBOX_ALERT, new LightboxAlert(LIGHTBOX_ALERT), false);

		this.input.on('drag', (pointer, plant, dragX, dragY) => {
				if (this.selectionMode == SelectionMode.PICK) {
					plant.drag_image.x = dragX;
					plant.drag_image.y = dragY;
				}
			})
			.on('pointerup', () => {
				if (this.selectionMode == SelectionMode.PICK) {
					this.input.setDefaultCursor(`url(${plantsPicPng.fingers}), pointer`);
				}
			});
	}

	createToolbar() {
		this.toolbar = this.add.container(GAME_WIDTH/2, -101);
		this.toolbar.setSize(300, 100);

		let rectangle = this.add.rectangle(0, 0, 300, 100, 0x000000);
		rectangle.setOrigin(0.5, 0);
		rectangle.setStrokeStyle(2, 0xFFD700, 1);
		let magnifying_glass = this.add.image(-20, 10, 'magnifying_glass');
		magnifying_glass.setOrigin(1, 0);
		magnifying_glass.scale = .8;
		magnifying_glass.setInteractive({useHandCursor: true})
			.on('pointerup', () => this.chooseMagnifyingGlass());

		let fingers = this.add.image(20, 10, 'fingers');
		fingers.setOrigin(0, 0);
		fingers.scale = .8;
		fingers.setInteractive({useHandCursor: true})
			.on('pointerup', () => this.chooseFingers());

		this.toolbar.add(rectangle);
		this.toolbar.add(magnifying_glass);
		this.toolbar.add(fingers);
	}

	revealTools() {
		this.tweens.timeline({ tweens: [{
			targets: this.toolbar,
			y: 1,
			ease: 'Sine',
			duration: 1200
		}]});

		this.chooseMagnifyingGlass(); // Glass by default
	}

	chooseFingers() {
		this.selectionMode = SelectionMode.PICK;
		this.input.setDefaultCursor(`url(${plantsPicPng.fingers}), pointer`);
		// this.clickedPlant(null);
		this.setPlantsDraggable(true);
	}

	chooseMagnifyingGlass() {
		this.selectionMode = SelectionMode.MAGNIFY;
		this.input.setDefaultCursor(`url(${plantsPicPng.magnifying_glass}), pointer`);
		this.setPlantsDraggable(false);
		// this.factText.visible = false;
	}

	scanAnimal(pointer, target) {
		let scene = this.scene;

		scene.setFact(this);
		scene.scan.play();
		scene.scan.once('complete', scene.didScanAnimal.bind(scene, this));

		this.visible = false;
		scene.scanned_animals.push(this);
	}

	didScanAnimal(animal) {
		if (this.allSuccessAnimalsScanned()) {
			animal.visible = true;
			this.disperseAnimals();

			this.succeed();
		} else if (this.scanned_animals.length == this.scan_limit) {
			this.fail();
		}

	}

	allSuccessAnimalsScanned() {
		var success_count = 0;

		for (const sAnimal of this.success_plants) {
			if (this.scanned_animals.some(a => a.name === sAnimal.name)) {
				success_count++;
			}
		}

		return (this.success_plants.length == success_count);
	}

	setFact(animal) {
		this.factText.text = this.plants_data[animal.name].fact;
		this.factText.visible = true;
	}

	clickedPlant(plant) {
		this.runAlert(LIGHTBOX_ALERT, {
			image: plant.img,
			context: this
		});
	}

	closeLightbox(key) {
		this.stopAlert(key);
		this.input.setDefaultCursor(`url(${plantsPicPng.magnifying_glass}), pointer`);
	}

	setPlantsDraggable(canDrag) {
		for (const a of this.plants) {
			this.input.setDraggable(a, canDrag);
		}
	}

	setPlantsInput(handleInput) {
		for (const a of this.plants) {
			this.input.enabled = handleInput;
		}
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

	beginFailureTransition() {
		this.setPlantsInput(false);
		this.factText.visible = false;
		this.disperseAnimals();

		var reset_cta_tween = this.resetCallToActionTween();

		let tweens = [
			reset_cta_tween,
			{
				targets: this.scan_charge_bar,
				x: -90,
				ease: 'Sine',
				duration: 1500,
				onYoyo: (tween, sprite) => { this.updateScanChargeBar(); },
				yoyo: true,
				hold: 2000,
				offset: 0
			},{
				targets: this.scanner,
				x: -100,
				ease: 'Sine',
				duration: 1500,
				yoyo: true,
				hold: 2000,
				offset: 0
			}];

	    var timeline = this.tweens.timeline({
	    	tweens: tweens,
	    	onComplete: this.finishFailureTransition,
	    	onCompleteScope: this
	    });

		this.scanned_animals = [];

	}

	finishFailureTransition() {
		this.setPlantsInput(true);
	}
}

export default Plants_Base;