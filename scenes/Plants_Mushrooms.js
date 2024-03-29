import {groupBy, sampleSize, random, pull, find} from 'lodash-es';

import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import OutlinePlantMushroom from '../components/outline_plant_mushroom';

import Plants_Base, { SelectionMode } from './Plants_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';

let NOT_ENOUGH_ALERT = 'NOT_ENOUGH_ALERT';
let FAIL_ALERT   = 'FAIL_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let TEST_FAIL_ALERT = 'TEST_FAIL_ALERT';
let THREE_DROPS_ALERT = 'THREE_DROPS_ALERT';

export default class Plants_Mushrooms extends Plants_Base {
	constructor() {
        super(PLANTS_MUSHROOMS);

        // initialize class variables
		this.success_count = 3;
		this.total_mushrooms = 10;
	}

	init() {
		super.init();

		this.basket_open = false;
		this.plant_drops = [];
	}

	preload() {
		super.preload();

		// Background
		this.load.image('kitchen', this.assets.kitchen.jpg);

		// Tools
		this.load.image('bigbasket', this.assets.bigbasket.png);
		this.load.image('edible', this.assets.edible.jpg);
		this.load.image('party', this.assets.zeldaparty.jpg);
		this.load.image('pipette', this.assets.pipette.png);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);
	    }

        // Audio
        this.load.audio('kitchen', this.assets.kitchen.mp3);
        this.load.audio('potbubble', this.assets.potbubble.mp3);
        this.load.audio('tavern', this.assets.tavern.mp3);
	}

	create() {
		super.create();

		this.addRandomMushrooms();
		this.setPlantsDraggable(true);
		this.input.on('drag', (pointer, plant, dragX, dragY) => {
				if (plant == this.vial) {
					plant.drag_image.x = dragX;
					plant.drag_image.y = dragY;
				} else {
					plant.x = dragX;
					plant.y = dragY;
				}
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

		this.background_sound = this.sound.add('kitchen', {volume: .4, loop: true});
		this.background_sound.play();
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

	clickedItem(hidden_object) {
		console.log(`clicked ${hidden_object.name}`);
		
		switch(hidden_object.name) {
			case 'basket':	this.clickBasket(hidden_object); break;
			case 'pot': 	this.clickPot(hidden_object); break;
			case 'book': 	this.clickBook(hidden_object); break;
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

	dragStartVial() {
		let drag_image = this.vial.drag_image;
		drag_image.x = this.vial.x;
		drag_image.y = this.vial.y;
		drag_image.visible = true;
	}

	dragEndVial() {
		let drag_image = this.vial.drag_image;
		drag_image.visible = false;
	}

	dropVial(target) {
		if (target == this.pot) {
			this.sound.play('potbubble');

			this.checkSuccess();
		} else {
			this.link.setFrame('notimpressed');
			this.runAlert(TEST_FAIL_ALERT);
		}
	}

	testFailAlertClicked() {
		this.stopAlert(TEST_FAIL_ALERT);
	}

	checkSuccess() {
		// Have we done enough drops?
		if (this.plant_drops.length == this.success_count) {
			// Have all of them been successful?
			if (this.successful_drops.length == this.success_count) {
				this.succeed();
			}
			// Whoops
			else {
				// Poisonous alert
				this.runAlert(FAIL_ALERT);
				this.fail();
			}
		} else {
			// Not enough alert
			this.runAlert(NOT_ENOUGH_ALERT);
		}
	}

	notEnoughAlertClicked() {
		this.stopAlert(NOT_ENOUGH_ALERT);
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
				content: `Once you’ve added three mushrooms use some of my poison checking potion on the pot. 
				We don’t want want to get everyone sick!`,
				buttonText: "On it!",
				buttonAction: this.intro4AlertClicked,
				context: this
			},
			[NOT_ENOUGH_ALERT]: {
				title: "Hold your horses",
				content: `There aren’t enough mushrooms yet. I need the three edible mushrooms so my stew tastes perfect!`,
				buttonText: "Okay",
				buttonAction: this.notEnoughAlertClicked,
				context: this
			},
			[TEST_FAIL_ALERT]: {
				title: "Hang on clever clogs",
				content: `The soup is in the pot. Don’t go wasting my poison checking potion!`,
				buttonText: "Oops, sorry!",
				buttonAction: this.testFailAlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `This looks delicious! Now let’s get to that party.`,
				buttonText: "Let’s go!",
				buttonAction: this.doSuccessTransition,
				context: this
			},
			[THREE_DROPS_ALERT]: {
				title: "That’s three",
				content: `Thanks. Now let’s use the potion to make sure we only put in edible ones.`,
				buttonText: "OK",
				buttonAction: this.threeDropsAlertClicked,
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
		this.basket_container.close = this.add.image(bounds.right*.7, bounds.top*.7, 'close_button')
			.setInteractive({useHandCursor: true})
			.on('pointerup', () => { this.basket_container.visible = false; });

		this.basket_container.add([this.big_basket, this.basket_container.close]);

		for (const obj of this.hidden_objects) {
			if (obj.name == 'pot') {
				obj.input.dropZone = true;
				this.pot = obj;
			} else if (obj.name == 'vial') {
				this.vial = obj;
				this.vial.input.draggable = true;
				this.vial.drag_image = this.add.image(0, 0, 'pipette');
				this.vial.on('dragstart', this.dragStartVial.bind(this))
						 .on('dragend', this.dragEndVial.bind(this))
						 .on('drop', (pointer, target) => {
							const bound = this.dropVial.bind(this, target);
							bound();
						 });
			} else {
				// Everything else is droppable too
				obj.input.dropZone = true;
			}
		} 

		this.edibles_menu_container = this.add.container(0, 0);
		this.edibles_menu = this.add.image(0, 0, 'edible');
		this.edibles_menu.setOrigin(0, 0);

		let menu_bounds = this.edibles_menu.getBounds();
		this.edibles_menu.close = this.add.image(menu_bounds.right, menu_bounds.top, 'close_button')
			.setOrigin(1, 0)
			.setInteractive({useHandCursor: true})
			.on('pointerup', () => {
				this.edibles_menu_container.visible = false;
				this.edibles_menu_container.alpha = 0;
			});
		// this.input.enableDebug(this.edibles_menu);
		this.edibles_menu_container.add([this.edibles_menu, this.edibles_menu.close])
		this.edibles_menu_container.alpha = 0;
		this.edibles_menu_container.visible = false;

		this.party = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'party');
		this.party.scale = 1.3;
		this.party.angle = 10;
		this.party.visible = false;

		this.tavern_audio = this.sound.add('tavern', {volume: .4});
	}

	chooseMagnifyingGlass() {
		// No magnifying glass in this scene
	}

	setObjectsInput(inputEnabled) {
		let to_disable = [...this.plants, ...this.hidden_objects, this.edibles_menu.close];
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

		// let alpha = this.basket_container.visible ? 0 : 1;

		// iterate shrooms
		for (const m of this.plants) {
			if (find(shrooms, m)) {
				let rxy = Phaser.Geom.Ellipse.Random(ellipse);

				//  - assign to shroom x,y
				m.x = rxy.x;
				m.y = rxy.y;
				m.angle = random(0, 360);
				m.alpha = !this.basket_container.visible;
				m.visible = true;
			} else {
				m.visible = false;
			}
		}

		if (this.basket_container.visible) {
			this.tweens.add({
				targets: shrooms,
				alpha: 1,
				duration: 750
			})
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
		if (drop_target == this.pot) {
			this.sound.play('potbubble');
			plant.visible = false;

			this.plant_drops.push(plant);

			if (plant.edible) {
				this.successful_drops.push(plant);
			}

			if (this.plant_drops.length == this.success_count) {
				this.link.setFrame('thumbsup');
				this.runAlert(THREE_DROPS_ALERT);
			}
		}
	}

	threeDropsAlertClicked() {
		this.stopAlert(THREE_DROPS_ALERT);
	}

	doSuccessTransition() {
		this.stopAlert(SUCCESS_ALERT);
		this.party.visible = true;
		this.overlay.visible = true;
		this.tavern_audio.play();

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
		this.beginFailureTransition();
	}

	beginFailureTransition() {
		this.setPlantsInput(false);

		if (this.basket_container.visible) {
			this.setObjectsInput(false);

			var visible_index = 0;
			this.shrooms_fall_tween = this.tweens.add({
				targets: this.plants,
				ease:'Power2',
				duration: 2000,
				y: "+="+GAME_HEIGHT,
				delay: function(target, targetKey, value, targetIndex, totalTargets, tween) {
					if (target.visible) {
						visible_index++;
						return visible_index * Phaser.Math.Between(0, 150);
					} else {
						return 0;
					}
				},
		    	onComplete: this.finishFailureTransition,
		    	onCompleteScope: this
			});
		} else {
			this.finishFailureTransition();
		}
	}

	finishFailureTransition() {
		this.addRandomMushrooms();
		this.setPlantsInput(true);
		this.setObjectsInput(true);
		this.plant_drops = [];
		this.successful_drops = [];
	}

}
