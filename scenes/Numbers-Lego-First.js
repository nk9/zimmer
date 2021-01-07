import Base_Scene, { SceneProgress, Layers } from './Base_Scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_FIRST, NUMBERS_LEGO_SECOND } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPicJpg from '../assets/pics/numbers/lego_first/*.jpg'
import numbersPicPng from '../assets/pics/numbers/lego_first/*.png'
import audioMp3 from '../assets/audio/*.mp3';

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_First extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_FIRST);
	}

    nextSceneKey() {
        return NUMBERS_LEGO_SECOND;
    }

	preload() {
		super.preload();

		this.load.image('abbey_closed', numbersPicJpg.abbey_closed);
		this.load.image('abbey_open', numbersPicPng.abbey_open);

        this.load.audio('ninja_nerds', audioMp3.ninja_nerds);
	}

	create() {
		super.create();

		this.createGarmadon();
		this.time.delayedCall(1900, this.playIntro, [], this);

		this.run_time = 10; // scene timer length
	}

	createBackgroundImages() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(center_x, center_y+100, 'blue_swirl');
		
		// Shifted over slightly to line up with the lego grid rectangles
		let bg_x = center_x + 10;
		this.background_open = this.add.image(bg_x, center_y, 'abbey_open');
		this.background_open.setOrigin(0.5, 0.5);
		this.background_open.scale = 1.6;

		this.background_closed = this.add.image(bg_x, center_y, 'abbey_closed');
		this.background_closed.setOrigin(0.5, 0.5);
		this.background_closed.scale = 1.6;
	}

	playIntro() {
		this.sound.play('ninja_nerds');
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
		let brick_store = new BrickStore(this, 32, 12);

		brick_store.addRow(BSBrick.B2x3);

		return brick_store;
	}

	keyZoneRect() {
		return {x: 550, y: 380, width: 110, height: 110};
	}

	pouchOpenPosition() {
		return {x: 36 * LEGO_GRID, y: 13 * LEGO_GRID};
	}

	createRectangles() {
		this.rects_background = this.add.graphics();
		this.rects_background.fillStyle(0x000000, .6);
		this.rects_background.fillRoundedRect(18 * LEGO_GRID,
										 10  * LEGO_GRID,
										 6  * LEGO_GRID,
										 10 * LEGO_GRID);
		this.rects_background.setDepth(Layers.OVER_DOOR);
		this.rects_background.setAlpha(0);
		this.rects_background.visible = false;

		this.addRectangle(2, 3, 20, 14, 1);
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Hahaha!",
				content: "I will have the power of the Skull of Hazza D’ur!",
				buttonText: "As If!",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "You won't find the key!",
				content: "And how will you know what shape of key you need? By clicking on the keyhole? Hahahaha! ",
				buttonText: "By clicking?",
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

export default Numbers_Lego_First;