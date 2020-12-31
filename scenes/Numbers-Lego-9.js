import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_9, NUMBERS_LEGO_BOSS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicJpg from '../assets/pics/numbers/lego_9/*.jpg'
import numbersPicPng from '../assets/pics/numbers/lego_9/*.png'

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_9 extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_9);
	}

    nextSceneKey() {
        return NUMBERS_LEGO_BOSS;
    }

	preload() {
		super.preload();

		this.load.image('bookcase', numbersPicPng.bookcase);
		this.load.image('bookcase_open', numbersPicPng.bookcase_open);
	}

	loadOutlineImage(name) {
		this.load.image(name, numbersPicPng[name]);
		this.load.image(name+"_outline", numbersPicPng[name+"_outline"]);
	}

	create() {
		super.create();
		this.createGarmadon();
		this.run_time = 25; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(640, 330, 'green_swirl');
		
		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
		this.background_open = this.add.image(bg_x, center_y, 'bookcase_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(bg_x, center_y, 'bookcase');
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

	clickedItem(item) {
		console.log(`clicked ${item.name}`);
		
		switch(item.name) {
			// case 'box':	this.clickedBox(item); break;
			default:
		}
	}

	createBricks() {
		let brick_store = new BrickStore(this, 29, 6);

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3);
		brick_store.addRow(BSBrick.B1x6, BSBrick.B1x4);
		brick_store.addRow(BSBrick.B1x1, BSBrick.B1x2, BSBrick.B1x6);
		brick_store.addRow(BSBrick.B1x4, BSBrick.B1x7);
		brick_store.addRow(BSBrick.B1x8);
		brick_store.addRow(BSBrick.B1x5, BSBrick.B1x2);

		return brick_store;
	}

	keyZoneRect() {
		return {x: 560, y: 100, width: 150, height: 50};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	createRectangles() {
		this.rects_background = this.add.graphics();
		this.rects_background.fillStyle(0x000000, .6);
		this.rects_background.fillRoundedRect(13 * LEGO_GRID,
										 3  * LEGO_GRID,
										 11  * LEGO_GRID,
										 14 * LEGO_GRID);
		this.rects_background.setDepth(Layers.OVER_DOOR);
		this.rects_background.setAlpha(0);

		this.addRectangle(9, 1, 14, 5);
		this.addRectangle(9, 1, 14, 8);
		this.addRectangle(9, 1, 14, 11);
		this.addRectangle(9, 1, 14, 14);
	}

	callToActionRect() {
		return {x: 800, y: 600, width: 40, height: 64}
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "No!",
				content: "The power of the skull will be mine! These locks will definelty put a stop to you!",
				buttonText: "...",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Mwa ha ha!",
				content: "And this time I've made it a secret hidden door.",
				buttonText: "Hidden?",
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

export default Numbers_Lego_9;