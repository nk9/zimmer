import BaseScene, { SceneProgress, Layers } from './base-scene';

class Animals_Base extends BaseScene {
	create() {
		super.create();

		this.animals = [];

		this.createBackground();
		this.createCallToAction();
		this.createAlerts();
		this.createAnimals();
	}

	update() {

	}
}

export default Animals_Base;