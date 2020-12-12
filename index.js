import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';

import Init from './scenes/Init';
// import GrandHall from './scenes/GrandHall';

// Numbers
import Numbers_Lego_10 from './scenes/Numbers-Lego-10';
import Numbers_Lego_9 from './scenes/Numbers-Lego-9';

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
	scene: [Init, Numbers_Lego_10, Numbers_Lego_9]
}

const game = new Phaser.Game(config)
