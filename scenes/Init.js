import { Scene } from 'phaser';
import { INIT, MAIN_HALL,
        NUMBERS_FIRST, NUMBERS_SECOND, NUMBERS_10, NUMBERS_9, NUMBERS_BOSS,
        ANIMALS_OCEAN,ANIMALS_CAVE, ANIMALS_FOREST,
        PLANTS_FLOWERS, PLANTS_LEAVES, PLANTS_MUSHROOMS } from '../constants/scenes';
import { UNLOCKED_SCENES, COLLECTED_GEMS } from '../constants/storage';


import assets from '../assets/**/*.*';
import swirlsJpg from '../assets/Init/swirls/*.jpg';
import imagesPng from '../assets/Init/pics/*.png';
import audioMp3 from '../assets/Init/audio/*.mp3';
import particles from '../assets/Init/particles/*.png';

class Init extends Scene {
    constructor() {
        super(INIT);
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    preload() {
        // Swirls
        this.load.image('aqua_swirl', swirlsJpg.aqua_swirl);
        this.load.image('blue_swirl', swirlsJpg.blue_swirl);
        this.load.image('green_swirl', swirlsJpg.green_swirl);
        this.load.image('navy_swirl', swirlsJpg.navy_swirl);

        // Sprites
        let sprites = assets.Init.sprites;
        this.load.atlas('yellow-bricks', sprites.yellow_bricks.png, sprites.yellow_bricks.json);
        this.load.atlas('link', sprites.link.png, sprites.link.json);
        this.load.atlas('kratts', sprites.kratts.png, sprites.kratts.json);
        this.load.audioSprite('hmm', sprites.hmm.json, sprites.hmm.mp3);
        this.load.atlas('gems', sprites.gems.png, sprites.gems.json);
        this.load.atlas('vangelis_boss', sprites.vangelis_boss.png, sprites.vangelis_boss.json);
        this.load.atlas('weapons', sprites.weapons.png, sprites.weapons.json);
        this.load.audioSprite('fireworks', sprites.fireworks.json, sprites.fireworks.mp3);

        // Particles
        this.load.image('spark', particles.blue);
        this.load.image('spark_yellow', particles.yellow);
        this.load.image('fire', particles.muzzleflash3);
        this.load.image('smoke', particles.smoke_puff);
        this.load.image('smoke_purple', particles.smoke_puff_purple);
        this.load.image('stone', particles.stone);
        this.load.atlas('flares', assets.Init.particles.flares.png, assets.Init.particles.flares.json);

        // Audio
        this.load.audio('door_opens_heavy', audioMp3.door_opens_heavy);
        this.load.audio('portal', audioMp3.portal);
        this.load.audio('woosh_long', audioMp3.woosh_long);

        // UI Components
        this.load.image('door', imagesPng.door);
        this.load.image('close_button', imagesPng.close_button);

        // JSON data
        this.load.json('data', assets.data.data.json);

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    create() {
        this.bootstrapStorage();
    }

    bootstrapStorage() {
        var storage = this.game.config.storage;
        var unlocked_scenes = storage.get(UNLOCKED_SCENES);

        if (unlocked_scenes === undefined) {
            storage.set(UNLOCKED_SCENES, [
                MAIN_HALL,
                NUMBERS_FIRST,
                ANIMALS_OCEAN,
                PLANTS_FLOWERS,
                ]);
        }

        var collected_gems = storage.get(COLLECTED_GEMS);

        if (collected_gems === undefined) {
            // TODO: return this to no collected gems to start with once development is complete
            storage.set(COLLECTED_GEMS, []);
            // storage.set(COLLECTED_GEMS, [
            //     NUMBERS_10, NUMBERS_9, NUMBERS_BOSS,
            //     ANIMALS_OCEAN, ANIMALS_CAVE, ANIMALS_FOREST,
            //     PLANTS_FLOWERS, PLANTS_LEAVES, PLANTS_MUSHROOMS]);
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
        this.scene.start(MAIN_HALL);
        this.scene.shutdown();
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

export default Init;
