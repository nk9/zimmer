import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';

export const SceneProgress = {
	BEGIN:   1,
	FAILED:  10,
	SUCCESS: 20,
}

export const Layers = {
    // Numbers
    UNDERLAY: 1,
    BACKGROUND: 2,
    OVER_DOOR: 8,
    UNDER_POUCH: 9,
    POUCH: 10,
    OVER_POUCH: 12,

    // All
    DRAGGING: 100,
}

class BaseScene extends Scene {
    constructor(key) {
        super({ key });
        this.key = key;
        this.progress = SceneProgress.BEGIN;
    }

    init() {
        this.storeLastScene();
    }

    storeLastScene() {
        this.store('last_scene', this.key);
    }

	create() {
        this.alert_keys = this.createAlerts();

        this.events.on('transitionstart', function(fromScene, duration){
            for (const key of this.alert_keys) {
                fromScene.scene.remove(key);
            }
        });
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

    // Disable the main scene's input while the alert scene is showing
    runAlert(scene_key, info=null) {
        // console.log(`runAlert: ${scene_key}`);
        this.input.enabled = false;
        this.scene.run(scene_key, info);
    }

    stopAlert(scene_key) {
        // console.log(`stopAlert: ${scene_key}`);
        this.scene.stop(scene_key);
        this.input.enabled = true;
    }

    store(key, value) {
        this.game.config.storage.set(key, value);
    }

    fetch(key) {
        return this.game.config.storage.get(key);
    }
}

export default BaseScene;
