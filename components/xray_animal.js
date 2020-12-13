import OutlineImage from '../components/outline_image';

class XrayAnimal extends OutlineImage {
	constructor(scene, name, targetX, targetY, x=-500, y=-500, scale=.5) {
		super(scene, name, targetX, targetY, x, y, scale);

		this.xrayImg = scene.add.image(910, 460, name+'_xray');
		this.xrayImg.setOrigin(0, 0);
		this.xrayImg.visible = false;
	}
}

export default XrayAnimal;