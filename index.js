import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';
import JSONStorage from './components/json_storage';

import Init from './scenes/Init';
import Main_Hall from './scenes/Main_Hall';
import Credits from './scenes/Credits';

// Numbers
import Numbers_Lego_First from './scenes/Numbers-Lego-First';
import Numbers_Lego_Second from './scenes/Numbers-Lego-Second';
import Numbers_Lego_10 from './scenes/Numbers-Lego-10';
import Numbers_Lego_9 from './scenes/Numbers-Lego-9';
import Numbers_Lego_Boss from './scenes/Numbers-Lego-Boss';

// Animals
import Animals_Ocean from './scenes/Animals_Ocean';
import Animals_Cave from './scenes/Animals_Cave';
import Animals_Forest from './scenes/Animals_Forest';


// Plants
import Plants_Leaves from './scenes/Plants-Leaves';
import Plants_Flowers from './scenes/Plants-Flowers';
import Plants_Mushrooms from './scenes/Plants-Mushrooms';


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
	scene: [Init, Main_Hall, Credits,

			// Numbers
			Numbers_Lego_First,
			Numbers_Lego_Second,
			Numbers_Lego_10,
			Numbers_Lego_9,
			Numbers_Lego_Boss,

			// Animals
			Animals_Ocean,
			Animals_Cave,
			Animals_Forest,

			// Plants
			Plants_Leaves,
			Plants_Flowers,
			Plants_Mushrooms,
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
