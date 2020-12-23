import OutlinePlant from './outline_plant';

import { get } from 'lodash-es';

class OutlinePlantObject extends OutlinePlant {
	constructor(scene, name, info) {
		super(scene, name, info);
		this.input.cursor = 'pointer';
	}
}

export default OutlinePlantObject;