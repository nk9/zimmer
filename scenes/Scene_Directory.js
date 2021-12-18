import log from 'loglevel';

import Base_Scene, { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, CREDITS, SCENE_DIRECTORY,
		 NUMBERS_10, NUMBERS_9, NUMBERS_FIRST, NUMBERS_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS,
		 TIME_PHONES, TIME_SUNDIAL, TIME_BEDROOM } from '../constants/scenes';

export default class Scene_Directory extends Base_Scene {
	constructor() {
        super(SCENE_DIRECTORY);
	}

	create() {
		log.debug("Scene_Directory");

		this.addButton(100, 60, 'Main Hall', MAIN_HALL);
		this.addButton(100, 100, 'Lego First', NUMBERS_FIRST);
		this.addButton(100, 120, 'Lego Second', NUMBERS_SECOND);
		this.addButton(100, 140, 'Lego 10', NUMBERS_10);
		this.addButton(100, 160, 'Lego 9', NUMBERS_9);

		this.addButton(250, 60, 'Credits', CREDITS);
		this.addButton(250, 100, 'Animals Ocean', ANIMALS_OCEAN);
		this.addButton(250, 120, 'Animals Forest', ANIMALS_FOREST);
		this.addButton(250, 140, 'Animals Cave', ANIMALS_CAVE);

		this.addButton(450, 100, 'Plants Flowers', PLANTS_FLOWERS);
		this.addButton(450, 120, 'Plants Leaves', PLANTS_LEAVES);
		this.addButton(450, 140, 'Plants Mushrooms', PLANTS_MUSHROOMS);

		this.addButton(650, 100, 'Time Phones',  TIME_PHONES);
		this.addButton(650, 120, 'Time Sundial', TIME_SUNDIAL);
		this.addButton(650, 140, 'Time Bedroom', TIME_BEDROOM);	
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