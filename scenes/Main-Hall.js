import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9, NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import PointerOutlineImage from '../components/pointer_outline_image';

import entryPicPng from '../assets/pics/entry/*.png';
import entryPicJpg from '../assets/pics/entry/*.jpg';


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
	}

	createItems() {
		this.items = this.addImagesFromStoredData('entry', this.clickedItem);
	}

	addImagesFromStoredData(data_name, callback) {
		var images = [];

		for (const [key, image_data] of Object.entries(this.stored_data[data_name])) {
			if ('x' in image_data && 'y' in image_data) {
				let image = new PointerOutlineImage(this, key, image_data);

				image.on('pointerdown', callback.bind(this, image));
				
				images.push(image);
			}
		}

		return images;
	}

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

	clickedLevel(level) {
		console.log(`clicked ${level.name}`);
	}

	clickedItem(item) {
		console.log(`clicked ${item.name}`);
	}

	clickedPlinth() {
		this.map_container.visible = true;
	}

	closeMap() {
		this.map_container.visible = false;
	}

	startScene(key) {
		this.scene.start(key);
		this.scene.shutdown();
	}
}

export default Main_Hall;
