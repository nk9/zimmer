import Phaser, { Game } from 'phaser';
import { WIDTH, HEIGHT } from './constants/config';

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
	width: WIDTH,
	height: HEIGHT,
	scene: [Init, Numbers_Lego]
}

const game = new Phaser.Game(config)
