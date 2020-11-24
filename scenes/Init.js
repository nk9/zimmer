import { Scene } from 'phaser';
import { INIT, NUMBERS_LEGO } from '../constants/scenes';

class Init extends Scene {
    constructor() {
        super({ key: INIT });
        this.progressBar = null;
        this.progressCompleteRect = null;
        this.progressRect = null;
    }

    preload() {
        this.load.image('hallway', '../assets/pics/hallway.jpg')
        this.load.image('church_door', '../assets/pics/church_door.jpg')

        // Lego Sprites
        this.load.atlas('yellow-bricks', '../assets/sprites/yellow-bricks-spritesheet.png', '../assets/sprites/yellow-bricks-spritesheet.json');
        this.load.image('pouch_open', '../assets/pics/pouch_open.png')
        this.load.image('pouch_closed', '../assets/pics/pouch_closed_small.png')

        /* this.load.audio('music-town', ['assets/music/town.mp3']); */

        this.load.on('progress', this.onLoadProgress, this);
        this.load.on('complete', this.onLoadComplete, this);
        this.createProgressBar();
    }

//     create() {
//         /*
//             this.music = this.sound.add('music-town', { loop: true });
//             this.music.play();
//         */
// 
//         this.anims.create({
//             key: LEFT,
//             frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 3, end: 5 }),
//             frameRate: 13,
//             repeat: -1
//         });
// 
//         this.anims.create({
//             key: RIGHT,
//             frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 6, end: 8 }),
//             frameRate: 13,
//             repeat: -1
//         });
// 
//         this.anims.create({
//             key: UP,
//             frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 9, end: 11 }),
//             frameRate: 13,
//             repeat: -1
//         });
// 
//         this.anims.create({
//             key: DOWN,
//             frames: this.anims.generateFrameNumbers(IMAGE_PLAYER, { start: 0, end: 2 }),
//             frameRate: 13,
//             repeat: -1
//         });
//     }

    createProgressBar() {
        let Rectangle = Phaser.Geom.Rectangle;
        let main = Rectangle.Clone(this.cameras.main);

        this.progressRect = new Rectangle(0, 0, main.width / 2, 50);
        Rectangle.CenterOn(this.progressRect, main.centerX, main.centerY);

        this.progressCompleteRect = Phaser.Geom.Rectangle.Clone(this.progressRect);

        this.progressBar = this.add.graphics();
    }

    onLoadComplete(loader) {
        this.scene.start(NUMBERS_LEGO);
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
