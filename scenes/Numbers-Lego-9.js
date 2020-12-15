import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import Alert from '../components/alert';

import { NUMBERS_LEGO_9 } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicJpg from '../assets/pics/numbers/lego_9/*.jpg'
import numbersPicPng from '../assets/pics/numbers/lego_9/*.png'

const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_9 extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_9);
	}

	preload() {
		super.preload();

		this.load.image('bookcase', numbersPicPng.bookcase);
		this.load.image('bookcase_open', numbersPicPng.bookcase_open);
	}

	create() {
		console.log("create");
		super.create();

		this.run_time = 45; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'blue_swirl');
		
		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
		this.background_open = this.add.image(bg_x, center_y, 'bookcase_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(bg_x, center_y, 'bookcase');
		this.background_closed.setOrigin(0.5, 0.5);	
	}

	createBricks() {
		let brick_store = new BrickStore(this, 29, 6);

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x4, BSBrick.B1x4);
		// brick_store.addRow(BSBrick.B1x6);
		// brick_store.addRow(BSBrick.B1x3, BSBrick.B1x1, BSBrick.B1x6);
		// brick_store.addRow(BSBrick.B1x4, BSBrick.B1x5);
		// brick_store.addRow(BSBrick.B1x8);
		// brick_store.addRow(BSBrick.B1x7, BSBrick.B1x2);

		return brick_store;
	}

	keyZoneRect() {
		return {x: 550, y: 330, width: 60, height: 120};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	createRectangles() {
		this.rects_background = this.add.graphics();
		this.rects_background.fillStyle(0x000000, .6);
		this.rects_background.fillRoundedRect(17 * LEGO_GRID,
										 3  * LEGO_GRID,
										 8  * LEGO_GRID,
										 17 * LEGO_GRID);
		this.rects_background.setDepth(Layers.OVER_DOOR);
		this.rects_background.setAlpha(0);

		this.addRectangle(9, 1, 20, 5);
		this.addRectangle(9, 1, 20, 8);
		this.addRectangle(9, 1, 20, 11);
		this.addRectangle(9, 1, 20, 14);
	}

	callToActionRect() {
	}

	createCallToAction() {
		return [null, null, null]; // Fill this in from lego 10
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