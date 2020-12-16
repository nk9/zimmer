import OutlineImage from '../components/outline_image';

class XrayAnimal extends OutlineImage {
	constructor(scene, name, success, targetX, targetY, scale=.5) {
		let [x, y] = [-500, -500];
		super(scene, name, targetX, targetY, x, y, scale);

		this.xrayImg = scene.add.image(910, 460, name+'_xray');
		this.xrayImg.setOrigin(0, 0);
		this.xrayImg.visible = false;
		this.success = success;
	}
}

export default XrayAnimal;