import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import Alert from '../components/alert';
import OutlinePlantMushroom from '../components/outline_plant_mushroom';
import OutlinePlantObject from '../components/outline_plant_object';

import plantPicJpg from '../assets/pics/plants/mushrooms/*.jpg'
import plantPicPng from '../assets/pics/plants/mushrooms/*.png'
import dragPicPng  from '../assets/pics/plants/mushrooms/drag_images/*.png'
import linkPicPng  from '../assets/pics/sprites/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Plants_Base, { SelectionMode } from './Plants-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let INTRO3_ALERT = 'Intro3_Alert';
let INTRO4_ALERT = 'Intro4_Alert';

let FAIL_ALERT   = 'Fail_Alert';
let SUCCESS_ALERT = 'Success_Alert';

var groupBy = require('lodash.groupBy');
var sampleSize = require('lodash.sampleSize');

class Plants_Mushrooms extends Plants_Base {
	constructor() {
        super(PLANTS_MUSHROOMS);

        // initialize class variables
		this.success_count = 3;
		this.total_mushrooms = 8;
	}

	init() {
		super.init();

		this.basket_open = false;
	}

	preload() {
		super.preload();

		// Doors
		this.load.image('kitchen', plantPicJpg.kitchen);

		// TODO: Victor: add png background or delete
		// this.load.image('kitchen', plantPicPng.kitchen);

		// Pot
		this.loadOutlineImage('bigbasket');
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);

	        // Get the leaf if needed
	  //       const pd = this.plants_data[key];
			// if (!this.textures.exists(pd.leaf_type)) {
			// 	this.load.image(pd.leaf_type, dragPicPng[pd.leaf_type]);
			// }
	    }

        // Audio
        this.load.audio('woosh', audioMp3.woosh);
        this.load.audio('kitchen', audioMp3.kitchen);
        this.load.audio('potbubble', audioMp3.potbubble);

		for (const key in this.hidden_objects_data) {
	        this.loadOutlineImage(key);
	    }
	}

	loadOutlineImage(name) {
		this.load.image(name, plantPicPng[name]);
		this.load.image(name+"_outline", plantPicPng[name+"_outline"]);
	}

	create() {
		super.create();

		this.addRandomMushrooms();
		this.setPlantsDraggable(true);
		this.input.on('drag', (pointer, plant, dragX, dragY) => {
			// if (this.selectionMode == SelectionMode.GRABBER) {
				plant.x = dragX;
				plant.y = dragY;
			// }
		});
	}

	createPlant(key, pd) {
		let m = new OutlinePlantMushroom(this, key, pd);
		m.alpha = 1;
		this.basket_container.add(m);
		// this.input.enableDebug(m);

		return m;
	}

	dragStartPlant(plant) {
	}

	dragEndPlant(plant) {
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(360, 300, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'kitchen');
		this.background_open.setOrigin(0, 0);

		// TODO: Victor: add png background or delete
		// this.background_closed = this.add.image(0, 0, 'kitchen');
		// this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		this.sound.play('woosh', {volume: .3});

		this.link = this.add.sprite(0, GAME_HEIGHT+256, 'link', 'wave');
		this.link.setOrigin(0, 1);
		this.link.setTint(0xaaaaaa);

		this.link.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.link.clearTint() })
			.on('pointerout', () => {
				if (this.link.input.enabled) {
					this.link.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickLink() });
		this.link.input.cursor = 'pointer';

		var tweens = [];

		tweens.push({
			targets: this.link,
			x: 0,
			y: GAME_HEIGHT,
			ease: 'Back',
			duration: 300
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickLink() {
		this.link.input.enabled = false;
		this.link.clearTint();
		this.runAlert(INTRO1_ALERT);
	}

	createHiddenObjects() {
		this.hidden_objects = [];

		for (const name in this.hidden_objects_data) {
			let od = this.hidden_objects_data[name];
			let hidden_object = new OutlinePlantObject(this, name, od);
			hidden_object.on('pointerup', this.clickHiddenObject.bind(this, hidden_object));
			this.hidden_objects.push(hidden_object);
		}
	}

	clickHiddenObject(hidden_object) {
		console.log(`clicked ${hidden_object.name}`);
		
		switch(hidden_object.name) {
			case 'basket':
				this.clickBasket();
				break;
			case 'pot':
				// do stuff
				break;
			case 'book':
				// do stuff
				break;
			case 'jug':
				// do stuff
				break;
			default:
		}
	}

	clickBasket() {
		this.basket_open = true;
	}

	createAlerts() {
		let scenes = [
			this.scene.add(INTRO1_ALERT, new Alert(INTRO1_ALERT), false, {
				title: "Thanks for helping!",
				content: "Time to get ready for the party. You're coming right?",
				buttonText: "You bet",
				buttonAction: this.intro1AlertClicked,
				context: this
			}),
			this.scene.add(INTRO2_ALERT, new Alert(INTRO2_ALERT), false, {
				title: "Great!",
				content: `Before we go I need to finish up the stew! If you could lend a hand we'll be done in no time!`,
				buttonText: "Okay",
				buttonAction: this.intro2AlertClicked,
				context: this
			}),
			this.scene.add(INTRO3_ALERT, new Alert(INTRO3_ALERT), false, {
				title: "",
				content: `I left my mushroon guide around here somewhere. Could you find it and then put three edible mushrooms in the pot?`,
				buttonText: "Okay",
				buttonAction: this.intro3AlertClicked,
				context: this
			}),
			this.scene.add(INTRO4_ALERT, new Alert(INTRO4_ALERT), false, {
				title: "Mushrooms are tricky.",
				content: `Once you've added three mushrooms use some of my poison checking potion on the pot. 
				We don't want want to get everyone sick!`,
				buttonText: "On it!",
				buttonAction: this.intro4AlertClicked,
				context: this
			}),
			// this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
			// 	title: "Time to recharge",
			// 	content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
			// 	buttonText: "OK :(",
			// 	buttonAction: this.failAlertClicked,
			// 	context: this
			// }),
		];

		return scenes.map(s => s.sys.config);
	}

	createTools() {
		super.createTools();

		this.basket_container = this.add.container((GAME_WIDTH/2)+50, GAME_HEIGHT*.5);
		this.bigbasket = this.add.image(0, 0, 'bigbasket');
		this.bigbasket.scale = 1.5;
		this.bigbasket.setOrigin(.5, .5);
		this.bigbasket.setDepth(Layers.BASKET);

		// Create close button

		this.basket_container.add(this.bigbasket);

		// TODO: Victor, you can unhide this to see the mushroom basket!
		this.basket_container.visible = false;

		// Make pot a drop target
		for (const obj of this.hidden_objects) {
			if (obj.name == 'pot') {
				obj.input.dropZone = true;
			}
		}
	}

	addRandomMushrooms() {
		let grouped_shrooms = groupBy(this.plants, 'edible');
		let edibles   = sampleSize(grouped_shrooms['true'], this.success_count);
		let inedibles = sampleSize(grouped_shrooms['false'], this.total_mushrooms-this.success_count);
		let shrooms = [...edibles, ...inedibles];

		// Create ellipse
		let basket_bounds = this.bigbasket.getBounds();
		let ellipse = new Phaser.Geom.Ellipse(5, -45, 350, 350);

		// Highlight hitArea
		// let zone = this.add.zone(0, 0);
		// zone.setInteractive({
		// 	hitArea: ellipse,
		// 	hitAreaCallback: Phaser.Geom.Ellipse.Contains,
		// 	useHandCursor: true
		// });
		// this.input.enableDebug(zone);
		// this.bigbasket.setInteractive();
		// this.input.enableDebug(this.bigbasket);
		// this.basket_container.add(zone);

		// iterate shrooms
		for (const m of shrooms) {
			//  - find random point
			let rxy = Phaser.Geom.Ellipse.Random(ellipse);

			//  - assign to shroom x,y
			m.x = rxy.x;
			m.y = rxy.y;
			m.visible = true;
		}
	}

	createTriangleEmitter(triangle, zone) {
		let bounds = zone.getBounds();

	    let particle = this.add.particles('spark');
	    let emitter = particle.createEmitter({
	    	on: false,
	        x: bounds.x,
	        y: bounds.y,
	        blendMode: 'SCREEN',
	        scale: { start: 0.2, end: 0 },
	        speed: { min: -100, max: 100 },
	        quantity: 10,
	        emitZone: {
		        source: triangle,
		        type: 'edge',
		        quantity: 50
	        }
	    });
		particle.setDepth(Layers.POUCH);

		return particle;
	}

	intro1AlertClicked() {
		this.link.setFrame('laugh');
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.link.setFrame('explain');
		this.stopAlert(INTRO2_ALERT);
		this.runAlert(INTRO3_ALERT);
	}

	intro3AlertClicked() {
		this.link.setFrame('explain');
		this.stopAlert(INTRO3_ALERT);
		this.runAlert(INTRO4_ALERT);
	}

	intro4AlertClicked() {
		this.link.setFrame('explain');
		this.stopAlert(INTRO4_ALERT);

		// if (!this.plants_have_entered) {
		// 	var tweens = [];

			// // Animate in plants
			// for (const animal of this.plants) {
			// 	tweens.push({
			// 		targets: animal,
			// 		alpha: 1,
			// 		ease: 'Sine.easeOut',
			// 		duration: 1500,
			// 		offset: 0 // All at once
			// 	})
			// }

	  //   	this.tweens.timeline({ tweens: tweens });

			// Animate in tools
			this.revealTools();

		// 	this.plants_have_entered = true;
		// }
	}

	willBeginSuccessTransition() {
		// This alert needs to be created at runtime because success_animals
		// isn't populated until after createAlerts() is already run.
		this.scene.add(SUCCESS_ALERT, new Alert(SUCCESS_ALERT), true, {
			title: "Great work!",
			content: `You found all of the right mushrooms. Thanks for your help! Now what do you think is behind this door?`,
			buttonText: "I Dunno",
			buttonAction: this.successAlertClicked,
			context: this
		});
	}

	plantDropped(plant, drop_target) {
		this.sound.play('potbubble');
		plant.visible = false;

		if (plant.edible) {
			this.successful_drops.push(plant);

			if (this.successful_drops.length == this.success_count) {
				this.succeed();
			}
		} else {
			console.log("too bad");
		}
	}

	successAlertClicked() {
		this.scene.stop(SUCCESS_ALERT);
		this.scene.remove(SUCCESS_ALERT);
		this.beginSuccessTransition();
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.resetS();
		this.beginFailureTransition();
	}

	beginFailureTransition() {
		this.setPlantsInput(false);

		// reset mushrooms!!

// 		this.factText.visible = false;
// 		this.disperseAnimals();
// 
// 		var reset_cta_tween = this.resetCallToActionTween();
// 
// 		let tweens = [
// 			reset_cta_tween,
// 			{
// 				targets: this.scan_charge_bar,
// 				x: -90,
// 				ease: 'Sine',
// 				duration: 1500,
// 				onYoyo: (tween, sprite) => { this.updateScanChargeBar(); },
// 				yoyo: true,
// 				hold: 2000,
// 				offset: 0
// 			},{
// 				targets: this.scanner,
// 				x: -100,
// 				ease: 'Sine',
// 				duration: 1500,
// 				yoyo: true,
// 				hold: 2000,
// 				offset: 0
// 			}];
// 
// 	    var timeline = this.tweens.timeline({
// 	    	tweens: tweens,
// 	    	onComplete: this.finishFailureTransition,
// 	    	onCompleteScope: this
// 	    });
// 
// 		this.scanned_animals = [];
	}

	finishFailureTransition() {
		this.setPlantsInput(true);
	}

}

export default Plants_Mushrooms;