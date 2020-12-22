import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9, NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicPng from '../assets/pics/entry/*.png';
import numbersPicJpg from '../assets/pics/entry/*.jpg';


class Main_Hall extends BaseScene {
	constructor() {
        super(MAIN_HALL);
	}

	storeLastScene() {
		// Never store the Main Hall
	}

	preload() {
		this.load.image('entryhall', numbersPicJpg.entryhall);
		this.load.image('map', numbersPicPng.map);

		this.load.image('village', numbersPicPng.map_lego_boss);
		this.load.image('village_glow', numbersPicPng.map_lego_boss_glow);

	}

	create() {
		super.create();

		this.createBareBones();
		// this.createBackground();
		// this.createTools();

		this.home.visible = false;
	}

	createAlerts() {
		return []
	}

	createBackground() {
		this.background = this.add.image(0, 0, 'entryhall');
		this.background.setOrigin(0, 0);
	}

	createTools() {
		this.map = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'map');

		let village = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'village');
		let village2 = this.add.image(GAME_WIDTH/2, GAME_HEIGHT/2, 'village_glow');
		village2.visible = false;

		let b = village.getBounds();
		let zone = this.add.zone(b.x, b.y, b.width, b.height);
		zone.setOrigin(0, 0);

		zone.setInteractive({useHandCursor: true})
			.on('pointerover', () => { village.visible = false; village2.visible = true;})
			.on('pointerout', () => {
				console.log("pointerout"); village.visible = true; village2.visible = false;})
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

	startScene(key) {
		this.scene.start(key);
		this.scene.shutdown();
	}
}

export default Main_Hall;
