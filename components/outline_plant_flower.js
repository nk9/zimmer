import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

class OutlinePlantFlower extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.color = get(info, 'color');
		this.shape = get(info, 'shape');
		this.drag_image = scene.add.image(0, 0, name+"_drag_image");
		this.drag_image.visible = false;
	}
}

export default OutlinePlantFlower;