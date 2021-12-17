import { filter } from 'lodash-es'

import Base_Scene, { SceneProgress, Layers } from './Base_Scene'
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { nearestPointOnRect } from '../utilities/geom_utils'

import XrayAnimal from '../components/xray_animal';
import ScanChargeBar from '../components/scan_charge_bar'

export const SelectionMode = {
	NONE:    "none", 
	RAYGUN:  "raygun",
	GRABBER: "grabber"
}

export default class Time_Base extends Base_Scene {
	constructor(key) {
		super(key);

		// Subclasses need to set these
		this.scan_limit;
	}

	get category() {
		return "Time";
	}

	init() {
		this.selectionMode = SelectionMode.NONE;

		this.success_clocks = [];
	}

	preload() {
		super.preload();

		let keys = Object.keys(this.stored_data.items);
		for (const key of keys) {
	        this.loadOutlineImage(key);
		}
	}

	create() {
		super.create();

		this.clocks = [];

		this.createBackground();
		this.swirl.visible = false;
		this.background_sound.play();

		this.createItems();
		// this.createTools();
		this.createCallToAction();
		this.createClocks();

		this.portal_sound = this.sound.add('portal');
	}

	update() {
		// Swirl rotates visibly on success
		this.swirl.rotation += 0.01;
	}

	setClocksInput(handleInput) {
		for (const c of this.clocks) {
			// Leave success clocks out of the input toggling; they're always off
			if (!this.success_clocks.includes(c)) {
				c.input.enabled = handleInput;
			}
		}
	}

	succeed() {
		this.input.enabled = false;
		this.input.setDefaultCursor('default');
		this.unlockNextScene();

		// Fade out background sound
		this.tweens.add({
			targets: this.background_sound,
			volume: 0,
			duration: 2000
		});

		this.willBeginSuccessTransition();
	}

	// Overridden by subclasses to interrupt the success transition
	willBeginSuccessTransition() {
		this.beginSuccessTransition();
	}

	beginSuccessTransition() {
		this.background_sound.stop();
		this.sound.play('door_opens_heavy'); // TODO: change

		this.time.delayedCall(750, this.doSuccessTransition, [], this);
	}

	doSuccessTransition() {
		this.portal_sound.play();
		this.overlay.visible = true;

	    this.tweens.timeline({
	    	tweens: [
	    	{
	    		targets: this.overlay,
	    		duration: 3000,
	    		alpha: 1,
	    		delay: 3000
	    	}]
	    });

	    this.time.delayedCall(7000, this.startNextScene, [], this);
	}

	beginFailureTransition() {
		this.setClocksInput(false);
	}

	finishFailureTransition() {
		this.setClocksInput(true);
	}
}
