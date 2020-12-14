import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';
import Alert from '../components/alert';

import { NUMBERS_LEGO_10, NUMBERS_LEGO_9 } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

const FAIL_ALERT = 'FailAlert';

class Numbers_Lego_10 extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_10);
	}

	create() {
		super.create();

		this.run_time = 30; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'aqua_swirl');
		this.swirl.scale += .1; // Aqua swirl isn't quite large enough to fill the space

		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
		this.background_open = this.add.image(bg_x, center_y, 'tarnished_door_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(bg_x, center_y, 'tarnished_door');
		this.background_closed.setOrigin(0.5, 0.5);
	}

	createBricks() {
		let brick_store = new BrickStore(this, 29, 6);

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x2);
		brick_store.addRow(BSBrick.B2x4);
		brick_store.addRow(BSBrick.B2x2, BSBrick.B2x3, BSBrick.B2x2);
		brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);
		brick_store.addRow(BSBrick.B1x2);
		brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);

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

		this.addRectangle(2, 5, 20, 5);
		this.addRectangle(2, 5, 18, 13);
		this.addRectangle(2, 5, 22, 13);
	}

	callToActionRect() {
		return {x: 800, y: 600, width: 40, height: 64};
	}

	createCallToAction() {
		let cta_rect = this.callToActionRect();
	    let cta_closed = this.add.image(cta_rect.x, cta_rect.y, 'pouch_closed');
	    let cta_closed_outlined = this.add.image(cta_rect.x, cta_rect.y, 'pouch_closed_outlined');
	    let cta_closed_zone = this.add.zone(cta_rect.x, cta_rect.y, cta_rect.width, cta_rect.height)

	    cta_closed.scale = .2;
	    cta_closed_outlined.scale = .2;
	    cta_closed.setVisible(true);
	    cta_closed_outlined.setVisible(false);

	    return [cta_closed, cta_closed_outlined, cta_closed_zone];
	}

	createAlerts() {
		this.scene.add(FAIL_ALERT, new Alert(FAIL_ALERT), false, {
			title: "Whoops",
			content: "You're gonna have to be faster than that!",
			buttonText: "Try Again",
			buttonAction: this.resetAfterFail,
			context: this
		});

		return [FAIL_ALERT];
	}

	fail() {
		super.fail();

		this.scene.run(FAIL_ALERT);
	}

	startNextScene() {
        this.scene.start(NUMBERS_LEGO_9);
        this.scene.shutdown();
	}

}

export default Numbers_Lego_10;