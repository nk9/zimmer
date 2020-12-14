
class ScanChargeBar extends Phaser.GameObjects.Graphics {
	constructor(scene, x, y, width, height) {
		super(scene, { x: x, y: y });

		this.width = width;
		this.height = height;

		scene.add.existing(this);
	}

	drawBar(percent) {
		let draw_percent = Math.min(Math.max(percent, 0), 1); // Clamp percent
		let remainingWidth = Math.ceil(this.width * draw_percent);
		let expiredWidth = this.width - remainingWidth;

		// Remaining
		if (draw_percent > .4) {
			// Green
		    this.fillGradientStyle(0xA2D22F, 0xA2D22F, 0x4BD22F, 0x4BD22F, 1);
		} else if (draw_percent > .2) {
			// Yellow
			this.fillGradientStyle(0xD1C22B, 0xD1C22B, 0xE8BC2A, 0xE8BC2A, 1);
		} else {
			// Red
			this.fillGradientStyle(0xE82A2A, 0xE82A2A, 0xAA2323, 0xAA2323, 1);
		}
		this.fillRect(0, 0, remainingWidth, this.height);

		// Expired
	    this.fillGradientStyle(0x959595, 0x959595, 0x656565, 0x656565, 1);
		this.fillRect(remainingWidth, 0, expiredWidth, this.height);
	}
}

export default ScanChargeBar;
