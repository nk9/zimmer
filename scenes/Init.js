import { Scene } from 'phaser';
import { INIT, MAIN_HALL, ANIMALS_OCEAN } from '../constants/scenes';

import imagesJpg from '../assets/pics/*.jpg'
import imagesPng from '../assets/pics/*.png'
import audioMp3 from '../assets/audio/*.mp3'
import particles from '../assets/particles/*.png'
import spritesImg from '../assets/sprites/*.png'
import spritesJson from '../assets/sprites/*.json'
import dataJson from '../assets/data/*.json'

class Init extends Scene {
    constructor() {
        super({ key: INIT });
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    preload() {
        // Doors
        this.load.image('tarnished_door', imagesJpg.tarnished_door);
        this.load.image('tarnished_door_open', imagesPng.tarnished_door_open);

        // Swirls
        this.load.image('aqua_swirl', imagesJpg.aqua_swirl);

        // Lego Sprites
        this.load.atlas('yellow-bricks', spritesImg.yellow_bricks_spritesheet, spritesJson.yellow_bricks_spritesheet);
        this.load.image('pouch_open', imagesPng.pouch_open)
        this.load.image('pouch_closed', imagesPng.pouch_closed_small)
        this.load.image('pouch_closed_outlined', imagesPng.pouch_closed_small_outlined)

        // Particles
        this.load.image('spark', particles.blue);

        // Audio
        this.load.audio('door_opens_heavy', audioMp3.door_opens_heavy);

        // Animals JSON
        this.load.json('animals_data', dataJson.animals);


        /* this.load.audio('music-town', ['assets/music/town.mp3']); */

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
        console.log("onLoadComplete");
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
