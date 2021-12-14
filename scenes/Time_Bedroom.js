import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_BEDROOM } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME, FLAVOR_BDAY } from '../constants/storage';

import OutlineImage from '../components/outline_image';
import Clockface from '../components/clockface';
import moment from 'moment';

import Time_Base, { SelectionMode } from './Time_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';
let FAIL_ALERT = 'FAIL_ALERT';

export default class Time_Bedroom extends Time_Base {
	constructor() {
		super(TIME_BEDROOM);

		// initialize variables
		this.scan_limit = 5;
	}

	preload() {
		super.preload();

		// Images
		this.load.image('van_gogh', this.assets.background.jpg);
		this.load.image('clock_big', this.assets.wallclockBig.png);

		// let keys = Object.keys(this.stored_data.screens);
		// for (const key of keys) {
	 //        this.load.image(key, this.assets[key].png)
		// }
 
 		// Audio
 		this.load.audio('background_phones', this.assets.phonesFoley.mp3);
	}

	create() {
		super.create();

		this.clocks = [];
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(690, 300, 'navy_swirl');

		this.background_closed = this.add.image(0, 0, 'van_gogh');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_phones', {volume: .4, loop: true});
	}

	createCallToAction() {
        let timeStyle = {
            fontSize: '100px',
            fontFamily: 'digital7',
            align: "center",
            fill: '#f00'
        };
        this.timeText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, "3:45", timeStyle);
        this.timeText.setOrigin(0.5, 0.5);

        this.clock_big = this.add.image(400, 300, 'clock_big');
        this.clock_big.setOrigin(0.5, 0.5);
	    this.clockface = new Clockface(this, 200, 150, 180);
	    this.clockface.visible = true;
	    this.clockface.drawTime(12, 0);
	}

	createClocks() {
		let bday_str = this.game.config.storage.get(FLAVOR_BDAY);

		let bday = moment.utc(bday_str, 'YYYY-MM-DD')
		let today = moment.utc()
		let diff = today.diff(bday, 'days') + 1;

		console.log(`day diff=${diff}`)
	}

// 	clickKratts() {
// 		this.runAlert(INTRO1_ALERT);
// 	}
// 
// 	clickCallToAction() {
// 		this.runAlert(INTRO1_ALERT);
// 	}

	clickedItem(clicked_object) {
		switch(clicked_object.name) {
			// case 'button1': this.clickHomeButton1(); break;
			// case 'button2': this.clickHomeButton2(); break;
			// case 'button3': this.clickHomeButton3(); break;
			// case 'call1': this.clickCallButton1(); break;
			// case 'call2': this.clickCallButton2(); break;
			// case 'call3': this.clickCallButton3(); break;
		}
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
		};

		return alerts;
	}

// 	intro1AlertClicked() {
// 		this.kratts.setFrame('determined');
// 		this.stopAlert(INTRO1_ALERT);
// 		this.runAlert(INTRO2_ALERT);
// 	}
// 	intro2AlertClicked() {
// 		this.kratts.setFrame('normal');
// 		this.stopAlert(INTRO2_ALERT);
// 		this.runAlert(INTRO3_ALERT);
// 	}
// 	intro3AlertClicked() {
// 		this.kratts.setFrame('normal');
// 		this.stopAlert(INTRO3_ALERT);
// 		this.runAlert(INTRO4_ALERT);
// 	}
// 	intro4AlertClicked() {
// 		this.kratts.setFrame('thumbs');
// 		this.stopAlert(INTRO4_ALERT);
// 
// 		if (!this.animals_have_entered) {
// 			var tweens = [];
// 
// 			// Animate in animals
// 			for (const animal of this.animals) {
// 				tweens.push({
// 					targets: animal,
// 					x: animal.targetX,
// 					y: animal.targetY,
// 					ease: 'Sine.easeOut',
// 					duration: 2000,
// 					offset: 0 // All at once
// 				})
// 			}
// 
// 			tweens.push({
// 				targets: this.kratts,
// 				y: GAME_HEIGHT+350,
// 				ease: 'Sine',
// 				duration: 2000,
// 				offset: 0
// 			});
// 
// 	    	this.tweens.timeline({ tweens: tweens });
// 
// 			// Animate in tools
// 			this.revealTools();
// 
// 			this.animals_have_entered = true;
// 		}
// 	}

	willBeginSuccessTransition() {
		// this.tweens.add({
		// 	targets: this.kratts,
		// 	y: GAME_HEIGHT,
		// 	ease: 'Sine',
		// 	duration: 2000,
		// 	onComplete: () => {this.runAlert(SUCCESS_ALERT);},
		// 	onCompleteScope: this
		// });
	}

	doSuccessTransition() {
	}


	successAlertClicked() {
// 		this.kratts_christmas.play();
// 		this.stopAlert(SUCCESS_ALERT);
// 		this.party.visible = true;
// 		this.overlay.visible = true;
// 
// 	    var timeline = this.tweens.timeline({
// 	    	tweens: [{
// 				targets: this.party,
// 				scale: 1,
// 				angle: 0,
// 				duration: 12000,
// 			},{
// 	    		targets: this.overlay,
// 	    		alpha: 1,
// 	    		duration: 2500,
// 	    	}]
// 	    });
// 
// 	    this.time.delayedCall(14500, this.startNextScene, [], this);
	}

	fail() {
		this.runAlert(FAIL_ALERT);
	}

	failAlertClicked() {
		this.stopAlert(FAIL_ALERT);
		this.beginFailureTransition();
	}
}
