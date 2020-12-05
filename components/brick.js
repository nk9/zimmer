import { DRAG_THRESHOLD } from '../constants/config';

export const LEGO_GRID = 29;

class Brick extends Phaser.GameObjects.Container {
    constructor(scene, w, h, x, y) {
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

		let text = scene.add.text(brickCenter.x, brickCenter.y, `${w*h}`,
			{fill: "#000", fontSize: "17pt", stoke: "#fff", strokeThickness: 5});
		text.setOrigin(0.5, 0.5);


		this.setInteractive({
			hitArea:new Phaser.Geom.Rectangle(wL/2, hL/2, wL, hL),
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			draggable: true
		})
		.on('pointerup', pointer => {
			if (pointer.getDistance() < DRAG_THRESHOLD) {
				this.angle += 90; text.angle -= 90;
			}
		});
		scene.input.setDraggable(this);

		this.add(brick);
		this.add(text);

        scene.add.existing(this);
    }
}

export default Brick;