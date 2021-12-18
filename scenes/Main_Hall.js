import log from 'loglevel';

import Base_Scene, { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, CREDITS,
		 NUMBERS_10, NUMBERS_9, NUMBERS_FIRST, NUMBERS_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS,
		 TIME_PHONES, TIME_SUNDIAL, TIME_BEDROOM } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { UNLOCKED_SCENES, COLLECTED_GEMS } from '../constants/storage';

const CAT_ALERT = "CAT_ALERT";
const CAT_RETURN_ALERT = "CAT_RETURN_ALERT";
const GRATE_ALERT = "GRATE_ALERT";
const DOOR_BLOCKED_ALERT = "DOOR_BLOCKED_ALERT";

export default class Main_Hall extends Base_Scene {
	constructor() {
        super(MAIN_HALL);
	}

	init() {
		this.levels = {};
	}

	storeLastScene() {
		// Never store the Main Hall
	}

	preload() {
		super.preload();

		this.load.image('entryhall', this.assets.entryhall.jpg);
		this.load.image('map', this.assets.map.png);
		this.load.image('cat_big', this.assets.cat_big.png);
		this.load.image('gem_board', this.assets.gem_board.png);

		let keys = [...Object.keys(this.stored_data.items),
					...Object.keys(this.stored_data.map)];
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}

        this.load.audio('poof', this.assets.portal2.mp3);
        this.load.audio('meow', this.assets.meow.mp3);
        this.load.audio('entry_background', this.assets.entry_background.mp3);
	}

	loadOutlineImage(name) {
		this.load.image(name, this.assets[name].png);
		this.load.image(name+"_outline", this.assets[name+"_outline"].png);
	}

	create() {
		super.create();

		this.createBackground();
		this.createItems();
		this.createMap();
		this.createGemBoard();
		this.createSceneElements();

		this.home.visible = false;
        this.total_gem_count = Object.keys(this.stored_data.gems).length;
	}

	createAlerts() {
		let alerts = {
			[CAT_ALERT]: {
				title: "Meowwww!",
				content: "Oh, you startled me! Have you looked in all the boxes yet?",
				buttonText: "Sorry!",
				buttonAction: this.clickCatAlert,
				context: this
			},
			[CAT_RETURN_ALERT]: {
				title: "Why, hello again",
				content: "I haven't seen you in awhile! A few things have changed since you’ve been gone, have a look around. And if you find Rover, tell him to keep his paws off my Fancy Feast!!",
				buttonText: "Will do",
				buttonAction: this.clickCatReturnAlert,
				context: this
			},
			[GRATE_ALERT]: {
				title: "Hmm…",
				content: "This air vent doesn't look firmly attached to the wall. When you touch it, it begins to move. There’s something behind here…",
				buttonText: "Remove grate",
				buttonAction: this.clickGrateAlert,
				context: this
			},
			[DOOR_BLOCKED_ALERT]: {
				title: "It's locked.",
				content: "There's no keyhole. There must be some other way to unlock it.",
				buttonText: "Keep searching",
				buttonAction: this.clickDoorBlockedAlert,
				context: this
			},
		};

		return alerts;
	}

	createBackground() {
		this.background = this.add.image(0, 0, 'entryhall');
		this.background.setOrigin(0, 0);
		this.background_sound = this.sound.add('entry_background', {volume: .4, loop: true});
		this.background_sound.play();
	}

	createMap() {
		this.map_container = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
		this.map = this.add.image(0, 0, 'map');

		this.levels = this.addImagesFromStoredData('map', this.clickedLevel);

		// Exclude levels that aren't unlocked
		let unlocked_scenes = this.fetch(UNLOCKED_SCENES);

		for (const level of Object.values(this.levels)) {
			if (!unlocked_scenes.includes(level.info.level_key)) {
				level.visible = false;
			}
		}

		// Create close button
		let bounds = this.map.getBounds();
		let close = this.add.image(bounds.right-10, bounds.top+10, 'close_button')
						.setInteractive({useHandCursor: true})
						.on('pointerup', () => { this.closeMap(); });

		// this.map_container.setInteractive();
		// this.input.enableDebug(this.map_container);

		this.map_container.add([this.map, ...Object.values(this.levels), close]);
		this.map_container.visible = false;
	}

	createGemBoard() {
		this.gems_container = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
		this.gem_board = this.add.image(0, 0, 'gem_board');

		this.collected_gems = this.fetch(COLLECTED_GEMS);
		var sprites = [];

		for (const [scene_key, gem_data] of Object.entries(this.stored_data.gems)) {
			if (this.collected_gems.includes(scene_key)) {
			//Show all gems
			// if (1){
				let gd = gem_data;

				let sprite = this.add.sprite(gd.x, gd.y, 'gems', gd.gem+'_thumb');
				sprites.push(sprite);
			}
		}

		// Create close button
		let bounds = this.gem_board.getBounds();
		let close = this.add.image(bounds.right-40, bounds.top+40, 'close_button')
						.setInteractive({useHandCursor: true})
						.on('pointerup', () => { this.closeGemBoard(); });

		this.gems_container.add([this.gem_board, close, ...sprites]);
		this.gems_container.visible = false;
	}

	createSceneElements() {
		this.cat_big = this.add.image(0, GAME_HEIGHT, 'cat_big');
		this.cat_big.setOrigin(0, 1);
		this.cat_big.visible = false;
	}

	clickedLevel(level) {
		log.debug(`clicked ${level.info.level_key}`);
		this.doSceneTransition(level.info.level_key);
	}

	clickedItem(item) {
		log.debug(`clicked ${item.name}`);
		
		switch(item.name) {
			case 'cat':			this.clickedCat(item); break;
			case 'clock':		this.clickedClock(item); break;
			case 'box':			this.clickedBox(item); break;
			case 'grate':		this.clickedGrate(item); break;
			case 'doorblock':	this.clickedDoor(item); break;
			default:
		}
	}

	clickedBox(box) {
		this.setItemsInput(false);
		this.setLevelsInput(false);

		let open_basket_tween = {
			targets: this.map_container,
			x: this.map_container.x,
			y: this.map_container.y,
			alpha: 1,
			scale: 1,
			ease: 'Sine',
			duration: 1000,
			onComplete: () => { this.setLevelsInput(true) },
			onCompleteScope: this
		};

		this.map_container.setPosition(box.x, box.y);
		this.map_container.setSize(box.width, box.height);
		this.map_container.visible = true;
		this.map_container.scale = .2;
		this.map_container.alpha = 0;

		this.tweens.add(open_basket_tween);
		this.basket_open = true;
	}

	clickedCat(item) {
		this.sound.play('meow');
		this.cat_big.visible = true;
		this.runAlert(CAT_RETURN_ALERT); // TODO: change back after reveal
	}

	clickedClock(item) {
		this.doSceneTransition(TIME_PHONES);
	}

	clickedGrate(item) {
		if (this.showOnceScene(GRATE_ALERT)) {
			this.runAlert(GRATE_ALERT);
		} else {
			this.openGems();
		}
	}

	clickedDoor(item) {
		if (this.collected_gems.length < this.total_gem_count) {
			this.runAlert(DOOR_BLOCKED_ALERT);
		} else {
			this.loadCredits();
		}
	}

	clickCatAlert() {
		this.stopAlert(CAT_ALERT);
		this.cat_big.visible = false;
	}

	clickCatReturnAlert() {
		this.stopAlert(CAT_RETURN_ALERT);
		this.cat_big.visible = false;
	}

	clickGrateAlert() {
		this.stopAlert(GRATE_ALERT);
		this.openGems();
	}

	clickDoorBlockedAlert() {
		this.stopAlert(DOOR_BLOCKED_ALERT);
	}

	openGems() {
		this.setItemsInput(false);
		this.gems_container.visible = true;

		this.tweens.add({
			targets: this.gems_container,
			alpha: 1,
			duration: 750
		});
	}

	loadCredits() {
		log.debug("load credits");
		this.doSceneTransition(CREDITS);
	}

	setLevelsInput(handleInput) {
		for (const l of Object.values(this.levels)) {
			l.input.enabled = handleInput;
		}
	}

	setItemsInput(handleInput) {
		for (const l of this.items) {
			l.input.enabled = handleInput;
		}
	}

	closeMap() {
		this.map_container.visible = false;
		this.setItemsInput(true);
	}

	closeGemBoard() {
		this.gems_container.visible = false;
		this.gems_container.alpha = 0;
		this.setItemsInput(true);
	}

	doSceneTransition(key) {
		this.setLevelsInput(false);
		this.sound.play('poof');
		this.background_sound.stop();
		this.overlay.visible = true;

	    this.tweens.timeline({
	    	tweens: [{
	    		targets: this.overlay,
	    		duration: 2500,
	    		alpha: 1,
	    		offset: 500
	    	}]
	    });

	    this.time.delayedCall(3000, this.startScene, [key], this);

	}

	startScene(key) {
		this.scene.start(key);
		this.scene.shutdown();
	}
}
