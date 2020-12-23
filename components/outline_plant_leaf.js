import OutlinePlant from './outline_plant';

import { get } from 'lodash-es';

class OutlinePlantLeaf extends OutlinePlant {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.leaf_type = get(info, 'leaf_type');
		this.drag_image = scene.add.image(0, 0, this.leaf_type);
		this.drag_image.visible = false;
	}
}

export default OutlinePlantLeaf;