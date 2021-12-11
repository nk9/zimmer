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
		console.log("T_B constructor");
		super(key);

		// Subclasses need to set these
		this.scan_limit;
	}

	get category() {
		return "Time";
	}

	init() {
		console.log("T_B init");
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
		// this.background_sound.play();

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

// 	createAnimals() {
// 		for (const key in this.animals_data) {
// 			const ad = this.animals_data[key];
// 
// 			let animal = new XrayAnimal(this, key, ad.success, ad.targetX, ad.targetY, ad.scale);
// 			animal.on('drop', this.scanAnimal);
// 			animal.on('pointerdown', this.pointerDownAnimal.bind(this, animal));
// 
// 			if (ad.success) {
// 				this.success_animals.push(animal);
// 			}
// 
// 			this.animals.push(animal);
// 		}
// 	}

	pointerDownClock(pointer_down_clock) {
		console.log("pointer_down_clock");
// 		if (this.selectionMode == SelectionMode.RAYGUN) {
// 			this.sound.play('xray');
// 
// 			this.clickedXrayAnimal(pointer_down_animal);
// 		} else if (this.selectionMode == SelectionMode.GRABBER) {
// 			this.sound.play('grab');
// 		}

		// for (const a of this.animals) {
		// 	if (a == pointer_down_animal) {
		// 		a.setDepth(Layers.DRAGGING);
		// 	} else {
		// 		a.setDepth(Layers.OVER_POUCH);
		// 	}
		// }
	}

	setClocksInput(handleInput) {
		for (const a of this.clocks) {
			a.input.enabled = handleInput;
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
		this.swirl.visible = true;
		this.overlay.visible = true;

	    // var timeline = this.tweens.timeline({
	    // 	tweens: [{
	    // 		targets: this.background_closed,
	    // 		duration: 2000,
	    // 		alpha: 0,
	    // 	},{
	    // 		targets: this.overlay,
	    // 		duration: 2500,
	    // 		alpha: 1,
	    // 		offset: 7000
	    // 	}]
	    // });

	    this.time.delayedCall(9500, this.startNextScene, [], this);
	}

	beginFailureTransition() {
		this.setClocksInput(false);
// 		this.factText.visible = false;
// 		this.disperseAnimals();
// 
// 		if (typeof(this.resetCallToActionTween) === 'function') {
// 			tweens.push(this.resetCallToActionTween());
// 		}
// 
// 	    var timeline = this.tweens.timeline({
// 	    	tweens: tweens,
// 	    	onComplete: this.finishFailureTransition,
// 	    	onCompleteScope: this
// 	    });
	}

	finishFailureTransition() {
		// this.resetAnimals(this.animals);
		this.setClocksInput(true);
	}
}
