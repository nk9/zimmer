import { DRAG_THRESHOLD } from '../constants/config';

export const LEGO_GRID = 29;

class Brick extends Phaser.GameObjects.Container {
	text;

    constructor(scene, w, h, x, y, angle = 0) {
    	super(scene, x * LEGO_GRID, y * LEGO_GRID);

		let wL = w * LEGO_GRID;
		let hL = h * LEGO_GRID;

		// var container = scene.add.container(x * LEGO_GRID, y * LEGO_GRID);
		this.setSize(wL, hL);
		this.legoTotal = w*h;
		this.legoW = w;
		this.legoH = h;
		
		let brick = scene.add.sprite(0, 0,
									'yellow-bricks',
									`${h}x${w}.png`);
		brick.setOrigin(0, 0);
		let brickCenter = brick.getCenter();

		this.text = scene.add.text(brickCenter.x, brickCenter.y, `${w*h}`,
			{fill: "#000", fontSize: "17pt", stoke: "#fff", strokeThickness: 5});
		this.text.setOrigin(0.5, 0.5);

		let border = scene.add.rectangle(0, 0, wL, hL);
		border.setOrigin(0, 0);
		border.setStrokeStyle(2, 0x000000, .3);

		this.setInteractive({
			hitArea:new Phaser.Geom.Rectangle(wL/2, hL/2, wL, hL),
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

		this.angle = angle;
		this.text.angle = -angle;

        scene.add.existing(this);
    }
}

export default Brick;