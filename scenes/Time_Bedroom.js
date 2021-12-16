import log from 'loglevel';

import { SceneProgress, Layers } from './Base_Scene';
import { MAIN_HALL, TIME_BEDROOM } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';
import { FLAVOR_NAME, FLAVOR_BDAY } from '../constants/storage';

import OutlineImage from '../components/outline_image';
import Clockhands from '../components/clockhands';
import { formatMinutes } from '../utilities/time_utils'

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
		this.load.image('clock_digital', this.assets.clockDigital.png);
 
 		// Audio
 		this.load.audio('background_phones', this.assets.bedroomFoley.mp3);
	}

	create() {
		super.create();

		this.clocks = [];
		this.setTimersInput(false);
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

	}

	getRandomTime() {
		return Math.floor(Math.random() * 12*60);
	}

	createClocks() {
        this.clock_big = this.add.image(400, 200, 'clock_big');
        this.clock_big.setOrigin(0.5, 0.5);
	    this.clock_big.alpha = 0;
	    this.clockhands = new Clockhands(this, 200, 100, 120, 0);
	    this.clockhands.visible = true;
	    this.clockhands.alpha = 0;

	    this.targetTime = this.getRandomTime();
	    this.clock_digital = this.add.image(800, 470, 'clock_digital');
	    let bounds = this.clock_digital.getBounds();

        let timeStyle = {
            fontSize: '40px',
            fontFamily: 'digital7',
            align: "center",
            fill: '#f00'
        };
        this.timeText = this.add.text(bounds.centerX, bounds.centerY, formatMinutes(this.targetTime), timeStyle);
        this.timeText.setOrigin(0.5, 0.5);

        this.tween_queue = [];
	}

	clickedItem(clicked_object) {
		log.debug(`clicked '${clicked_object.name}'`);

		switch(clicked_object.name) {
			case 'puff':       this.clickPuff(); break;
			case 'wallclock':  this.clickWallClock(); break;
			case 'timer1hour': this.clickTimer1Hour(); break;
			case 'timer15min': this.clickTimer15Min(); break;
			case 'timer1min':  this.clickTimer1Min(); break;
		}
	}

	createAlerts() {
		let name = this.game.config.storage.get(FLAVOR_NAME);

		let alerts = {
		};

		return alerts;
	}

	clickWallClock() {
		this.tweens.add({
			targets: [this.clock_big, this.clockhands],
			duration: 1200,
			alpha: 1,
			onComplete: () => { this.setTimersInput(true) },
			onCompleteScope: this
		})
	}

	clickTimer1Hour() {
		this.enqueueTween(1200, 60)
	}

	clickTimer15Min() {
		this.enqueueTween(500, 15)
	}

	clickTimer1Min() {
		this.enqueueTween(100, 1)
	}

	enqueueTween(duration, time) {
		let new_tween = this.tweens.add({
	    	targets: [this.clockhands],
	    	duration: duration,
	    	props: {
	    		time: `+=${time}`
	    	},
			onComplete: () => { this.finishTween() },
			paused: true,
		})
		this.tween_queue.push(new_tween);

		if (!this.tween_queue[0].isPlaying()) {
			this.tween_queue[0].play();
		}
	}

	finishTween(tween) {
		// Remove first tween from array.
		if (this.tween_queue.length > 0) {
			this.tween_queue.shift();
		}

		if (this.tween_queue.length > 0) {
			this.tween_queue[0].play();
		}
	}

	clickPuff() {
		log.debug("puff clicked");
	}

	checkSuccess() {
		if (this.clockhands.time == this.targetTime) {
			console.log("success");
		}
	}

	setTimersInput(inputEnabled) {
		let timers = this.items.filter(i => i.name.startsWith("timer"));

		for (const timer of timers) {
			item.input.enabled = inputEnabled;
		}
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
