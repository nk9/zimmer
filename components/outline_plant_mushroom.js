import OutlinePlant from './outline_plant';

import { get } from 'lodash-es';

class OutlinePlantMushroom extends OutlinePlant {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.edible = get(info, 'edible');
		this.visible = false;
		this.input.cursor = 'grab';
	}
}

export default OutlinePlantMushroom;