import OutlinePlant from './outline_plant';

var get = require('lodash.get');

class OutlinePlantFlower extends OutlinePlant {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.colour = get(info, 'colour');
		this.shape = get(info, 'shape');
		this.drag_image = scene.add.image(0, 0, name);
		this.drag_image.visible = false;
	}
}

export default OutlinePlantFlower;