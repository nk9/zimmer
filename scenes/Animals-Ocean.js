import BaseScene, { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';

class Animals_Ocean extends BaseScene {
	constructor() {
        super(ANIMALS_OCEAN);
	}

	create() {
		console.log("create");
		super.create();

		this.run_time = 45; // scene timer length
	}

	startNextScene() {
		console.log("Animals-Ocean: startNextScene");
	}
}

export default Animals_Ocean;