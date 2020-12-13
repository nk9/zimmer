import OutlineImage from '../components/outline_image';

class XrayAnimal extends OutlineImage {
	constructor(scene, name, targetX, targetY, x=-500, y=-500, scale=.5) {
		super(scene, name, targetX, targetY, x, y, scale);

		this.xrayImg = scene.add.image(0, 0, 'xray_'+name);
		this.xrayImg.visible = false;

		this.setInteractive()
			.on('pointerup', () => {
				scene.clickedXrayAnimal(this);
			});
	}
}

export default XrayAnimal;