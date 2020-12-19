export default class LightboxAlert extends Phaser.Scene {
	create() {
		let data = this.scene.settings.data;

		this.input.topOnly = true;

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

		let img = this.add.image(screenCenterX, screenCenterY, data.image.name);
		img.setOrigin(0.5, 0.5);

		let imgBounds = img.getBounds();
		let bgBounds = Phaser.Geom.Rectangle.Inflate(imgBounds, 30, 30);
		bgBounds.height += 45;
		
		let bg = this.add.rectangle(bgBounds.x, bgBounds.y, bgBounds.width, bgBounds.height, 0x000000, .9);
		bg.setStrokeStyle(3, 0xffffff)
		bg.setOrigin(0, 0);
		bg.setDepth(-1);

		let lightboxKey = this.scene.key;
		// this.input.on('pointerdown', (pointer) => {
		// 	data.context.stopAlert(lightboxKey);
		// 	// pointer.event.stopPropagation();
		// });

		this.input.setDefaultCursor(`default`);

		this.buttonRect = this.add.rectangle(bgBounds.centerX, bgBounds.bottom-20, 140, 36, 0x000000, .5);
		this.buttonRect.setStrokeStyle(2, 0xffffff);
		this.buttonRect.setOrigin(.5, 1);

		let btnBounds = this.buttonRect.getBounds();
		this.buttonText = this.add.text(btnBounds.centerX, btnBounds.centerY, "Ooh, pretty!", {fontSize: '24px', fontFamily: 'sans-serif'});
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
			.on('pointerup', (pointer, x, y, event) => {
				data.context.closeLightbox(lightboxKey);
			});
	}
}
