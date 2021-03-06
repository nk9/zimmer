import Base_Scene, { SceneProgress, Layers } from './Base_Scene';

import Numbers_Base from './Numbers_Base'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_10, NUMBERS_9 } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

const INTRO1_ALERT = 'INTRO1_ALERT';
const INTRO2_ALERT = 'INTRO2_ALERT';
const FAIL_ALERT = 'FAIL_ALERT';

export default class Numbers_10 extends Numbers_Base {
	constructor() {
        super(NUMBERS_10);
	}

    nextSceneKey() {
        return NUMBERS_9;
    }

	preload() {
		super.preload();

		this.load.image('great_hall', this.assets.great_hall.jpg);
		this.load.image('great_hall_open', this.assets.great_hall_open.png);
	}

	create() {
		super.create();
		
		this.createGarmadon();
		this.run_time = 20; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		let swirl_x = center_x + 25;
		this.swirl = this.add.image(swirl_x, center_y, 'aqua_swirl');

		this.background_open = this.add.image(center_x, center_y, 'great_hall_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(center_x, center_y, 'great_hall');
		this.background_closed.setOrigin(0.5, 0.5);
	}

	clearSmoke() {
		this.emitter.stop();
		this.garmadon.visible = true;
	}

	clickGarmadon() {
		this.runAlert(INTRO1_ALERT);
	}

	clickIntro1Alert() {
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	clickIntro2Alert() {
		this.stopAlert(INTRO2_ALERT);

		this.tweens.add({
			targets: this.garmadon,
			alpha: 0,
			duration: 750,
			onComplete: () => { this.cta_closed_zone.input.enabled = true; },
			onCompleteScope: this
		})
	}

	createBricks() {
		let brick_store = new BrickStore(this, 29, 6);

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3, BSBrick.B1x2);
		brick_store.addRow(BSBrick.B2x4, BSBrick.B1x4);
		brick_store.addRow(BSBrick.B2x2, BSBrick.B2x3, BSBrick.B1x2);
		brick_store.addRow(BSBrick.B1x1, BSBrick.B1x1, BSBrick.B1x5);
		brick_store.addRow(BSBrick.B1x2, BSBrick.B2x2, BSBrick.B1x3);
		brick_store.addRow(BSBrick.B1x3, BSBrick.B1x5);

		return brick_store;
	}

	keyZoneRect() {
		return {x: 550, y: 330, width: 60, height: 120};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	callToActionRect() {
		return {x: 1100, y: 480, width: 40, height: 64}
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
		this.rects_background.visible = false;

		this.addRectangle(2, 5, 20, 5);
		this.addRectangle(2, 5, 18, 13);
		this.addRectangle(2, 5, 22, 13);
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Arrgh!",
				content: "Let's see you get past this door! Each lock needs a different key.",
				buttonText: "...",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Mwa ha ha!",
				content: "And each key is broken into 2 pieces!",
				buttonText: "Easy!",
				buttonAction: this.clickIntro2Alert,
				context: this
		},
			[FAIL_ALERT]: {
				title: "Whoops",
				content: "I need to find the right pieces faster next time!",
				buttonText: "Try Again",
				buttonAction: this.resetAfterFail,
				context: this
			},
		};

		return alerts;
	}

	fail() {
		super.fail();

		this.scene.run(FAIL_ALERT);
	}

}
