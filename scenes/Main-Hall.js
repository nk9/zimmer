import BaseScene, { SceneProgress, Layers } from './base-scene';
import { MAIN_HALL,
		 NUMBERS_LEGO_10, NUMBERS_LEGO_9,
		 ANIMALS_OCEAN } from '../constants/scenes';


class Main_Hall extends BaseScene {
	constructor() {
        super(MAIN_HALL);
	}

	create() {
		super.create();

		this.addButton(100, 100, 'Lego 10', NUMBERS_LEGO_10);
		this.addButton(100, 120, 'Lego 9', NUMBERS_LEGO_9);

		this.addButton(250, 100, 'Animals Ocean', ANIMALS_OCEAN);
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