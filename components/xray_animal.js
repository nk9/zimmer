import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'
import { randomPointOnNearestEdge } from '../utilities/geom_utils';

import OutlineTargetImage from '../components/outline_target_image';

export default class XrayAnimal extends OutlineTargetImage {
	constructor(scene, name, success, targetX, targetY, scale=.5) {
		let bounds = new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT);
		Phaser.Geom.Rectangle.Inflate(bounds, 200, 200);
		let randomPoint = randomPointOnNearestEdge(bounds, {x: targetX, y: targetY});

		super(scene, name, targetX, targetY, randomPoint.x, randomPoint.y, scale);

		this.xrayImg = scene.add.image(1025, 460, name+'_xray');
		this.xrayImg.setOrigin(0.5, 0);
		this.xrayImg.visible = false;
		this.success = success;
	}
}
