class OutlineImage extends Phaser.GameObjects.Container {
	constructor(scene, name, x, y, scale=1) {
		super(scene, x, y);

		this.name = name;

		this.img = scene.add.image(0, 0, name);
		this.img.name = name;
		this.img_outline = scene.add.image(0, 0, name+'_outline');
		this.img_outline.visible = false;

		let img_bounds = this.img.getBounds();
		let [w, h] = [img_bounds.width, img_bounds.height];

		this.setSize(w, h);
		this.setInteractive()
			.on('pointerover', () => {
				this.img.visible = false;
				this.img_outline.visible = true;
			})
			.on('pointerout', () => {
				this.img.visible = true;
				this.img_outline.visible = false;
			});

		this.add(this.img);
		this.add(this.img_outline);
		this.scale = scale;

		scene.add.existing(this);
	}
}

export default OutlineImage;