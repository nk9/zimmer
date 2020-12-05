import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';

import Init from './scenes/Init';
// import GrandHall from './scenes/GrandHall';

// Numbers
import Numbers_Lego from './scenes/Numbers-Lego';

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
	scene: [Init, Numbers_Lego]
}

const game = new Phaser.Game(config)
