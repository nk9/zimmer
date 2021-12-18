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
let DOG_ALERT = 'DOG_ALERT';
let DOG_SUCCESS_ALERT = 'DOG_SUCCESS_ALERT';
let DOG_FAILURE_ALERT = 'DOG_FAILURE_ALERT';
let DOOR_ALERT = 'DOOR_ALERT';

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
 		this.load.image('dog_big', this.assets.terrier_portrait.png);

 		// Audio
 		this.load.audio('background_phones', this.assets.bedroomFoley.mp3);

 		// Video
 		this.load.video('wormhole', this.assets.wormhole.mp4);
	}

	create() {
		super.create();

		this.clocks = [];
		this.setItemsInput(false);
		this.dogIntroAlertShown = false;

		this.createSceneElements();
	}

	createBackground() {
		this.background_closed = this.add.image(0, 0, 'van_gogh');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('background_phones', {volume: .4, loop: true});

		this.createWormhole();
	}

	createWormhole() {
        this.transitionFade = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        this.transitionFade.setOrigin(0, 0);
        this.transitionFade.setDepth(Layers.TRANSITION);
        this.transitionFade.alpha = 0;
        this.transitionFade.visible = false;

		this.wormhole = this.add.video(GAME_WIDTH/2, GAME_HEIGHT/2, 'wormhole');
		this.wormhole.setOrigin(0.5, 0.5);
        this.wormhole.setDepth(Layers.TRANSITION);
        this.wormhole.alpha = 0;
        this.wormhole.visible = false;
	}

	createCallToAction() {
		this.halt = this.add.sprite(0-300, GAME_HEIGHT, 'halt', 'surprised');
		this.halt.setOrigin(1, 1);
		this.halt.setTint(0xaaaaaa);

		this.halt.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.halt.clearTint() })
			.on('pointerout', () => {
				if (this.halt.input.enabled) {
					this.halt.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickedHalt() });

		var tweens = [];

		tweens.push({
			targets: this.halt,
			x: this.halt.width,
			ease: 'Sine.easeOut',
			duration: 2500,
			delay: 1000
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	createSceneElements() {
		this.dog_big = this.add.image(0, GAME_HEIGHT, 'dog_big');
		this.dog_big.setOrigin(0, 1);
		this.dog_big.visible = false;
	}

	createDoorZone() {
		let rect = {x: 1100, y: 290, width: 20, height: 30};

		this.door_rect = this.add.rectangle(rect.x, rect.y, rect.width, rect.height, 0x000000, 0.1)
			.setOrigin(0, 0);
		this.door_rect.visible = false;

		this.door_zone = this.make.zone(rect)
			.setOrigin(0,0)
			.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.door_rect.visible = true; })
			.on('pointerout', () => { this.door_rect.visible = false; })
			.on('pointerup', pointer => {
				this.clickDoorZone()
			});
		// this.input.enableDebug(this.door_zone, 0xff0000);
	}

	clickDoorZone() {
		this.door_rect.destroy();
		this.door_zone.destroy();
		this.runAlert(DOOR_ALERT);
		
		this.tweens.add({
			targets: this.halt,
			x: this.halt.width,
			ease: 'Sine.easeOut',
			duration: 1500
		});
	}


	getRandomTime() {
		return Math.floor(Math.random() * 12*60);
	}

	createClocks() {
        this.clock_big = this.add.image(400, 200, 'clock_big');
        this.clock_big.setOrigin(0.5, 0.5);
	    this.clock_big.alpha = 0;
	    this.clockhands = new Clockhands(this, 200, 100, 120, 0);
	    this.clockhands.time = this.getRandomTime();
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
			case 'terrier':    this.clickDog(); break;
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
			[INTRO1_ALERT]: {
				title: "LOOK at that CEILING!",
				content: "This place is wild. Strange place for a path to lead, don’t you think? I don’t remember going through any doors. How did we end up inside? And how do we get out?",
				buttonText: "Let’s ask",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[DOG_ALERT]: {
				title: "OMGOMGOMG PPL!!!",
				content: "Hi, I’m Rover. Is it time for food???? The clocks in here say different times so I don’t know when I get to eat. I’m hungry! **SQUIRREL** Did you know that I’m hungry? Hi! Hello! LOOK AT ME!! Can we go play fetch? Is it time for food?",
				buttonText: "Uh, let me check",
				buttonAction: this.dogAlertClicked,
				context: this
			},
			[DOG_SUCCESS_ALERT]: {
				title: "Hey, you fixed the clocks!",
				content: "Oh, you're my favorite! Thankyouthankyouthankyou! This means it’s time for **Munch, munch** Huh? *Munch* Yeah, you can leave through one of the windows.",
				buttonText: "OK, enjoy dinner",
				buttonAction: this.dogSuccessAlertClicked,
				context: this
			},
			[DOG_FAILURE_ALERT]: {
				title: "Wait, what time is dinner?",
				content: "Cuz I'm hungry, you see. Or we could play fetch? Fetch is good, but I **LOVE** food. Mmmmm, Fancy Feast is my favorite… Hey, have you fixed those clocks yet?",
				buttonText: "Working on it!",
				buttonAction: this.dogFailureAlertClicked,
				context: this
			},
			[DOOR_ALERT]: {
				title: "You found the door!",
				content: "Good work, I would never have noticed that. Now let’s get out of here!",
				buttonText: "Thanks!",
				buttonAction: this.doorAlertClicked,
				context: this
			},
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

	clickedHalt() {
		this.runAlert(INTRO1_ALERT);
	}

	clickDog() {
		if (this.clockhands.time == this.targetTime) {
			this.dogIntroAlertShown = true;
			this.runAlert(DOG_SUCCESS_ALERT);
		} else if (!this.dogIntroAlertShown) {
			this.dogIntroAlertShown = true;
			this.runAlert(DOG_ALERT);
		} else {
			this.runAlert(DOG_FAILURE_ALERT)
		}
		this.dog_big.visible = true;
	}

	setTimersInput(inputEnabled) {
		let timers = this.items.filter(i => i.name.startsWith("timer"));

		for (const timer of timers) {
			timer.input.enabled = inputEnabled;
		}
	}

	intro1AlertClicked() {
		this.halt.setFrame('neutral');
		this.stopAlert(INTRO1_ALERT);

		this.tweens.add({
			delay: 500,
			targets: this.halt,
			x: 0,
			ease: 'Sine',
			duration: 1500,
			onComplete: () => {
				this.setItemsInput(true);
				this.setTimersInput(false); // Timers are items, so have to be set separately
			},
			onCompleteScope: this
		});
	}

	dogAlertClicked() {
		this.stopAlert(DOG_ALERT);
		this.dog_big.visible = false;
	}

	dogSuccessAlertClicked() {
		this.stopAlert(DOG_SUCCESS_ALERT);
		this.dog_big.visible = false;
		this.createDoorZone();
	}

	dogFailureAlertClicked() {
		this.stopAlert(DOG_FAILURE_ALERT);
		this.dog_big.visible = false;
	}

	doorAlertClicked() {
		this.stopAlert(DOOR_ALERT);
		this.succeed();
	}

	willBeginSuccessTransition() {
		this.wormhole.play(true);
		super.willBeginSuccessTransition();
	}

	doSuccessTransition() {
		this.portal_sound.play();
		this.overlay.visible = true;
		this.wormhole.visible = true;
		this.transitionFade.visible = true;

	    this.tweens.timeline({
	    	tweens: [{
	    		targets: [this.transitionFade, this.wormhole],
	    		duration: 2000,
	    		alpha: 1
	    	},{
	    		targets: this.overlay,
	    		duration: 3000,
	    		alpha: 1,
	    		delay: 3000
	    	}]
	    });

	    this.time.delayedCall(7000, this.startNextScene, [], this);
	}
}
