import OutlineImage from './outline_image';

var get = require('lodash.get');

class OutlinePlant extends OutlineImage {
	constructor(scene, name, info, scale=.5) {
		let x = get(info, 'x', 0);
		let y = get(info, 'y', 0);
		super(scene, name, x, y, x, y);

		this.leaf_type = info.leaf_type;
	}
}

export default OutlinePlant;