import BaseScene, { SceneProgress, Layers } from './base-scene';
import { CONCRETE_SCENE } from '../constants/scenes';

class Concrete_Scene extends BaseScene {
	constructor() {
        super(CONCRETE_SCENE);
	}

	create() {
		super.create();

		this.run_time = 45; // scene timer length
	}

	startNextScene() {
		console.log("Concrete-Scene: startNextScene");
	}
}

export default Concrete_Scene;