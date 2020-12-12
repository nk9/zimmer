import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import { NUMBERS_LEGO_9 } from '../constants/scenes';
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import Alert from '../components/alert';

const FAIL_ALERT = 'FailAlert';

class Numbers_Lego_9 extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_9);
	}

	create() {
		console.log("create");
		super.create();

		this.run_time = 45; // scene timer length
	}

	createBackgroundImages() {
		
	}

	createBricks() {

	}

	keyZoneRect() {
		return {x: 550, y: 330, width: 60, height: 120};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	createRectangles() {
	}

	callToActionRect() {
	}

	createCallToAction() {
	}

	createAlerts() {
	}

	fail() {
	}

	startNextScene() {
		console.log("Lego-9: startNextScene");
	}
}

export default Numbers_Lego_9;