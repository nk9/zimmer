import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';

console.log("BaseScene")

class BaseScene extends Scene {
    constructor(key) {
        super({ key });
        this.key = key;
    }

    init() {
        // this.scene.setVisible(false, this.key);
        // this.player = new Player(this, this.key, position);
        // this.layers = {};
        // this.prevSceneKey = this.key;
        // this.nextSceneKey = null;
        // this.transition = true;
        // this.input.keyboard.removeAllListeners();
    }

	create(tilemap, tileset, withTSAnimation) {
	}

    update() {
    }

    onChangeScene() {
        this.transition = true;
        // this.player.stop();
        this.cameras.main.fade(FADE_DURATION);
    }

    changeScene() {
        // if (this.withTSAnimation)
        //     this.tilesetAnimation.destroy();

        this.player.socket.disconnect();
        this.scene.start(this.nextSceneKey, this.prevSceneKey);
    }
}

export default BaseScene;
