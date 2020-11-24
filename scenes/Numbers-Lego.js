import BaseScene from './base-scene';
import { DRAG_THRESHOLD } from '../constants/config';
import { NUMBERS_LEGO } from '../constants/scenes';

var bricks = [];
const LEGO_GRID = 29;

class Numbers_Lego extends BaseScene {
    constructor() {
        super(NUMBERS_LEGO);
    }

    init() {
        super.init();
    }

	create() {
        // super.create('a', 'b', true);
		var hallway = this.add.image(0, 0, 'hallway')
		hallway.setOrigin(0,0)

	    const helloButton = this.add.text(100, 200, 'Hello Phaser!', { fill: '#0f0' });
	    helloButton.setInteractive();
	    helloButton.on('pointerover', () => { console.log('pointerover'); });

	    // Create bricks
	    this.addBrick('2x4', 5, 6);
	    this.addBrick('1x4', 10, 6);
	    this.addBrick('1x1', 2, 3);

	    this.input.dragDragThreshold = DRAG_THRESHOLD;

	    // Allow dragging of the bricks, but snap to grid
	    this.input.on('drag', function (pointer, gameObject, dragX, dragY) {
	        gameObject.x = Phaser.Math.Snap.To(dragX, LEGO_GRID);
	        gameObject.y = Phaser.Math.Snap.To(dragY, LEGO_GRID);
	    });
	}

	update() {
		// Has to be called in update in order for the change to register
		for (var i = bricks.length - 1; i >= 0; i--) {
			bricks[i].angle = bricks[i].angle;
		}
	}

	addBrick(brickName, x, y) {
		let brick = this.add.sprite(x * LEGO_GRID,
									y * LEGO_GRID,
									'yellow-bricks',
									brickName+".png")
		brick.setOrigin(0, 0);
		brick.setInteractive()
			// .on('pointerover', () => { console.log('brick!'); })
			.on('pointerup', pointer => { if (pointer.getDistance() < DRAG_THRESHOLD) { brick.angle += 90; } });
		this.input.setDraggable(brick);

		bricks.push(brick);
	}
}

export default Numbers_Lego;