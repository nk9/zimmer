import BaseScene, { SceneProgress, Layers } from './base-scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import XrayAnimal from '../components/xray_animal'
import ScanChargeBar from '../components/scan_charge_bar'


import plantPicPng from '../assets/pics/plants/*.png'
import audioMp3 from '../assets/audio/*.mp3'

export const SelectionMode = {
	NONE:    "none", 
	MAGNIFY: "magnify",
	PICK: 	 "pick"
}

class Plants_Base extends BaseScene {
	constructor(key) {
		super(key);

		this.success_plants = [];

		// Subclasses need to set these
		this.scan_limit;
		this.selectionMode = SelectionMode.NONE;
	}

	preload() {
		this.load.image('leaf_lock', plantPicPng.leaf_lock)
		this.load.image('magnifying_glass', plantPicPng.magnifying_glass);
		this.load.image('fingers', plantPicPng.fingers);

		this.load.audio('hmm', audioMp3.laser);	 // TODO
		this.load.audio('pick', audioMp3.squish); // TODO
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

		this.createTools();
		this.createCallToAction();
		this.createPlants();
	}

	update() {
		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;
	}

	createPlants() {
		for (const key in this.plants_data) {
			const pd = this.plants_data[key];

// 			let plant = new XrayAnimal(this, key, pd.success, pd.targetX, pd.targetY, pd.scale);
// 			plant.on('drop', this.scanAnimal);
// 			plant.on('pointerdown', this.pointerDownAnimal.bind(this, plant));
// 
// 			if (pd.success) {
// 				this.success_plants.push(plant);
// 			}
// 
// 			this.plants.push(plant);
		}
	}

	pointerDownAnimal(pointer_down_animal) {
		if (this.selectionMode == SelectionMode.MAGNIFY) {
			this.sound.play('hmm');

			this.clickedXrayAnimal(pointer_down_animal);
		} else if (this.selectionMode == SelectionMode.PICK) {
			this.sound.play('pick');
		}

		for (const a of this.plants) {
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

		let screenBounds = this.screen.getBounds();
		let insetBounds = Phaser.Geom.Rectangle.Inflate(screenBounds, -55, -80);
		let factStyle = {
			fontSize: '18px',
			fontFamily: 'sans-serif',
			align: "left",
			wordWrap: { width: insetBounds.width, usetAdvancedWrap: true }};

		this.factText = this.add.text(screenBounds.x, screenBounds.y, '', factStyle);
		this.factText.visible = false;

		this.scanner = this.add.image(-90, 230, 'scanner');
		this.scanner.setOrigin(0, 0);
		this.scanner.setInteractive({dropZone: true});

		this.twinkle = this.sound.add('twinkle');

		this.scan_charge_bar = new ScanChargeBar(this, -70, 450, 70, 15);
		this.updateScanChargeBar();

		this.toolbar = this.add.container(GAME_WIDTH/2, -100);
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

		this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
			if (this.selectionMode == SelectionMode.PICK) {
				// NOT QUITE
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
			targets: [this.screen, this.factText],
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

		this.chooseMagnifyingGlass(); // Glass by default
	}

	chooseFingers() {
		this.selectionMode = SelectionMode.PICK;
		this.input.setDefaultCursor(`url(${plantsPicPng.fingers}), pointer`);
		this.clickedXrayAnimal(null);
		this.setAnimalsDraggable(true);
	}

	chooseMagnifyingGlass() {
		this.selectionMode = SelectionMode.MAGNIFY;
		this.input.setDefaultCursor(`url(${plantsPicPng.magnifying_glass}), pointer`);
		this.setAnimalsDraggable(false);
		this.factText.visible = false;
	}

	scanAnimal(pointer, target) {
		let scene = this.scene;

		scene.setFact(this);
		scene.scan.play();
		scene.scan.once('complete', scene.didScanAnimal.bind(scene, this));

		this.visible = false;
		scene.scanned_animals.push(this);
		scene.updateScanChargeBar();
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

	updateScanChargeBar() {
		let collected_count = this.scanned_animals.length;
		let percentRemaining = (this.scan_limit - collected_count) / this.scan_limit;
		this.scan_charge_bar.drawBar(percentRemaining);
	}

	setFact(animal) {
		this.factText.text = this.plants_data[animal.name].fact;
		this.factText.visible = true;
	}

	clickedXrayAnimal(animal) {
		for (const a of this.plants) {
			a.xrayImg.visible = (animal == a);
		}
	}

	setAnimalsDraggable(canDrag) {
		for (const a of this.plants) {
			this.input.setDraggable(a, canDrag);
		}
	}

	setPlantsInput(handleInput) {
		for (const a of this.plants) {
			this.input.enabled = handleInput;
		}
	}

// 	resetAnimals(animals) {
// 		var tweens = [];
// 		let animals_to_reset = (animals === null) ? this.scanned_animals : animals;
// 
// 		for (const a of animals_to_reset) {
// 			a.visible = true;
// 			tweens.push({
// 				targets: a,
// 				x: a.targetX,
// 				y: a.targetY,
// 				ease: 'Sine',
// 				duration: 1200,
// 				offset: 0
// 			})
// 		}
// 
// 		this.tweens.timeline({ tweens: tweens });
// 	}
// 
// 	disperseAnimals() {
// 		var tweens = [];
// 
// 		let inner = new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
// 		Phaser.Geom.Rectangle.Inflate(inner, 150, 150);
// 
// 		for (const a of this.plants) {
// 			let point = nearestPointOnRect(inner, a);
// 			tweens.push({
// 				targets: a,
// 				x: point.x,
// 				y: point.y,
// 				ease: 'Cubic.easeOut',
// 				duration: 750,
// 				offset: 0
// 			})
// 		}
// 
// 		this.tweens.timeline({ tweens: tweens });
// 	}

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