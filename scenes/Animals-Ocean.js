import { SceneProgress, Layers } from './base-scene';
import { ANIMALS_OCEAN } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import Alert from '../components/alert';

import animalPicJpg from '../assets/pics/animals/ocean/*.jpg'
import animalPicPng from '../assets/pics/animals/ocean/*.png'
import audioMp3 from '../assets/audio/*.mp3'

import Animals_Base from './Animals-Base';

let INTRO_ALERT = 'Intro_Alert';

class Animals_Ocean extends Animals_Base {
	preload() {
		// Images
		this.load.image('underwater_door_closed', animalPicJpg.underwater_door_closed);
		this.load.image('underwater_door_open', animalPicPng.underwater_door_open);
        this.load.image('amphisub', animalPicPng.amphisub);
        this.load.image('amphisub_outline', animalPicPng.amphisub_outline);

        // Audio
        this.load.audio('splash_bubble', audioMp3.splash_bubble);
	}
	
	constructor() {
        super(ANIMALS_OCEAN);
	}

	create() {
		super.create();

		// this.input.setDefaultCursor('url(assets/pics/raygun.png), pointer');
	}

	createBackground() {
// 		let center_x = GAME_WIDTH/2,
// 			center_y = GAME_HEIGHT/2;
// 
// 		this.swirl = this.add.image(center_x, center_y, 'aqua_swirl');
// 		this.swirl.scale += .1; // Aqua swirl isn't quite large enough to fill the space

		this.background_open = this.add.image(0, 0, 'underwater_door_open');
		this.background_open.setOrigin(0, 0);

		this.background_closed = this.add.image(0, 0, 'underwater_door_closed');
		this.background_closed.setOrigin(0, 0);
	}

	createCallToAction() {
		this.sound.play('splash_bubble');

		this.submarine = this.add.image(0, -271, 'amphisub'); // Height of the image
		this.submarine.setOrigin(0, 0);
		this.submarine_outline = this.add.image(0, -271, 'amphisub_outline'); // Height of the image
		this.submarine_outline.setOrigin(0, 0);
		this.submarine_outline.visible = false;
		console.log(this.submarine.getBounds());

		this.submarine_zone = this.add.zone(0, 0, 250, 271);
		this.submarine_zone.setOrigin(0,0);
		this.submarine_zone.setInteractive({ useHandCursor: true })
			.on('pointerup', pointer => {
				console.log("clickeddddd");
			})
			.on('pointerover', pointer => {
				this.submarine.visible = false;
				this.submarine_outline.visible = true;
			})
			.on('pointerout', pointer => {
				this.submarine.visible = true;
				this.submarine_outline.visible = false;
			});

		var tweens = [];

		tweens.push({
			targets: [this.submarine, this.submarine_outline],
			y: 0,
			ease: 'Sine.easeOut',
			duration: 2500,
			delay: 500
		});

	    var timeline = this.tweens.timeline({ tweens: tweens });
	}

	createAlerts() {
		this.scene.add(INTRO_ALERT, new Alert(INTRO_ALERT), false, {
			title: "Hi there…",
			content: "Koki and I are looking for invertebrates. (That's an animal with no skeleton.) Can you drag all of those over to our submarine? You can use our X-ray gun to check.",
			buttonText: "Sure!",
			buttonAction: this.introAlertClicked,
			context: this
		});

		return [INTRO_ALERT];
	}

	createAnimals() {

	}

	introAlertClicked() {
		// Cursor becomes X-ray gun
		// Animate in animals
		// Animate in X-ray screen
	}
}

export default Animals_Ocean;