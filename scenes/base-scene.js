import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';
import { LAST_SCENE, UNLOCKED_SCENES } from '../constants/storage';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import { MAIN_HALL } from '../constants/scenes';

import Alert from '../components/alert';
import PointerOutlineImage from '../components/pointer_outline_image';

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
    TRANSITION: 250,
    OVERLAY: 300
}

const ITEM_ALERT = 'Item_Alert';

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
    
    createItems() {
        this.items = this.addImagesFromStoredData('items', this.handleGenericItemClicked);
    }

    createOverlay() {
        this.overlay = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000);
        this.overlay.setOrigin(0, 0);
        this.overlay.setDepth(Layers.OVERLAY);
        this.overlay.alpha = 0;
        this.overlay.visible = false;
    }

    addImagesFromStoredData(data_name, callback) {
        var images = [];

        for (const [key, image_data] of Object.entries(this.stored_data[data_name])) {
            if ('x' in image_data && 'y' in image_data) {
                if (get(image_data, 'enabled', true)) {
                    let image = new PointerOutlineImage(this, key, image_data);

                    image.on('pointerdown', callback.bind(this, image));
                    
                    images.push(image);
                }
            }
        }

        return images;
    }

    handleGenericItemClicked(item) {
        if (item.info.hasOwnProperty('alert')) {
            console.log(item.info.alert);
            let alert_data = item.info.alert;
            let data = {
                title: alert_data.title,
                content: alert_data.content,
                buttonText: alert_data.button_title,
                buttonAction: this.genericItemAlertClicked,
                context: this
            }

            this.scene.add(ITEM_ALERT, new Alert(ITEM_ALERT), false, data);
            this.runAlert(ITEM_ALERT);
        } else {
            this.clickedItem(item);
        }
    }

    genericItemAlertClicked() {
        this.stopAlert(ITEM_ALERT);
        this.scene.remove(ITEM_ALERT);
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

    unlockNextScene() {
        var unlocked_scenes = this.fetch(UNLOCKED_SCENES);
        let next_scene_key = this.nextSceneKey();

        if (!unlocked_scenes.includes(next_scene_key)) {
            unlocked_scenes.push(next_scene_key);
            this.store(UNLOCKED_SCENES, unlocked_scenes);
        }
    }
}

export default BaseScene;
