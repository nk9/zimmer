import { Scene } from 'phaser';
import { FADE_DURATION } from '../constants/config';
import { LAST_SCENE, UNLOCKED_SCENES, SCENE_PREFS, COLLECTED_GEMS } from '../constants/storage';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import { MAIN_HALL } from '../constants/scenes';

import Alert from '../components/alert';
import PointerOutlineImage from '../components/pointer_outline_image';

import all_assets from '../assets/**/*.*';

import { get, union } from 'lodash-es';

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
    TRANSITION: 150,
    TRANSITION_TEXT: 160,
    HOME: 200,
    OVERLAY: 300
}

const ITEM_ALERT = 'ITEM_ALERT';
const GEM_X = 1120;
const GEM_Y = 10;

export default class Base_Scene extends Scene {
    init() {
        this.progress = SceneProgress.BEGIN;
        this.storeLastScene();
    }

    storeLastScene() {
        this.store(LAST_SCENE, this.scene.key);
    }

    preload() {
        // console.log("Stored data:", this.game.config.storage.cache);

        this.stored_data = get(this.cache.json.get('data'), this.scene.key);

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    loadOutlineImage(name) {
        this.load.image(name, this.assets[name].png);
        this.load.image(name+"_outline", this.assets[name+"_outline"].png);
    }

	create() {
        let alerts = this.createAlerts();
        this.alert_keys = [];

        for (const [key, data] of Object.entries(alerts)) {
            this.alert_keys.push(key);
            this.scene.add(key, new Alert(key), false, data)
        }

        // Dispose of alerts on shutdown to clear namespace
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

    //
    // Assets
    //

    get assets() {
        if (this.category) {
            return all_assets[this.category][this.scene.key]
        }

        return all_assets[this.scene.key]
    }

    get category() {
        return null
    }

    get categoryAssets() {
        if (this.category) {
            return all_assets[this.category]
        }

        return {}
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

    createGem(image_data) {
        this.gem = this.add.sprite(GEM_X, GEM_Y, 'gems', image_data.gem);
        this.gem.setOrigin(1, 0);
        this.gem.scale = .25;

        if (!this.fetch(COLLECTED_GEMS).includes(this.scene.key)) {
            this.gem.visible = false;
        }
    }

    addImagesFromStoredData(data_name, callback) {
        var images = [];

        for (const [key, image_data] of Object.entries(this.stored_data[data_name])) {
            var input_enabled = true;

            if (image_data.hasOwnProperty('gem')) {
                this.createGem(image_data);

                // If the gem for this room has already been collected,
                // then don't let the user click it again
                input_enabled = !this.gem.visible;
            }

            if ('x' in image_data && 'y' in image_data) {
                if (get(image_data, 'enabled', true)) {
                    let image = this.outlineImage(key, image_data);
                    image.input.enabled = input_enabled;

                    image.on('pointerup', callback.bind(this, image));
                    
                    images.push(image);
                }
            }
        }

        return images;
    }

    setItemsInput(handleInput) {
        for (const i of this.items) {
            i.input.enabled = handleInput;
        }
    }

    outlineImage(key, image_data) {
        return new PointerOutlineImage(this, key, image_data);
    }

    handleGemClicked(item) {
        if (!this.gem.visible) {
            let bounds = item.getBounds();
            this.gem.x = bounds.right;
            this.gem.y = bounds.top;
            this.gem.scale = .6;
            this.gem.visible = true;
            this.gem.depth = Layers.HOME;

            this.tweens.add({
                targets: this.gem,
                x: GEM_X,
                y: GEM_Y,
                scale: .25,
                duration: 1500
            })

            var collected_gems = union(this.fetch(COLLECTED_GEMS), [this.scene.key]);
            this.store(COLLECTED_GEMS, collected_gems);

            if (item.hasOwnProperty('input') && item.input != null) {
                item.input.enabled = false;
            }
        }
    }

    handleGenericItemClicked(item) {
        if (item.info.hasOwnProperty('alert')) {
            let alert_data = item.info.alert;
            let data = {
                title: alert_data.title,
                content: alert_data.content,
                buttonText: alert_data.button_title,
                buttonAction: this.genericItemAlertClicked.bind(this, item),
                context: this
            }

            this.scene.add(ITEM_ALERT, new Alert(ITEM_ALERT), false, data);
            this.runAlert(ITEM_ALERT);
        }

        if (typeof this.clickedItem === 'function') {
            this.clickedItem(item);
        }
    }

    genericItemAlertClicked(item) {
        if (item.info.hasOwnProperty('gem')) {
            this.handleGemClicked(item);
        }

        this.stopAlert(ITEM_ALERT);
        this.scene.remove(ITEM_ALERT);
    }



    update() {
    }

    nextSceneKey() {
        return MAIN_HALL;
    }


    startNextScene(key=null) {
        if (!key) {
            key = this.nextSceneKey();
        }

        this.game.sound.stopAll();
        this.willStartNextScene();
        
        this.scene.start(key);
        this.scene.shutdown();
    }

    willStartNextScene() {
        // To be overridden by subclasses
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

    showOnceScene(key) {
        let scenePref = `${this.scene.key}--${key}`;
        let currentValue = this.fetch(scenePref);
        var show = false;

        if (currentValue != true) {
            this.store(scenePref, true);
            show = true;
        }

        return show;
    }

    unlockNextScene() {
        var unlocked_scenes = this.fetch(UNLOCKED_SCENES);
        let next_scene_key = this.nextSceneKey();

        if (!unlocked_scenes.includes(next_scene_key)) {
            unlocked_scenes.push(next_scene_key);
            this.store(UNLOCKED_SCENES, unlocked_scenes);
        }
    }

    createProgressBar() {
        let Rectangle = Phaser.Geom.Rectangle;
        let main = Rectangle.Clone(this.cameras.main);

        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

        this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

        this.progressBar = this.add.graphics();
    }

    onLoadComplete(loader) {
        this.progressBar.visible = false;
    }

    onLoadProgress(progress) {
        let color = (0xffffff);

        this.progressRect.width = progress * this.progressCompleteRect.width;
        this.progressBar
            .clear()
            .fillStyle(0x222222)
            .fillRectShape(this.progressCompleteRect)
            .fillStyle(color)
            .fillRectShape(this.progressRect);
    }
}
