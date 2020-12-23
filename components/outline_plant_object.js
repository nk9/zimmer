import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

class OutlinePlantObject extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);
		this.input.cursor = 'pointer';
	}
}

export default OutlinePlantObject;