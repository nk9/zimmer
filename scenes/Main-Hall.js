import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9, NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import entryPicPng from '../assets/pics/entry/*.png';
import entryPicJpg from '../assets/pics/entry/*.jpg';
import audioMp3 from '../assets/audio/*.mp3'

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

		let keys = [...Object.keys(this.stored_data.entry),
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

		this.home.visible = false;
	}

	createAlerts() {
		return []
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

	createItems() {
		this.items = this.addImagesFromStoredData('entry', this.clickedItem);
	}

	clickedLevel(level) {
		console.log(`clicked ${level.info.level_key}`);
		this.doSceneTransition(level.info.level_key);
	}

	clickedItem(item) {
		console.log(`clicked ${item.name}`);
		
		switch(item.name) {
			case 'box':	this.clickedBox(item); break;
			default:
		}
	}

	clickedBox(box) {
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

	setLevelsInput(handleInput) {
		for (const l of this.levels) {
			l.input.enabled = handleInput;
		}
	}

	closeMap() {
		this.map_container.visible = false;
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
