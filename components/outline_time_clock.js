import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

export default class OutlineTimeClock extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);

		// this.leaf_type = get(info, 'leaf_type');
		// this.drag_image = scene.add.image(0, 0, this.leaf_type);
		// this.drag_image.visible = false;
	}
}
