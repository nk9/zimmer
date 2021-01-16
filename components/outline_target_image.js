import OutlineImage from './outline_image';

export default class OutlineTargetImage extends OutlineImage {
	constructor(scene, name, targetX, targetY, x=-500, y=-500, scale=.5) {
		super(scene, name, x, y, scale);

		this.targetX = targetX;
		this.targetY = targetY;
	}
}
