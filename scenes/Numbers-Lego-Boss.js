import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_BOSS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import numbersPics from '../assets/pics/numbers/lego_boss/*.*'

const INTRO1_ALERT = 'Intro1_Alert';
const INTRO2_ALERT = 'Intro2_Alert';
const FAIL_ALERT = 'FailAlert';


class Numbers_Lego_Boss extends Numbers_Lego {
	constructor() {
        super(NUMBERS_LEGO_BOSS);
	}

	preload() {
		super.preload();

		console.log(numbersPics);
		this.load.image('forge', numbersPics.forge);
	}

	create() {
		super.create();

		// this.createGarmadon();
		this.createBoss();

		this.run_time = 10; // scene timer length
	}

	createBackgroundImages() {
		this.swirl = {};

		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.background_closed = this.add.image(center_x, center_y, 'forge');
		this.background_closed.setOrigin(0.5, 0.5);
	}

	createBoss() {
		let boss = this.add.sprite(GAME_WIDTH/2, GAME_HEIGHT/2, 'vangelis_boss');

		this.anims.create({
			key: 'idle',
			frames: this.anims.generateFrameNumbers('vangelis_boss'),
			frameRate: 10,
			repeat: -1
		});

		boss.play('idle');
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

		this.addRectangle(2, 3, 20, 14, 1);
	}

	callToActionRect() {
		return {x: 800, y: 600, width: 40, height: 64}
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

export default Numbers_Lego_Boss;