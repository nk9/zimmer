import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9, NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { UNLOCKED_SCENES, COLLECTED_GEMS } from '../constants/storage';

import entryPicPng from '../assets/pics/entry/*.png';
import entryPicJpg from '../assets/pics/entry/*.jpg';
import audioMp3 from '../assets/audio/*.mp3'

const CAT_ALERT = "Cat-Alert";
const GRATE_ALERT = "GRATE_ALERT";

class Main_Hall extends BaseScene {
	constructor() {
        super(MAIN_HALL);
	}

	init() {
		this.levels = [];
	}

	storeLastScene() {
		// Never store the Main Hall
	}

	preload() {
		super.preload();

		this.load.image('entryhall', entryPicJpg.entryhall);
		this.load.image('map', entryPicPng.map);
		this.load.image('cat_big', entryPicPng.cat_big);
		this.load.image('gem_board', entryPicPng.gem_board);

		let keys = [...Object.keys(this.stored_data.items),
					...Object.keys(this.stored_data.map)];
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}

        this.load.audio('entry_background', audioMp3.entry_background);
	}

	loadOutlineImage(name) {
		this.load.image(name, entryPicPng[name]);
		this.load.image(name+"_outline", entryPicPng[name+"_outline"]);
	}

	create() {
		super.create();

		// this.createBareBones();
		this.createBackground();
		this.createItems();
		this.createMap();
		this.createGemBoard();
		this.createSceneElements();

		this.home.visible = false;
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
			[GRATE_ALERT]: {
				title: "Hmm…",
				content: "This air vent doesn't look firmly attached to the wall. When you touch it, it begins to move. There’s something behind here…",
				buttonText: "Remove grate",
				buttonAction: this.clickGrateAlert,
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

		for (const level of this.levels) {
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

		this.map_container.add([this.map, ...this.levels, close]);
		this.map_container.visible = false;
	}

	createGemBoard() {
		this.gems_container = this.add.container(GAME_WIDTH/2, GAME_HEIGHT/2);
		this.gem_board = this.add.image(0, 0, 'gem_board');

		let collected_gems = this.fetch(COLLECTED_GEMS);
		var sprites = [];

		for (const [scene_key, gem_data] of Object.entries(this.stored_data.gems)) {
			if (collected_gems.includes(scene_key)) {
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
		console.log(`clicked ${level.info.level_key}`);
		this.doSceneTransition(level.info.level_key);
	}

	clickedItem(item) {
		console.log(`clicked ${item.name}`);
		
		switch(item.name) {
			case 'cat':		this.clickedCat(item); break;
			case 'box':		this.clickedBox(item); break;
			case 'grate':	this.clickedGrate(item); break;
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
		this.cat_big.visible = true;
		this.runAlert(CAT_ALERT);
	}

	clickedGrate(item) {
		if (this.showOnceScene(GRATE_ALERT)) {
			this.runAlert(GRATE_ALERT);
		} else {
			this.openGems();
		}
	}

	clickCatAlert() {
		this.stopAlert(CAT_ALERT);
		this.cat_big.visible = false;
	}

	clickGrateAlert() {
		this.stopAlert(GRATE_ALERT);
		this.openGems();
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

	setLevelsInput(handleInput) {
		for (const l of this.levels) {
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

	////
	// Bare bones version
	////

	createBareBones() {
		this.addButton(100, 100, 'Lego First', NUMBERS_LEGO_FIRST);
		this.addButton(100, 120, 'Lego Second', NUMBERS_LEGO_SECOND);
		this.addButton(100, 140, 'Lego 10', NUMBERS_LEGO_10);
		this.addButton(100, 160, 'Lego 9', NUMBERS_LEGO_9);
		// this.addButton(100, 120, 'Lego Boss', NUMBERS_LEGO_BOSS);


		this.addButton(250, 100, 'Animals Ocean', ANIMALS_OCEAN);
		this.addButton(250, 120, 'Animals Forest', ANIMALS_FOREST);
		this.addButton(250, 140, 'Animals Cave', ANIMALS_CAVE);

		this.addButton(450, 100, 'Plants Flowers', PLANTS_FLOWERS);
		this.addButton(450, 120, 'Plants Leaves', PLANTS_LEAVES);
		this.addButton(450, 140, 'Plants Mushrooms', PLANTS_MUSHROOMS);
		// this.addButton(450, 160, 'Plants Party', PLANTS_PARTY);
	}

	addButton(x, y, title, key) {
		this.add.text(x, y, title)
			.setInteractive({useHandCursor: true})
			.on('pointerup', pointer => { this.startScene(key) });
	}
}

export default Main_Hall;
