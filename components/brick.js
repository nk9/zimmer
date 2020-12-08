import { DRAG_THRESHOLD } from '../constants/config';

export const LEGO_GRID = 29;

class Brick extends Phaser.GameObjects.Container {
	text;
	initialPosition = {};

    constructor(scene, wL, hL, xL, yL) {
    	let [x, y, w, h] = [xL, yL, wL, hL].map(n => n * LEGO_GRID);
    	super(scene, x, y);

		this.setInitialPosition(x, y);
		this.setSize(w, h);

		this.legoTotal = wL*hL;
		this.legoW = wL;
		this.legoH = hL;
		
		let brick = scene.add.sprite(0, 0,
									'yellow-bricks',
									`${hL}x${wL}.png`);
		brick.setOrigin(0, 0);
		let brickCenter = brick.getCenter();

		this.text = scene.add.text(brickCenter.x, brickCenter.y, `${wL*hL}`,
			{fill: "#000", fontSize: "17pt", stoke: "#fff", strokeThickness: 5});
		this.text.setOrigin(0.5, 0.5);

		let border = scene.add.rectangle(0, 0, w, h);
		border.setOrigin(0, 0);
		border.setStrokeStyle(2, 0x000000, .3);

		this.setInteractive({
			hitArea:new Phaser.Geom.Rectangle(w/2, h/2, w, h),
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		})
		.on('pointerup', pointer => {
			if (pointer.getDistance() < DRAG_THRESHOLD) {
				this.angle += 90; this.text.angle -= 90;
			}
		});
		scene.input.setDraggable(this);

		this.add(brick);
		this.add(this.text);
		this.add(border);

        scene.add.existing(this);
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