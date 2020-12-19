import OutlineImage from './outline_image';

var get = require('lodash.get');

class OutlinePlant extends OutlineImage {
	constructor(scene, name, info) {
		let x = get(info, 'x', 0);
		let y = get(info, 'y', 0);
		let scale = get(info, 'scale', 0.5);
		
		super(scene, name, x, y, x, y);

		this.leaf_type = info.leaf_type;
		this.scale = scale;
	}
}

export default OutlinePlant;