import { Scene } from 'phaser';
import { INIT, MAIN_HALL, ANIMALS_OCEAN } from '../constants/scenes';

import swirlsJpg from '../assets/pics/swirls/*.jpg';
import imagesJpg from '../assets/pics/*.jpg';
import audioMp3 from '../assets/audio/*.mp3';
import particles from '../assets/particles/*.png';
import spritesImg from '../assets/sprites/*.png';
import spritesMp3 from '../assets/sprites/*.mp3';
import spritesJson from '../assets/sprites/*.json';
import dataJson from '../assets/data/*.json';

class Init extends Scene {
    constructor() {
        super({ key: INIT });
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
        this.load.atlas('yellow-bricks', spritesImg.yellow_bricks_spritesheet, spritesJson.yellow_bricks_spritesheet);
        this.load.atlas('link', spritesImg.link_spritesheet, spritesJson.link_spritesheet);
        this.load.audioSprite('hmm', spritesJson.hmm_spritesheet, spritesMp3.hmm);

        // Particles
        this.load.image('spark', particles.blue);

        // Audio
        this.load.audio('door_opens_heavy', audioMp3.door_opens_heavy);
        this.load.audio('portal', audioMp3.portal);

        // JSON data
        this.load.json('animals_data', dataJson.animals);
        this.load.json('plants_data', dataJson.plants);

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

    create() {

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
