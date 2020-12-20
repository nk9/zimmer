import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';
import JSONStorage from './components/json_storage';

import Init from './scenes/Init';
import Main_Hall from './scenes/Main-Hall';

// Numbers
import Numbers_Lego_10 from './scenes/Numbers-Lego-10';
import Numbers_Lego_9 from './scenes/Numbers-Lego-9';

// Animals
import Animals_Ocean from './scenes/Animals-Ocean';
import Animals_Cave from './scenes/Animals-Cave';
import Animals_Forest from './scenes/Animals-Forest';


// Plants
import Plants_Leaves from './scenes/Plants-Leaves';
import Plants_Flowers from './scenes/Plants-Flowers';


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
			Animals_Forest,

			// Plants
			Plants_Leaves,
			Plants_Flowers,

			//Time
			],
	// plugins: {
	// 	global: [{
	// 		key: 'SceneWatcher',
	// 		plugin: require('./plugins/phaser-plugin-scene-watcher.cjs'),
	// 		start: true }
	// 	]
	// },
}

const game = new Phaser.Game(config)
game.config.storage = new JSONStorage();
