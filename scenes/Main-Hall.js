import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';


class Main_Hall extends BaseScene {
	constructor() {
        super(MAIN_HALL);
	}

	create() {
		super.create();

		this.addButton(100, 100, 'Lego 10', NUMBERS_LEGO_10);
		this.addButton(100, 120, 'Lego 9', NUMBERS_LEGO_9);

		this.addButton(250, 100, 'Animals Ocean', ANIMALS_OCEAN);
		this.addButton(250, 120, 'Animals Cave', ANIMALS_CAVE);
		this.addButton(250, 140, 'Animals Forest', ANIMALS_FOREST);

		this.addButton(450, 100, 'Plants Leaves', PLANTS_LEAVES);
		this.addButton(450, 120, 'Plants Flowers', PLANTS_FLOWERS);
		this.addButton(450, 140, 'Plants Mushrooms', PLANTS_MUSHROOMS);
	}

	createAlerts() {
		return []
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