import Phaser from 'phaser';

export default class Alert extends Phaser.Scene {
	create() {
		console.log("create alert");
		let data = this.scene.settings.data;

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
		const width = 500;
		const height = 200;

		let bg = this.add.rectangle(screenCenterX, screenCenterY, width, height, 0x000000, .9);
		bg.setStrokeStyle(3, 0xffffff)
		bg.setOrigin(0.5, 0.5);

		let inset = Phaser.Geom.Rectangle.Inflate(bg.getBounds(), -15, -15);

		let title = this.add.text(inset.centerX, inset.y, data.title, {fontSize: '40px', fontFamily: 'sans-serif'});
		title.setOrigin(0.5, 0);

		let titleBottomLeft = title.getBottomLeft();
		let content = this.add.text(inset.x, titleBottomLeft.y+20, data.content, {fontSize: '24px', fontFamily: 'sans-serif'});

		this.buttonRect = this.add.rectangle(inset.right, inset.bottom, 140, 36, 0x000000, .5);
		this.buttonRect.setStrokeStyle(2, 0xffffff);
		this.buttonRect.setOrigin(1, 1);

		let btnBounds = this.buttonRect.getBounds();
		this.buttonText = this.add.text(btnBounds.centerX, btnBounds.centerY, data.buttonText, {fontSize: '24px', fontFamily: 'sans-serif'});
		this.buttonText.setOrigin(0.5, 0.5);
		this.buttonText.setDepth(10);

		this.buttonRect.setInteractive({useHandCursor: true})
			.on('pointerover', () => {
				this.buttonRect.setFillStyle(0xeeeeee, 1);
				this.buttonText.setColor('#f00');
			})
			.on('pointerout', () => {
				this.buttonRect.setFillStyle(0x000000, 1);
				this.buttonText.setColor('#fff');
			})
			.on('pointerup', () => {
				const bound = data.buttonAction.bind(data.context);
				bound();
			});
	}
}
