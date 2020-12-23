import { SceneProgress, Layers } from './base-scene';
import { PLANTS_FLOWERS, PLANTS_LEAVES } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import OutlinePlantFlower from '../components/outline_plant_flower';

import plantPicJpg from '../assets/pics/plants/flowers/*.jpg'
import plantPicPng from '../assets/pics/plants/flowers/*.png'
import dragPicPng  from '../assets/pics/plants/flowers/drag_images/*.png'
import linkPicPng  from '../assets/pics/sprites/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Plants_Base, { SelectionMode } from './Plants-Base';

let INTRO1_ALERT = 'Intro1_Alert';
let INTRO2_ALERT = 'Intro2_Alert';
let INTRO3_ALERT = 'Intro3_Alert';
let INTRO4_ALERT = 'Intro4_Alert';
let FAIL_ALERT   = 'Fail_Alert';
let SUCCESS_ALERT = 'Success_Alert';

class Plants_Flowers extends Plants_Base {
	constructor() {
        super(PLANTS_FLOWERS);

        // initialize class variables
		this.success_count = 3;
	}

    nextSceneKey() {
        return PLANTS_LEAVES;
    }

	preload() {
		super.preload();

		// Doors
		this.load.image('flower_closed', plantPicJpg.flower_closed);
		this.load.image('flower_open', plantPicPng.flower_open);

		// Lock
		this.load.image('peacock', plantPicPng.peacock);
		this.load.image('peacock_outline', plantPicPng.peacock_outline);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);

	    }

        // Audio
        this.load.audio('woosh', audioMp3.woosh);
        this.load.audio('twinkle', audioMp3.twinkle);
	}

	loadOutlineImage(name) {
		this.load.image(name, plantPicPng[name]);
		this.load.image(name+"_outline", plantPicPng[name+"_outline"]);
	}

	create() {
		super.create();
	}

	createPlant(key, pd) {
		let f = new OutlinePlantFlower(this, key, pd);
		f.alpha = 0;

		return f;
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(360, 300, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'flower_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'flower_closed');
		this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		this.sound.play('woosh', {volume: .3});

		this.link = this.add.sprite(0, GAME_HEIGHT+256, 'link', 'wave');
		this.link.setOrigin(0, 1);
		this.link.setTint(0xaaaaaa);

		this.link.setInteractive({useHandCursor: true})
			.on('pointerover', () => { this.link.clearTint() })
			.on('pointerout', () => {
				if (this.link.input.enabled) {
					this.link.setTint(0xaaaaaa);
				}
			})
			.on('pointerup', pointer => { this.clickLink() });

		var tweens = [];

		tweens.push({
			targets: this.link,
			x: 0,
			y: GAME_HEIGHT,
			ease: 'Back',
			duration: 300
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	clickLink() {
		this.link.input.enabled = false;
		this.link.clearTint();
		this.runAlert(INTRO1_ALERT);
	}

	clickHiddenObject(object) {
		
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Not sure where you are?",
				content: "This is Hyrule! I need to get home fast so I have time to get ready for the party! Why don't you come with me? ",
				buttonText: "Okay!",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Uh oh!",
				content: `That peacock is blocking the portal.`,
				buttonText: "I'll go talk to it.",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[INTRO3_ALERT]: {
				title: "What do you want?",
				content: `You need to go through the portal? I can open it for you but I need four flowers for the spell.`,
				buttonText: "Flowers?",
				buttonAction: this.intro3AlertClicked,
				context: this
			},
			[INTRO4_ALERT]: {
				title: "Flowers!",
				content: `I'll give you a list of the ones to find. Bring them to me and I'll open the portal for you.`,
				buttonText: "Okay",
				buttonAction: this.intro4AlertClicked,
				context: this
			},
			// [FAIL_ALERT]: {
			// 	title: "Time to recharge",
			// 	content: `We think there are ${this.success_count} invertebrates out there, but we are out of juice. We will be right back!`,
			// 	buttonText: "OK :(",
			// 	buttonAction: this.failAlertClicked,
			// 	context: this
			// },
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `right flowers. Thanks for your help! Now what do you think is behind this door?`,
				buttonText: "I Dunno",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	createTools() {
		super.createTools();


	}

// 	createTriangleEmitter(triangle, zone) {
// 		let bounds = zone.getBounds();
// 
// 	    let particle = this.add.particles('spark');
// 	    let emitter = particle.createEmitter({
// 	    	on: false,
// 	        x: bounds.x,
// 	        y: bounds.y,
// 	        blendMode: 'SCREEN',
// 	        scale: { start: 0.2, end: 0 },
// 	        speed: { min: -100, max: 100 },
// 	        quantity: 10,
// 	        emitZone: {
// 		        source: triangle,
// 		        type: 'edge',
// 		        quantity: 50
// 	        }
// 	    });
// 		particle.setDepth(Layers.POUCH);
// 
// 		return particle;
// 	}

	intro1AlertClicked() {
		this.link.setFrame('wave');
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.link.setFrame('peacock');
		this.stopAlert(INTRO2_ALERT);
		this.runAlert(INTRO3_ALERT);
	}
	intro3AlertClicked() {
		this.link.setFrame('peacock');
		this.stopAlert(INTRO3_ALERT);
		this.runAlert(INTRO4_ALERT);
	}	
	intro4AlertClicked() {
		this.link.setFrame('thumbsup');
		this.stopAlert(INTRO4_ALERT);
		
		if (!this.plants_have_entered) {
			var tweens = [];

			// Animate in plants
			for (const animal of this.plants) {
				tweens.push({
					targets: animal,
					alpha: 1,
					ease: 'Sine.easeOut',
					duration: 1500,
					offset: 0 // All at once
				})
			}

	    	this.tweens.timeline({ tweens: tweens });

			// Animate in tools
			this.revealTools();

			this.plants_have_entered = true;
		}
	}

	willBeginSuccessTransition() {
		// This alert needs to be created at runtime because success_animals
		// isn't populated until after createAlerts() is already run.
		this.runAlert(SUCCESS_ALERT);
	}

	plantDropped(plant, drop_target) {
		if (plant.leaf_type == drop_target.name) {
			drop_target.lock_image.visible = true;
			drop_target.particle.emitters.list[0].explode(50);

			drop_target.input.enabled = false;
			this.successful_drops.push(drop_target);

			if (this.successful_drops.length == this.success_count) {
				this.succeed();
			}
		} else {
			console.log("too bad");
		}
	}

	successAlertClicked() {
		this.stopAlert(SUCCESS_ALERT);
		this.beginSuccessTransition();
	}


// 	fail() {
// 		this.runAlert(FAIL_ALERT);
// 	}
// 
// 	failAlertClicked() {
// 		this.stopAlert(FAIL_ALERT);
// 		this.beginFailureTransition();
// 	}
}

export default Plants_Flowers;
