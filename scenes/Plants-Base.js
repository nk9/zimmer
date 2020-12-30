import { random } from 'lodash-es';

import BaseScene, { SceneProgress, Layers } from './base-scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import LightboxAlert from '../components/lightbox_alert'
import PointerOutlineImage from '../components/pointer_outline_image'
import Alert from '../components/alert'

import plantsPicPng from '../assets/pics/plants/*.png'
import audioMp3 from '../assets/audio/*.mp3'

const hmm_count = 7;

export const SelectionMode = {
	NONE:    "none", 
	MAGNIFY: "magnify",
	PICK: 	 "pick",
	VIAL:	 "vial", 
}

const LIGHTBOX_ALERT = 'Lightbox_Alert';
const ITEM_ALERT = 'Item_Alert';

class Plants_Base extends BaseScene {
	// constructor(key) {
	// 	super(key);
	// }

	init() {
		this.selectionMode = SelectionMode.NONE;
		this.plants_have_entered = false;

		this.successful_drops = [];
	}

	preload() {
		super.preload();

		this.load.image('magnifying_glass', plantsPicPng.magnifying_glass);
		this.load.image('fingers', plantsPicPng.fingers);

		this.load.audio('pick', audioMp3.pick);
		this.load.audio('twinkle', audioMp3.twinkle);

		this.plants_data = this.stored_data.plants;
		this.hidden_objects_data = this.stored_data.items;
		
		let keys = Object.keys(this.stored_data.items);
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}
	}

	create() {
		super.create();

		this.plants = [];
		this.scanned_animals = [];

		this.createBackground();
		this.swirl.visible = false;

		this.createHiddenObjects();
		this.createCallToAction();
		this.createTools();
		this.createPlants();

		this.portal_sound = this.sound.add('portal');
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

				if (plant.hasOwnProperty('drag_image')) {
					plant.drag_image.setDepth(Layers.DRAGGING);
				}

				plant.on('pointerdown', this.pointerDownPlant.bind(this, plant))
					.on('dragstart', this.dragStartPlant.bind(this, plant))
					.on('dragend', this.dragEndPlant.bind(this, plant))
					.on('drop', (pointer, target) => {
						const bound = this.plantDropped.bind(this);
						bound(plant, target);
					});
				
				this.plants.push(plant);
			}
		}
	}

	createHiddenObjects() {
		this.createItems();
		this.hidden_objects = this.items;
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

	// setFact(animal) {
	// 	this.factText.text = this.plants_data[animal.name].fact;
	// 	this.factText.visible = true;
	// }

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
		for (const p of this.plants) {
			p.input.enabled = handleInput;
		}
	}

	succeed() {
		this.input.enabled = false;
		this.input.setDefaultCursor(`default`);
		this.unlockNextScene();

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
		this.portal_sound.play();
		this.swirl.visible = true;
		this.overlay.visible = true;

	    var timeline = this.tweens.timeline({
	    	tweens: [{
	    		targets: this.background_closed,
	    		duration: 2000,
	    		alpha: 0,
	    	},{
	    		targets: this.overlay,
	    		duration: 2500,
	    		alpha: 1,
	    		offset: 7000
	    	}]
	    });

	    this.time.delayedCall(9500, this.startNextScene, [], this);
	}

	startNextScene(key=null) {
		if (!key) {
			key = this.nextSceneKey();
		}

		this.portal_sound.stop();
		// this.background_sound.stop();
		this.willStartNextScene();
		this.scene.remove(LIGHTBOX_ALERT);
		
        this.scene.start(key);
        this.scene.shutdown();
	}

	// Overridden by subclasses to clean up before the next scene
	willStartNextScene() {
	}
}

export default Plants_Base;