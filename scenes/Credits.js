import { random } from 'lodash-es';
import { Scene } from 'phaser';

import { CREDITS, MAIN_HALL } from '../constants/scenes';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config';

import assets from '../assets/Credits/*.*';

class Credits extends Scene {
    constructor() {
        super(CREDITS);
        this.scroller;
    }

    preload() {
        this.load.audio('ending', assets.ending.mp3);
        this.load.json('credits', assets.credits.json);

        this.loadFont('ninjago', assets.Ninjago.ttf);
    }

    loadFont(name, url) {
        var newFont = new FontFace(name, `url(${url})`);
        newFont.load().then(function (loaded) {
            document.fonts.add(loaded);
        }).catch(function (error) {
            return error;
        });
    }

    create() {
        this.createAudio();
        this.createScrollingText();
        this.createExplosions();
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
            const bound = this.doFirework.bind(this, pointer);
            bound();
        });
    }

    doFirework(pointer) {
        let hmm_num = random(0, 5);
        this.sound.playAudioSprite('fireworks', `${hmm_num}`);

        for (const emitter of this.emitters) {
            let scrollY = this.cameras.main.scrollY;
            emitter.setPosition(pointer.x,
                                scrollY + pointer.y);
            emitter.start();
        }

        this.time.delayedCall(130, this.stopFirework, [], this);
    }

    stopFirework() {
        for (const emitter of this.emitters) {
            emitter.stop();
        }
    }

    update (time, delta) {
        let creditsBounds = this.creditsTextRight.getBounds();

        if (this.cameras.main.scrollY < creditsBounds.bottom) {
            this.cameras.main.scrollY += .5;
        }
    }
}

export default Credits;
