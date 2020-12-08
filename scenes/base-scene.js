import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';

export const SceneProgress = {
	BEGIN:   1,
	FAILED:  10,
	SUCCESS: 20,
}

export const Layers = {
    UNDERLAY: 1,
    BACKGROUND: 2,
    OVER_DOOR: 8,
    UNDER_POUCH: 9,
    POUCH: 10,
    OVER_POUCH: 12,
    DRAGGING: 100,
}

class BaseScene extends Scene {
    constructor(key) {
        super({ key });
        this.key = key;
        this.progress = SceneProgress.BEGIN;
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
