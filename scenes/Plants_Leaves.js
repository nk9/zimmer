import { SceneProgress, Layers } from './Base_Scene';
import { PLANTS_LEAVES, PLANTS_MUSHROOMS } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT, DRAG_THRESHOLD } from '../constants/config';

import OutlinePlantLeaf from '../components/outline_plant_leaf';

import Plants_Base, { SelectionMode } from './Plants_Base';

let INTRO1_ALERT = 'INTRO1_ALERT';
let INTRO2_ALERT = 'INTRO2_ALERT';
let FAIL_ALERT   = 'FAIL_ALERT';
let SUCCESS_ALERT = 'SUCCESS_ALERT';

export default class Plants_Leaves extends Plants_Base {
	constructor() {
        super(PLANTS_LEAVES);

        // initialize class variables
		this.success_count = 3;
	}

    nextSceneKey() {
        return PLANTS_MUSHROOMS;
    }

	preload() {
		super.preload();

		// Doors
		this.load.image('hobbit_closed', this.assets.hobbit_closed.jpg);
		this.load.image('hobbit_open', this.assets.hobbit_open.png);

		// Lock
		this.load.image('harp_lock', this.assets.harp_lock.png);
		this.load.image('harp_lock_outline', this.assets.harp_lock_outline.png);
        
        // Plants
		for (const key in this.plants_data) {
	        this.loadOutlineImage(key);

	        // Get the leaf if needed
	        const pd = this.plants_data[key];
			if (!this.textures.exists(pd.leaf_type)) {
				this.load.image(pd.leaf_type, this.assets.drag_images[pd.leaf_type].png);
			}
	    }

	    // Triquetra
	    this.load.image('leaf_lock', this.assets.leaf_lock.png);
	    this.load.image('leaf_lock_bottom_left', this.assets.leaf_lock_bottom_left.png);
	    this.load.image('leaf_lock_bottom_right', this.assets.leaf_lock_bottom_right.png);
	    this.load.image('leaf_lock_top', this.assets.leaf_lock_top.png);

        // Audio
        this.load.audio('forest', this.assets.forest.mp3);
	}

	create() {
		super.create();
	}

	createPlant(key, pd) {
		let l = new OutlinePlantLeaf(this, key, pd);
		l.alpha = 0;
		
		return l;
	}

	createBackground() {
		let center_x = GAME_WIDTH/2,
			center_y = GAME_HEIGHT/2;

		this.swirl = this.add.image(360, 300, 'blue_swirl');

		this.background_open = this.add.image(0, 0, 'hobbit_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'hobbit_closed');
		this.background_closed.setOrigin(0, 0);

		this.background_sound = this.sound.add('forest', {volume: .4, loop: true});
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
		this.link.input.cursor = 'pointer';

		var tweens = [];

		tweens.push({
			targets: this.link,
			x: 0,
			y: GAME_HEIGHT,
			ease: 'Back',
			duration: 300
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });

	    this.createHarpLock();
	}

	createHarpLock() {
		this.harp_lock_container = this.add.container(360, 350);
		this.harp_lock = this.add.image(0, 0, 'harp_lock');
		this.harp_lock_outline = this.add.image(0, 0, 'harp_lock_outline');
		this.harp_lock_container.add(this.harp_lock);
		this.harp_lock_container.add(this.harp_lock_outline);

		let bounds = this.harp_lock.getBounds();
		this.harp_lock_container.setSize(bounds.width, bounds.height);

		this.harp_lock_outline.visible = false;

	    this.harp_lock_container.scale = 1;

	    this.harp_lock_container.setInteractive({useHandCursor: true})
	    	.on('pointerover', () => {
	    		this.harp_lock_outline.visible = true;
	    	})
	    	.on('pointerout', () => {
	    		this.harp_lock_outline.visible = false;
	    	})
			.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					this.harp_lock_container.visible = false;
					this.clickHarpLock();
				}
			});
	}

	clickLink() {
		this.link.input.enabled = false;
		this.link.clearTint();
		this.runAlert(INTRO1_ALERT);
	}

	clickHarpLock() {
		this.sound.play('twinkle');

		this.harp_lock_container.visible = false;
		this.leaf_lock_container.visible = true;

		this.tweens.add({
			targets: this.leaf_lock_container,
			x: 950,
			y: 200,
			alpha: 1,
			scale: 1,
			duration: 1000
		});
	}

	clickedItem(object) {
		
	}

	createAlerts() {
		let alerts = {
			[INTRO1_ALERT]: {
				title: "Welcome to Hyrule!",
				content: "I lost the key to my door! Do you think you could help me get it back?",
				buttonText: "You bet",
				buttonAction: this.intro1AlertClicked,
				context: this
			},
			[INTRO2_ALERT]: {
				title: "Thanks!",
				content: `Some of these plants have the right leaves to make a new key.`,
				buttonText: "Roger",
				buttonAction: this.intro2AlertClicked,
				context: this
			},
			[SUCCESS_ALERT]: {
				title: "Great work!",
				content: `You found all of the right leaves. Thanks for your help! Now what do you think is behind this door?`,
				buttonText: "I Dunno",
				buttonAction: this.successAlertClicked,
				context: this
			},
		};

		return alerts;
	}

	createTools() {
		super.createTools();

		// Create the triangle
		let bounds = this.harp_lock_container.getBounds();
		this.leaf_lock_container = this.add.container(bounds.x, bounds.y);

		let segments = ['leaf_lock', 'leaf_lock_top', 'leaf_lock_bottom_left', 'leaf_lock_bottom_right'];

		for (const segment of segments) {
			this[segment] = this.add.image(0, 0, segment);
			this[segment].visible = false;
			this[segment].depth = Layers.OVER_POUCH;
			this.leaf_lock_container.add(this[segment]);
		}

		let top_triangle = new Phaser.Geom.Triangle.BuildEquilateral(150, 0, 145);
		var top_zone = this.add.zone(0, 0, 300, 125);
		top_zone.setOrigin(.5, 1);
		top_zone.setInteractive({
			hitArea: top_triangle,
			hitAreaCallback: Phaser.Geom.Triangle.Contains,
			dropZone: true,
			useHandCursor: true});
		// this.input.enableDebug(top_zone, 0xff0000);
		top_zone.name = 'spikey';
		top_zone.lock_image = this.leaf_lock_top;
		top_zone.particle = this.createTriangleEmitter(top_triangle, top_zone);
		this.leaf_lock_container.add([top_zone, top_zone.particle]);

		let bottom_left_triangle = new Phaser.Geom.Triangle.BuildEquilateral(top_triangle.x3+5, 0, 135);
		var bottom_left_zone = this.add.zone(0, 0, 150, 125);
		bottom_left_zone.setOrigin(1, 0);
		bottom_left_zone.setInteractive({
			hitArea: bottom_left_triangle,
			hitAreaCallback: Phaser.Geom.Triangle.Contains,
			dropZone: true,
			useHandCursor: true});
		bottom_left_zone.name = 'round';
		bottom_left_zone.lock_image = this.leaf_lock_bottom_left;
		bottom_left_zone.particle = this.createTriangleEmitter(bottom_left_triangle, bottom_left_zone);
		this.leaf_lock_container.add([bottom_left_zone, bottom_left_zone.particle]);

		let bottom_right_triangle = new Phaser.Geom.Triangle.BuildEquilateral(top_triangle.x3-10, 0, 135);
		var bottom_right_zone = this.add.zone(0, 0, 150, 125);
		bottom_right_zone.setOrigin(0, 0);
		bottom_right_zone.setInteractive({
			hitArea: bottom_right_triangle,
			hitAreaCallback: Phaser.Geom.Triangle.Contains,
			dropZone: true,
			useHandCursor: true});
		bottom_right_zone.name = 'heart';
		bottom_right_zone.lock_image = this.leaf_lock_bottom_right;
		bottom_right_zone.particle = this.createTriangleEmitter(bottom_right_triangle, bottom_right_zone);
		this.leaf_lock_container.add([bottom_right_zone, bottom_right_zone.particle]);

		this.leaf_lock.visible = true;
		this.leaf_lock_container.visible = false;
		this.leaf_lock_container.alpha = 0;
		this.leaf_lock_container.scale = .3;
	}

	createTriangleEmitter(triangle, zone) {
		let bounds = zone.getBounds();

	    let particle = this.add.particles('spark');
	    let emitter = particle.createEmitter({
	    	on: false,
	        x: bounds.x,
	        y: bounds.y,
	        blendMode: 'SCREEN',
	        scale: { start: 0.2, end: 0 },
	        speed: { min: -100, max: 100 },
	        quantity: 10,
	        emitZone: {
		        source: triangle,
		        type: 'edge',
		        quantity: 50
	        }
	    });
		particle.setDepth(Layers.POUCH);

		return particle;
	}

	intro1AlertClicked() {
		this.link.setFrame('laugh');
		this.stopAlert(INTRO1_ALERT);
		this.runAlert(INTRO2_ALERT);
	}

	intro2AlertClicked() {
		this.link.setFrame('happy');
		this.stopAlert(INTRO2_ALERT);

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
}
