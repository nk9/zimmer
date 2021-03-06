import { filter } from 'lodash-es'

import Base_Scene, { SceneProgress, Layers } from './Base_Scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import XrayAnimal from '../components/xray_animal';
import ScanChargeBar from '../components/scan_charge_bar'

export const SelectionMode = {
	NONE:    "none", 
	RAYGUN:  "raygun",
	GRABBER: "grabber"
}

export default class Animals_Base extends Base_Scene {
	constructor(key) {
		super(key);

		// Subclasses need to set these
		this.scan_limit;
	}

	get category() {
		return "Animals";
	}

	init() {
		this.selectionMode = SelectionMode.NONE;
		this.animals_have_entered = false;

		this.success_animals = [];
	}

	preload() {
		super.preload();

		this.load.image('xray_screen', this.categoryAssets.screen.png);
		this.load.image('scanner', this.categoryAssets.scanning_chamber.png);
		this.load.image('raygun', this.categoryAssets.raygun.png);
		this.load.image('grabber', this.categoryAssets.grabber.png);

		this.load.audio('xray', this.categoryAssets.laser.mp3);
		this.load.audio('grab', this.categoryAssets.squish.mp3);
		this.load.audio('scan', this.categoryAssets.scan.mp3);

		this.animals_data = this.stored_data.animals;

		// Count success animals, needed for alerts
		this.success_count = filter(Object.values(this.animals_data), 'success').length;

		let keys = Object.keys(this.stored_data.items);
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}

        // Animals
		for (const key in this.animals_data) {
	        this.loadXrayOutlineImage(key);
	    }

	}

	loadXrayOutlineImage(name) {
		this.loadOutlineImage(name)
		this.load.image(name+"_xray", this.assets[name+"_xray"].jpg);
	}

	create() {
		super.create();

		this.animals = [];
		this.scanned_animals = [];

		this.createBackground();
		this.swirl.visible = false;
		this.background_sound.play();

		this.createItems();
		this.createTools();
		this.createCallToAction();
		this.createAnimals();

		this.portal_sound = this.sound.add('portal');
	}

	update() {
		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;
	}

	createAnimals() {
		for (const key in this.animals_data) {
			const ad = this.animals_data[key];

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
		this.screen = this.add.image(GAME_WIDTH, GAME_HEIGHT, 'xray_screen');
		this.screen.setOrigin(1, 0);

		let screenBounds = this.screen.getBounds();
		let insetBounds = Phaser.Geom.Rectangle.Inflate(screenBounds, -55, -80);
		let factStyle = {
			fontSize: '18px',
			fontFamily: 'sans-serif',
			align: "left",
			wordWrap: { width: insetBounds.width, useAdvancedWrap: true }};

		this.factText = this.add.text(screenBounds.x, screenBounds.y, '', factStyle);
		this.factText.visible = false;

		this.scanner = this.add.image(-90, 230, 'scanner');
		this.scanner.setOrigin(0, 0);
		this.scanner.setInteractive({dropZone: true});

		this.scan = this.sound.add('scan');

		this.scan_charge_bar = new ScanChargeBar(this, -70, 450, 70, 15);
		this.updateScanChargeBar();

		this.toolbar = this.add.container(GAME_WIDTH/2, -101);
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
			y: 1,
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

		this.chooseRaygun(); // Raygun by default
	}

	chooseGrabber() {
		this.selectionMode = SelectionMode.GRABBER;
		this.input.setDefaultCursor(`url(${this.categoryAssets.grabber.png}), pointer`);
		this.clickedXrayAnimal(null);
		this.setAnimalsDraggable(true);
	}

	chooseRaygun() {
		this.selectionMode = SelectionMode.RAYGUN;
		this.input.setDefaultCursor(`url(${this.categoryAssets.raygun.png}), pointer`);
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

	setFact(animal) {
		this.factText.text = this.animals_data[animal.name].fact;
		this.factText.visible = true;
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

	setAnimalsInput(handleInput) {
		for (const a of this.animals) {
			a.input.enabled = handleInput;
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
		this.unlockNextScene();

		// Fade out background sound
		this.tweens.add({
			targets: this.background_sound,
			volume: 0,
			duration: 2000
		});

		this.willBeginSuccessTransition();
	}

	// Overridden by subclasses to interrupt the success transition
	willBeginSuccessTransition() {
		this.beginSuccessTransition();
	}

	beginSuccessTransition() {
		this.background_sound.stop();
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

	beginFailureTransition() {
		this.setAnimalsInput(false);
		this.factText.visible = false;
		this.disperseAnimals();

		var tweens = [
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

		if (typeof(this.resetCallToActionTween) === 'function') {
			tweens.push(this.resetCallToActionTween());
		}

	    var timeline = this.tweens.timeline({
	    	tweens: tweens,
	    	onComplete: this.finishFailureTransition,
	    	onCompleteScope: this
	    });

		this.scanned_animals = [];

	}

	finishFailureTransition() {
		this.resetAnimals(this.animals);
		this.setAnimalsInput(true);
	}
}
