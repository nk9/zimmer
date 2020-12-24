import { groupBy, sampleSize, shuffle, pull } from 'lodash-es';

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
let FLOWER2_ALERT = 'Flower2_Alert';
let FLOWER3_ALERT = 'Flower3_Alert';
let FLOWER_FAIL_ALERT = 'Flower_Fail_Alert';
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

	        // Get the flower if needed
	        const pd = this.plants_data[key];
	        const drag_image_key = key+'_drag_image';
			if (!this.textures.exists(drag_image_key)) {
				this.load.image(drag_image_key, dragPicPng[key]);
			}
	    }
	    this.chooseTargetFlowers();

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

	chooseTargetFlowers() {
		let grouped_flowers = groupBy(this.plants_data, (item) => {
			return `${item.shape}-${item.color}`
		});
		let target_groups   = sampleSize(Object.keys(grouped_flowers), this.success_count);
		this.flower_targets = shuffle(target_groups.map((key) => { return grouped_flowers[key][0]; }));
		this.flower_target_index = 0;

		console.log(this.flower_targets);
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
		console.log(`clicked ${object.name}`);
	}

	createAlerts() {
		let ft = this.flower_targets;
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
				buttonText: "I’ll talk to it",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[INTRO3_ALERT]: {
				title: "What do you want?",
				content: `You need to go through the portal? I can open it for you but I need ${this.success_count} flowers for the spell.`,
				buttonText: "Flowers?",
				buttonAction: this.intro3AlertClicked,
				context: this
			},
			[INTRO4_ALERT]: {
				title: "Flowers!",
				content: `Bring them to me and I’ll open the portal for you. Let’s start with a ${ft[0].color} flower with ${ft[0].shape} petals.`,
				buttonText: "Okay",
				buttonAction: this.intro4AlertClicked,
				context: this
			},
			[FLOWER2_ALERT]: {
				title: "That’s good",
				content: `Alright, the next one is a ${ft[1].color} flower with ${ft[1].shape} petals.`,
				buttonText: "On it",
				buttonAction: this.flower2AlertClicked,
				context: this
			},
			[FLOWER3_ALERT]: {
				title: "Last one",
				content: `OK, but can you find a ${ft[2].color} flower with ${ft[2].shape} petals?`,
				buttonText: "Think so",
				buttonAction: this.flower3AlertClicked,
				context: this
			},
			[FLOWER_FAIL_ALERT]: {
				title: "Not that one",
				content: `Maybe try again?`,
				buttonText: "Alright",
				buttonAction: this.flowerFailAlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `You found all the right flowers. Thanks for your help! I can cast the spell to open the portal now.`,
				buttonText: "Thanks!",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	createTools() {
		super.createTools();

		// Make peacock a drop target
		for (const obj of this.hidden_objects) {
			if (obj.name == 'peacock') {
				obj.input.dropZone = true;
				this.peacock = obj;
			}
		}
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

	flower2AlertClicked() {
		this.link.setFrame('thumbsup');
		this.stopAlert(FLOWER2_ALERT);
	}

	flower3AlertClicked() {
		this.link.setFrame('cool');
		this.stopAlert(FLOWER3_ALERT);
		
	}

	flowerFailAlertClicked() {
		this.link.setFrame('notimpressed');
		this.stopAlert(FLOWER_FAIL_ALERT);
	}

	willBeginSuccessTransition() {
		// This alert needs to be created at runtime because success_animals
		// isn't populated until after createAlerts() is already run.
		this.runAlert(SUCCESS_ALERT);
	}

	plantDropped(plant, drop_target) {
		console.log(`dropped ${plant.name}`);

		let target = this.flower_targets[this.flower_target_index];

		if (plant.color == target.color && plant.shape == target.shape) {
			console.log("success!");
			this.flower_target_index++;

			if (this.flower_target_index == this.success_count) {
				console.log("All done!");
				this.link.setFrame('peacock');
				this.runAlert(SUCCESS_ALERT);
			} else {
				this.link.setFrame('peacock');
				this.runAlert(`Flower${this.flower_target_index+1}_Alert`);
			}
		} else {
			this.link.setFrame('peacock');
			this.runAlert(FLOWER_FAIL_ALERT);
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
