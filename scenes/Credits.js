import log from 'loglevel';
import { random } from 'lodash-es';
import { Scene } from 'phaser';

import { CREDITS, MAIN_HALL } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import assets from '../assets/Credits/*.*';

export default class Credits extends Scene {
    constructor() {
        super(CREDITS);
        this.scroller;
    }

    preload() {
        this.load.audio('ending', assets.ending.mp3);
        this.load.image('costume_box', assets.costumeBox.jpg);

        this.load.json('credits', assets.credits.json);
    }

    create() {
        this.createAudio();
        this.createScrollingText();
        this.createExplosions();

        this.endReached = false;
    }

    createAudio() {
        this.background_sound = this.sound.add('ending', {volume: .4});
        this.background_sound.play();
    }

    createScrollingText() {
        var content = this.cache.json.get('credits');

        var left = "";
        var right = "";

        for (let section in content) {
            left  += `${section}\n`;
            right += "\n";

            for (let [key, val] of Object.entries(content[section])) {
                left  += `${key}\n`;
                right += `${val}\n`;
            }

            left  += "\n\n";
            right += "\n\n";
        }

        let congratsStyle = {
            fontSize: '100px',
            fontFamily: 'ninjago',
            align: "center",
            fill: '#fff'
        };
        this.congratsText = this.add.text(GAME_WIDTH/2, GAME_HEIGHT/2, "congratulations", congratsStyle);
        this.congratsText.setOrigin(0.5, 0.5);

        let contentStyle = {
            fontSize: '40px',
            fontFamily: 'sans-serif',
            align: "left",
            fill: '#fff',
            wordWrap: { width: GAME_WIDTH*.8, useAdvancedWrap: true }
        };
        this.creditsTextLeft = this.add.text(0, GAME_HEIGHT, left, contentStyle);
        this.creditsTextLeft.setOrigin(0, 0);
        this.creditsTextRight = this.add.text(GAME_WIDTH/2, GAME_HEIGHT, right, contentStyle);
        this.creditsTextRight.setOrigin(0, 0);

        let bounds = this.creditsTextLeft.getBounds();
        this.costume_box = this.add.image(GAME_WIDTH/2, bounds.bottom+200, 'costume_box');
        this.costume_box.setOrigin(0.5, 0);
    }

    createExplosions() {
        this.emitters = [];

        var particles = this.add.particles('flares');

        for (var i = 0; i < 10; i++) {
            let angle = i * 36;
            this.emitters.push(particles.createEmitter({
                on: false,
                frame: ['blue', 'yellow', 'red', 'green'],
                angle: angle,
                speed: { min: 100, max: -500 },
                gravityY: 200,
                scale: { start: 0.2, end: 0.0 },
                lifespan: 1000,
                blendMode: 'ADD'
            }));
        }

        this.input.on('pointerdown', (pointer) => {
            const bound = this.clickForFirework.bind(this, pointer);
            bound();
        });
    }

    clickForFirework(pointer) {
        let scrollY = this.cameras.main.scrollY;
        let point = new Phaser.Geom.Point(pointer.x, pointer.y + scrollY);
        this.doFirework(point);
    }

    doFirework(point) {
        let hmm_num = random(0, 5);
        this.sound.playAudioSprite('fireworks', `${hmm_num}`);

        for (const emitter of this.emitters) {
            emitter.setPosition(point.x, point.y);
            emitter.start();
        }

        this.time.delayedCall(130, this.stopFirework, [], this);
    }

    costumeBoxExplosion() {
        let bounds = this.costume_box.getBounds();
        var particles = this.add.particles('flares');

        particles.createEmitter({
            frame: ['blue', 'yellow', 'red', 'green'],
            lifespan: 1000,
            scale: { start: 0.4, end: 0 },
            emitZone: { type: 'edge', source: bounds, quantity: 70 }
        });
    }

    stopFirework() {
        for (const emitter of this.emitters) {
            emitter.stop();
        }
    }

    update (time, delta) {
        let creditsBounds = this.costume_box.getBounds();

        if ((this.cameras.main.scrollY + GAME_HEIGHT/2) < creditsBounds.centerY) {
            this.cameras.main.scrollY += 1;
        } else {
            if (!this.endReached) {
                this.endReached = true;
                this.costumeBoxExplosion();
            }
        }
    }
}
