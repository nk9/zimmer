import {groupBy, sampleSize, random, pull} from 'lodash-es';

import { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import OutlinePlantMushroom from '../components/outline_plant_mushroom';

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

class Plants_Mushrooms extends Plants_Base {
	constructor() {
        super(PLANTS_MUSHROOMS);

        // initialize class variables
		this.success_count = 3;
		this.total_mushrooms = 10;
	}

	init() {
		super.init();

		this.basket_open = false;
	}

	preload() {
		super.preload();

		// Background
		this.load.image('kitchen', plantPicJpg.kitchen);

		// Tools
		this.loadOutlineImage('bigbasket');
		this.load.image('edible', plantPicJpg.edible);
		this.load.image('party', plantPicJpg.zeldaparty);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);
	    }

        // Audio
        this.load.audio('woosh', audioMp3.woosh);
        this.load.audio('kitchen', audioMp3.kitchen);
        this.load.audio('potbubble', audioMp3.potbubble);
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
			plant.x = dragX;
			plant.y = dragY;
		});
	}

	createPlant(key, pd) {
		let m = new OutlinePlantMushroom(this, key, pd);
		m.alpha = 1;
		m.setDepth(Layers.OVER_BASKET);
		this.basket_container.add(m);
		// this.input.enableDebug(m);

		return m;
	}

	dragStartPlant(plant) {
		plant.setDepth(Layers.DRAGGING);
	}

	dragEndPlant(plant) {
		plant.setDepth(Layers.OVER_BASKET);
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(360, 300, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'kitchen');
		this.background_open.setOrigin(0, 0);
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

	clickHiddenObject(hidden_object) {
		console.log(`clicked ${hidden_object.name}`);
		
		switch(hidden_object.name) {
			case 'basket':	this.clickBasket(hidden_object); break;
			case 'pot': 	this.clickPot(hidden_object); break;
			case 'book': 	this.clickBook(hidden_object); break;
			case 'jug': 	break;
			case 'vial':	this.chooseVial(); break;
			default:
		}
	}

	clickBasket(basket) {
		let open_basket_tween = {
			targets: this.basket_container,
			x: this.basket_container.x,
			y: this.basket_container.y,
			alpha: 1,
			scale: 1,
			ease: 'Sine',
			duration: 1000
		};

		this.basket_container.setPosition(basket.x, basket.y);
		this.basket_container.setSize(basket.width, basket.height);
		this.basket_container.visible = true;
		this.basket_container.scale = .2;
		this.basket_container.alpha = 0;

		this.tweens.add(open_basket_tween);
		this.basket_open = true;
	}

	clickBook(book) {
		// Show edible mushrooms image
		this.edibles_menu_container.visible = true;
		this.tweens.add({
			targets: this.edibles_menu_container,
			alpha: 1,
			duration: 500
		});
	}

	clickPot(pot) {
		this.sound.play('potbubble');

		if (this.selectionMode == SelectionMode.VIAL) {
			this.unchooseVial();
			this.checkSuccess();
		}
	}

	checkSuccess() {
		if (this.successful_drops.length == this.success_count) {
			this.succeed();
		}
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Thanks for helping!",
				content: "Time to get ready for the party. You’re coming right?",
				buttonText: "You bet",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Great!",
				content: `Before we go I need to finish up the stew! If you could lend a hand we’ll be done in no time!`,
				buttonText: "Okay",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[INTRO3_ALERT]: {
				title: "",
				content: `I left my mushroon guide around here somewhere. Could you find it and then put three edible mushrooms in the pot?`,
				buttonText: "Okay",
				buttonAction: this.intro3AlertClicked,
				context: this
			},
			[INTRO4_ALERT]: {
				title: "Mushrooms are tricky.",
				content: `Once you've added three mushrooms use some of my poison checking potion on the pot. 
				We don’t want want to get everyone sick!`,
				buttonText: "On it!",
				buttonAction: this.intro4AlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `You found all of the right mushrooms. Thanks for your help! Now what do you think is behind this door?`,
				buttonText: "I Dunno",
				buttonAction: this.doSuccessTransition,
				context: this
			},
			[FAIL_ALERT]: {
				title: "Oops!",
				content: `Looks like we chose a poisonous mushroom by mistake! We'll have to try again.`,
				buttonText: "Okay",
				buttonAction: this.failAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	createTools() {
		// super.createTools();

		this.basket_container = this.add.container((GAME_WIDTH/2)+50, GAME_HEIGHT*.5);
		this.basket_container.visible = false;
		this.big_basket = this.add.image(0, 0, 'bigbasket');
		this.big_basket.scale = 1.5;
		this.big_basket.setOrigin(.5, .5);
		this.big_basket.setDepth(Layers.BASKET);

		// Create basket close button
		let bounds = this.big_basket.getBounds();
		let basket_close = this.add.image(bounds.right*.7, bounds.top*.7, 'close_button')
			.setInteractive({useHandCursor: true})
			.on('pointerup', () => { this.basket_container.visible = false; });

		this.basket_container.add([this.big_basket, basket_close]);

		// Make pot a drop target
		for (const obj of this.hidden_objects) {
			if (obj.name == 'pot') {
				obj.input.dropZone = true;
				this.pot = obj;
			}
		} 

		this.edibles_menu_container = this.add.container(0, 0);
		this.edibles_menu = this.add.image(0, 0, 'edible');
		this.edibles_menu.setOrigin(0, 0);

		let menu_bounds = this.edibles_menu.getBounds();
		let edibles_menu_close = this.add.image(menu_bounds.right, menu_bounds.top, 'close_button')
			.setOrigin(1, 0)
			.setInteractive({useHandCursor: true})
			.on('pointerup', () => {
				this.edibles_menu_container.visible = false;
				this.edibles_menu_container.alpha = 0;
			});
		// this.input.enableDebug(this.edibles_menu);
		this.edibles_menu_container.add([this.edibles_menu, edibles_menu_close])
		this.edibles_menu_container.alpha = 0;
		this.edibles_menu_container.visible = false;

		this.party = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'party');
		this.party.scale = 1.3;
		this.party.angle = 10;
		this.party.visible = false;
	}

	chooseMagnifyingGlass() {
		// No magnifying glass in this scene
	}

	chooseVial() {
		this.selectionMode = SelectionMode.VIAL;
		let cursor = `url(${plantPicPng.vial_tool}), pointer`;
		this.input.setDefaultCursor(cursor);

		// Remove pot's pointer cursor
		this.pot.input.cursor = cursor;
		this.setObjectsInput(false);
	}

	unchooseVial() {
		this.selectionMode = SelectionMode.NONE;
		this.input.setDefaultCursor('default');
		this.pot.input.cursor = 'pointer';
		this.setObjectsInput(true);
	}

	setObjectsInput(inputEnabled) {
		let to_disable = [...this.plants, ...this.hidden_objects, this.edibles_menu];
		pull(to_disable, this.pot);

		for (const o of to_disable) {
			o.input.enabled = inputEnabled;
		}
	}

	addRandomMushrooms() {
		let grouped_shrooms = groupBy(this.plants, 'edible');
		let edibles   = sampleSize(grouped_shrooms['true'], this.success_count);
		let inedibles = sampleSize(grouped_shrooms['false'], this.total_mushrooms-this.success_count);
		let shrooms = [...edibles, ...inedibles];

		// Create ellipse
		let basket_bounds = this.big_basket.getBounds();
		let ellipse = new Phaser.Geom.Ellipse(5, 5, 370, 370);

		// Highlight hitArea
		// let zone = this.add.zone(0, 0);
		// zone.setInteractive({
		// 	hitArea: ellipse,
		// 	hitAreaCallback: Phaser.Geom.Ellipse.Contains,
			// useHandCursor: true
		// });
		// this.input.enableDebug(zone);
		// this.big_basket.setInteractive();
		// this.input.enableDebug(this.big_basket);
		// this.basket_container.add(zone);

		// iterate shrooms
		for (const m of shrooms) {
			//  - find random point
			let rxy = Phaser.Geom.Ellipse.Random(ellipse);

			//  - assign to shroom x,y
			m.x = rxy.x;
			m.y = rxy.y;
			m.angle = random(0, 360);
			m.visible = true;
		}
	}

	clickLink() {
		this.link.input.enabled = false;
		this.link.clearTint();
		this.runAlert(INTRO1_ALERT);
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
		this.link.setFrame('happy');
		this.stopAlert(INTRO4_ALERT);
		this.link.clearTint();
	}

	willBeginSuccessTransition() {
		this.runAlert(SUCCESS_ALERT);
	}

	plantDropped(plant, drop_target) {
		this.sound.play('potbubble');
		plant.visible = false;

		if (plant.edible) {
			this.successful_drops.push(plant);
		}
	}

	doSuccessTransition() {
		this.stopAlert(SUCCESS_ALERT);
		this.party.visible = true;
		this.overlay.visible = true;

	    var timeline = this.tweens.timeline({
	    	tweens: [{
				targets: this.party,
				scale: 1,
				angle: 0,
				duration: 7000,
			},{
	    		targets: this.overlay,
	    		alpha: 1,
	    		duration: 2500,
	    	}]
	    });

	    this.time.delayedCall(9500, this.startNextScene, [], this);
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