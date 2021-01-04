import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_SECOND, NUMBERS_LEGO_10 } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicJpg from '../assets/pics/numbers/lego_second/*.jpg'
import numbersPicPng from '../assets/pics/numbers/lego_second/*.png'

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


export default class Numbers_Lego_Second extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_SECOND);
        
	}

    nextSceneKey() {
        return NUMBERS_LEGO_10;
    }

	preload() {
		super.preload();

		this.load.image('wood_door_closed', numbersPicJpg.wood_door_closed);
		this.load.image('wood_door_open', numbersPicPng.wood_door_open);
	}

	create() {
		console.log("create");
		super.create();

		this.createGarmadon();

		this.run_time = 10; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y, 'blue_swirl');
		
		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
		this.background_open = this.add.image(bg_x, center_y, 'wood_door_open');
		this.background_open.setOrigin(0.5, 0.5);

		this.background_closed = this.add.image(bg_x, center_y, 'wood_door_closed');
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

		brick_store.addRow(BSBrick.B1x2, BSBrick.B2x2);
		brick_store.addRow(BSBrick.B2x4);


		return brick_store;
	}

	keyZoneRect() {
		return {x: 550, y: 330, width: 110, height: 110};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	createRectangles() {
		this.rects_background = this.add.graphics();
		this.rects_background.fillStyle(0x000000, .6);
		this.rects_background.fillRoundedRect(18 * LEGO_GRID,
										 9  * LEGO_GRID,
										 4  * LEGO_GRID,
										 7 * LEGO_GRID);
		this.rects_background.setDepth(Layers.OVER_DOOR);
		this.rects_background.setAlpha(0);
		this.rects_background.visible = false;

		this.addRectangle(2, 3, 19, 11);
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "What!",
				content: "I don't know how you made it past my lock. But I've got you now!",
				buttonText: "...",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Mwa ha ha!",
				content: "I've split my hidden key into 2 pieces! You'll never figure it out!",
				buttonText: "2 pieces?",
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

