import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

export default class OutlinePlantMushroom extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.edible = get(info, 'edible');
		this.visible = false;
		this.input.cursor = 'grab';
	}
}
