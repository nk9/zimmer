import Phaser, { Game } from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from './constants/config';
import JSONStorage from './components/json_storage';

import Init from './scenes/Init';
import Main_Hall from './scenes/Main_Hall';
import Credits from './scenes/Credits';
import Scene_Directory from './scenes/Scene_Directory';

// Numbers
import Numbers_First from './scenes/Numbers_First';
import Numbers_Second from './scenes/Numbers_Second';
import Numbers_10 from './scenes/Numbers_10';
import Numbers_9 from './scenes/Numbers_9';
import Numbers_Boss from './scenes/Numbers_Boss';

// Animals
import Animals_Ocean from './scenes/Animals_Ocean';
import Animals_Cave from './scenes/Animals_Cave';
import Animals_Forest from './scenes/Animals_Forest';


// Plants
import Plants_Leaves from './scenes/Plants_Leaves';
import Plants_Flowers from './scenes/Plants_Flowers';
import Plants_Mushrooms from './scenes/Plants_Mushrooms';

// Time
import Time_Phones from './scenes/Time_Phones';
import Time_Sundial from './scenes/Time_Sundial';
import Time_Bedroom from './scenes/Time_Bedroom';


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
	scene: [Init, Credits,

			// Starting points
			Main_Hall,
			Scene_Directory,

			// Numbers
			Numbers_First,
			Numbers_Second,
			Numbers_10,
			Numbers_9,
			Numbers_Boss,

			// Animals
			Animals_Ocean,
			Animals_Cave,
			Animals_Forest,

			// Plants
			Plants_Leaves,
			Plants_Flowers,
			Plants_Mushrooms,

			// Time
			Time_Phones,
			Time_Sundial,
			Time_Bedroom,
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

const params = new URLSearchParams(window.location.search);
console.log(params);
