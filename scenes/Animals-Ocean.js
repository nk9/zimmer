import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';

import Animals_Base from './Animals-Base'

class Animals_Ocean extends Animals_Base {
	constructor() {
        super(ANIMALS_OCEAN);
	}

	create() {
		super.create();
	}
}

export default Animals_Ocean;