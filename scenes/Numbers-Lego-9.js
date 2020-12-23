import BaseScene, { SceneProgress, Layers } from './base-scene';

import Numbers_Lego from './Numbers-Lego'
import Brick, { LEGO_GRID } from '../components/brick';
import BrickStore, { BSBrick } from '../components/brick_store';

import { NUMBERS_LEGO_9 } from '../constants/scenes';
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

    // nextSceneKey() {
    // 	// TODO: implement the boss level
    //     return NUMBERS_LEGO_BOSS;
    // }

	preload() {
		super.preload();

		this.load.image('bookcase', numbersPicPng.bookcase);
		this.load.image('bookcase_open', numbersPicPng.bookcase_open);
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
	createGarmadon() {
		// The man himself
		this.garmadon = this.add.image(GAME_WIDTH/2, GAME_HEIGHT, 'garmadon');
		this.garmadon.scale = .5;
		this.garmadon.setOrigin(.5, 1);
		this.garmadon.setTint(0xaaaaaa);
		this.garmadon.visible = false;

		this.garmadon.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.garmadon.clearTint() })
			.on('pointerout', () => {
				if (this.garmadon.input.enabled) {
					this.garmadon.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickGarmadon() });

		let bounds = this.garmadon.getBounds();
	    let particle = this.add.particles('smoke_purple');
	    this.emitter = particle.createEmitter({
	        blendMode: 'SCREEN',
	        scale: { start: 1, end: 2 },
	        speed: { min: -100, max: 100 },
	        quantity: 5,
	        emitZone: {
		        source: new Phaser.Geom.Triangle(bounds.left, bounds.top, bounds.right, bounds.top, bounds.centerX, bounds.bottom),
		        type: 'random',
		        quantity: 20
	        },
	        lifespan: 300
	    });
		// particle.setDepth(Layers.OVER_DOOR);

		this.time.delayedCall(1500, this.clearSmoke, [], this);
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

		brick_store.addRow(BSBrick.B1x2, BSBrick.B1x3);
		brick_store.addRow(BSBrick.B1x6, BSBrick.B1x4);
		brick_store.addRow(BSBrick.B1x1, BSBrick.B1x2, BSBrick.B1x6);
		brick_store.addRow(BSBrick.B1x4, BSBrick.B1x7);
		brick_store.addRow(BSBrick.B1x8);
		brick_store.addRow(BSBrick.B1x5, BSBrick.B1x2);

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
				title: "No!",
				content: "The power of the skull will be mine! These locks will definelty put a stop to you!",
				buttonText: "...",
				buttonAction: this.clickIntro1Alert,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Mwa ha ha!",
				content: "And this time I've made a secret hidden door.",
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