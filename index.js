import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';

import Init from './scenes/Init';
import Main_Hall from './scenes/Main-Hall';

// Numbers
import Numbers_Lego_10 from './scenes/Numbers-Lego-10';
import Numbers_Lego_9 from './scenes/Numbers-Lego-9';

// Animals
import Animals_Ocean from './scenes/Animals-Ocean';
import Animals_Cave from './scenes/Animals-Cave';

// Plants
import Plants_Leaves from './scenes/Plants-Leaves';

const config = {
	type: Phaser.AUTO,
	physics: {
		default: 'arcade',
		arcade: {
			debug: true
		}
	},
	width: GAME_WIDTH,
	height: GAME_HEIGHT,
	// scale: {
	// 	mode: Phaser.Scale.FIT,
	// 	width: GAME_WIDTH,
	// 	height: GAME_HEIGHT
	// },
	scene: [Init, Main_Hall,

			// Numbers
			Numbers_Lego_10,
			Numbers_Lego_9,

			// Animals
			Animals_Ocean,
			Animals_Cave,

			// Plants
			Plants_Leaves,

			//Time
			]
}

const game = new Phaser.Game(config)
