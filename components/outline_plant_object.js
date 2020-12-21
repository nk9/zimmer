import OutlinePlant from './outline_plant';

var get = require('lodash.get');

class OutlinePlantObject extends OutlinePlant {
	constructor(scene, name, info) {
		super(scene, name, info);
		this.input.cursor = 'pointer';
	}
}

export default OutlinePlantObject;