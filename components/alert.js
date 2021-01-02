import { Scene } from 'phaser';

export default class Alert extends Scene {
	create() {
		let data = this.scene.settings.data;

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
		const width = 500;
		const height = 0;

		let contentStyle = {
			fontSize: '24px',
			fontFamily: 'sans-serif',
			align: "left",
			wordWrap: { width: width-30, useAdvancedWrap: true } // width minus 2*inset
		};
		let content = this.add.text(0, 0, data.content, contentStyle);
		let contentBounds = content.getBounds();
		console.log(content, contentBounds);

		let bgHeight = 15  // inset
					 + 40  // title
					 + 20  // gap
					 + contentBounds.height
					 + 20  // gap
					 + 36  // buttons
					 + 15; // inset
		let bg = this.add.rectangle(screenCenterX, screenCenterY, width, bgHeight, 0x000000, .9);
		bg.setStrokeStyle(3, 0xffffff)
		bg.setOrigin(0.5, 0.5);
		bg.setDepth(-1);

		let inset = Phaser.Geom.Rectangle.Inflate(bg.getBounds(), -15, -15);

		let title = this.add.text(inset.centerX, inset.y, data.title, {fontSize: '40px', fontFamily: 'sans-serif'});
		title.setOrigin(0.5, 0);

		let titleBottomLeft = title.getBottomLeft();
		content.x = inset.x;
		content.y = titleBottomLeft.y+20;

		this.buttonRect = this.add.rectangle(inset.right, inset.bottom, 200, 36, 0x000000, .5);
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
			.on('pointerup', (pointer, localX, localY, event) => {
				const bound = data.buttonAction.bind(data.context);
				event.stopPropagation(); // Doesn't work?? Probably a Phaser bug.
				bound();
			});
	}
}
