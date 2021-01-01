import { DRAG_THRESHOLD } from '../constants/config';
import { Layers } from '../scenes/base-scene';

export const LEGO_GRID = 29;

class Brick extends Phaser.GameObjects.Container {
	text;
	initialPosition = {};

    constructor(scene, wL, hL, xL, yL, rotatable=true) {
    	let [x, y, w, h] = [xL, yL, wL, hL].map(n => n * LEGO_GRID);
    	super(scene, x, y);

		this.setInitialPosition(x, y);

		this.legoTotal = wL*hL;
		this.legoW = wL;
		this.legoH = hL;

		this.makeBrick(scene, this, wL, hL, xL, yL);

		this.drag_image = scene.add.container(0, 0);
		this.drag_image.visible = false;
		this.drag_image.setDepth(Layers.DRAGGING);
		this.makeBrick(scene, this.drag_image, wL, hL, xL, yL);
		
		this.setInteractive({
			hitArea:new Phaser.Geom.Rectangle(w/2, h/2, w, h),
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		})

		if (rotatable) {
			this.on('pointerup', pointer => {
				if (pointer.getDistance() < DRAG_THRESHOLD) {
					this.angle += 90; this.text.angle -= 90;
				}
			});
		}

		scene.input.setDraggable(this);

        scene.add.existing(this);
    }

    makeBrick(scene, container, wL, hL, xL, yL) {
    	let [x, y, w, h] = [xL, yL, wL, hL].map(n => n * LEGO_GRID);
		container.setSize(w, h);

		let brick = scene.add.sprite(0, 0,
									'yellow-bricks',
									`${hL}x${wL}`);
		brick.setOrigin(0, 0);
		let brickCenter = brick.getCenter();

		container.text = scene.add.text(brickCenter.x, brickCenter.y, `${wL*hL}`,
			{fill: "#000", fontSize: "16pt", stoke: "#fff", strokeThickness: 5 });
		container.text.setOrigin(0.5, 0.5);

		let border = scene.add.rectangle(0, 0, w, h);
		border.setOrigin(0, 0);
		border.setStrokeStyle(2, 0x000000, .3);

		container.add(brick);
		container.add(container.text);
		container.add(border);
    }

    setInitialPosition(x, y) {
		this.initialPosition = {
			x: x,
			y: y,
		};

		this.x = x;
		this.y = y;
    }

    resetPosition() {
    	let reset = this.initialPosition;

    	this.x = reset.x;
    	this.y = reset.y;

    	this.angle = 0;
    	this.text.angle = 0;
    }
}

export default Brick;