import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9, NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND,
		 ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
		 PLANTS_LEAVES, PLANTS_FLOWERS, PLANTS_MUSHROOMS } from '../constants/scenes';


class Main_Hall extends BaseScene {
	constructor() {
        super(MAIN_HALL);
	}

	storeLastScene() {
		// Never store the Main Hall
	}

	create() {
		super.create();

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

		this.home.visible = false;
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