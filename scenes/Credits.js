import { Scene } from 'phaser';
import { CREDITS, MAIN_HALL } from '../constants/scenes';

import assets from '../assets/**/*.*';

class Credits extends Scene {
    constructor() {
        super({ key: CREDITS });
        this.scroller;
    }

    preload() {
    }

    create() {
        this.createScrollingText();
        this.createExplosions();
    }

    createScrollingText() {
//         const content = [
//             "",
//             "",
//             "",
//             "",
//             "The sky above the port was the color of television, tuned to a dead channel.",
//             "`It's not like I'm using,' Case heard someone say, as he shouldered his way ",
//             "through the crowd around the door of the Chat. `It's like my body's developed",
//             "this massive drug deficiency.' It was a Sprawl voice and a Sprawl joke.",
//             "The Chatsubo was a bar for professional expatriates; you could drink there for",
//             "a week and never hear two words in Japanese.",
//             "",
//             "Ratz was tending bar, his prosthetic arm jerking monotonously as he filled a tray",
//             "of glasses with draft Kirin. He saw Case and smiled, his teeth a webwork of",
//             "East European steel and brown decay. Case found a place at the bar, between the",
//             "unlikely tan on one of Lonny Zone's whores and the crisp naval uniform of a tall",
//             "African whose cheekbones were ridged with precise rows of tribal scars. `Wage was",
//             "in here early, with two joeboys,' Ratz said, shoving a draft across the bar with",
//             "his good hand. `Maybe some business with you, Case?'",
//             "",
//             "Case shrugged. The girl to his right giggled and nudged him.",
//             "The bartender's smile widened. His ugliness was the stuff of legend. In an age of",
//             "affordable beauty, there was something heraldic about his lack of it. The antique",
//             "arm whined as he reached for another mug.",
//             "",
//             "",
//             "From Neuromancer by William Gibson"
//         ];
// 
//         this.scroller = this.add.dynamicBitmapText(16, 600, 'sans-serif', content, 24);
//         this.scroller.setSize(1024, 300);
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
        for (const emitter of this.emitters) {
            emitter.setPosition(pointer.x, pointer.y);
            emitter.start();
        }

        this.time.delayedCall(130, this.stopFirework, [], this);
    }

    stopFirework() {
        for (const emitter of this.emitters) {
            emitter.stop();
        }
    }

    update (time, delta)
    {
//         this.scroller.scrollY += 0.03 * delta;
// 
//         if (this.scroller.scrollY > 2100)
//         {
//             this.scroller.scrollY = 0;
//         }
    }
}

export default Credits;
