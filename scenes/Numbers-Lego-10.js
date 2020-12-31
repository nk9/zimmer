import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_10, NUMBERS_LEGO_9 } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicJpg from '../assets/pics/numbers/lego_10/*.jpg'
import numbersPicPng from '../assets/pics/numbers/lego_10/*.png'

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';

class Numbers_Lego_10 extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_10);
	}

    nextSceneKey() {
        return NUMBERS_LEGO_9;
    }

	preload() {
		super.preload();

		this.load.image('great_hall', numbersPicJpg.great_hall);
		this.load.image('great_hall_open', numbersPicPng.great_hall_open);
	}

	loadOutlineImage(name) {
		this.load.image(name, numbersPicPng[name]);
		this.load.image(name+"_outline", numbersPicPng[name+"_outline"]);
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
			duration: 750
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

export default Numbers_Lego_10;