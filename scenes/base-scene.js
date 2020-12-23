import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';
import { LAST_SCENE } from '../constants/storage';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import { MAIN_HALL } from '../constants/scenes';

import Alert from '../components/alert';

import { get } from 'lodash-es';

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

    // Mushrooms
    UNDER_BASKET: 9,
    BASKET: 10,
    OVER_BASKET: 12,

    // All
    DRAGGING: 100,
    HOME: 200,
    OVERLAY: 300
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
        this.store(LAST_SCENE, this.key);
    }

    preload() {
        this.stored_data = get(this.cache.json.get('data'), this.key);
    }

	create() {
        let alerts = this.createAlerts();
        this.alert_keys = [];

        for (const [key, data] of Object.entries(alerts)) {
            this.alert_keys.push(key);
            this.scene.add(key, new Alert(key), false, data)
        }

        this.events.once('shutdown', () => {
            for (const key of this.alert_keys) {
                this.scene.remove(key);
            }
            this.input.setDefaultCursor('default');
        });

        this.home = this.add.image(GAME_WIDTH-10, 10, 'door');
        this.home.setOrigin(1, 0);
        this.home.setDepth(Layers.HOME);
        this.home.setInteractive({useHandCursor: true})
            .on('pointerup', () => this.startNextScene(MAIN_HALL) );

        this.createOverlay();
	}

    createOverlay() {
        this.overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        this.overlay.setOrigin(0, 0);
        this.overlay.setDepth(Layers.OVERLAY);
        this.overlay.alpha = 0;
        this.overlay.visible = false;
    }

    update() {
    }

    onChangeScene() {
        this.transition = true;
        // this.player.stop();
        this.cameras.main.fade(FADE_DURATION);
    }

    changeScene() {
        this.player.socket.disconnect();
        this.scene.start(this.nextSceneKey, this.prevSceneKey);
    }

    nextSceneKey() {
        return MAIN_HALL;
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
