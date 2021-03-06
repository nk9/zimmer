import { groupBy, sampleSize, shuffle, pull } from 'lodash-es';

import { SceneProgress, Layers } from './Base_Scene';
import { PLANTS_FLOWERS, PLANTS_LEAVES } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import OutlinePlantFlower from '../components/outline_plant_flower';

import Plants_Base, { SelectionMode } from './Plants_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let INTRO3_ALERT = 'INTRO3_ALERT';
let INTRO4_ALERT = 'INTRO4_ALERT';
let FLOWER2_ALERT = 'FLOWER2_ALERT';
let FLOWER3_ALERT = 'FLOWER3_ALERT';
let FLOWER_FAIL_ALERT = 'FLOWER_FAIL_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';

export default class Plants_Flowers extends Plants_Base {
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
		this.load.image('flower_closed', this.assets.flower_closed.jpg);
		this.load.image('flower_open', this.assets.flower_open.png);

		// Lock
		this.load.image('peacock', this.assets.peacock.png);
		this.load.image('peacock_outline', this.assets.peacock_outline.png);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);

	        // Get the flower if needed
	        const pd = this.plants_data[key];
	        const drag_image_key = key+'_drag_image';
			if (!this.textures.exists(drag_image_key)) {
				this.load.image(drag_image_key, this.assets.drag_images[key].png);
			}
	    }
	    this.chooseTargetFlowers();

        // Audio
        this.load.audio('garden', this.assets.garden.mp3);
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
	}

	createPlant(key, pd) {
		let f = new OutlinePlantFlower(this, key, pd);
		f.alpha = 0;

		return f;
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(420, 300, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'flower_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'flower_closed');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('garden', {volume: .4, loop: true});
		this.background_sound.play();
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

	clickedItem(object) {
		console.log(`clicked ${object.name}`);
	}

	createAlerts() {
		let ft = this.flower_targets;
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Not sure where you are?",
				content: "This is Hyrule! I need to get home fast so I have time to get ready for the party! Why don’t you come with me? ",
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
		this.runAlert(SUCCESS_ALERT);
	}

	plantDropped(plant, drop_target) {
		let target = this.flower_targets[this.flower_target_index];

		if (plant.color == target.color && plant.shape == target.shape) {
			this.flower_target_index++;

			if (this.flower_target_index == this.success_count) {
				this.link.setFrame('peacock');
				this.succeed();
			} else {
				this.link.setFrame('peacock');
				this.runAlert(`FLOWER${this.flower_target_index+1}_ALERT`);
			}
		} else {
			this.link.setFrame('peacock');
			this.runAlert(FLOWER_FAIL_ALERT, {
				title: "Not that one",
				content: `I’m looking for a ${target.color} flower with ${target.shape} petals.`,
				buttonText: "Alright",
				buttonAction: this.flowerFailAlertClicked,
				context: this
			});
		}
	}

	successAlertClicked() {
		this.stopAlert(SUCCESS_ALERT);
		this.beginSuccessTransition();
	}
}
