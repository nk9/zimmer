import OutlineImage from './outline_image';

import { get } from 'lodash-es';

class StoredOutlineImage extends OutlineImage {
	constructor(scene, name, info) {
		let x = get(info, 'x', 0);
		let y = get(info, 'y', 0);
		let scale = get(info, 'scale', 0.5);
		
		super(scene, name, x, y, scale);
	}
}

export default StoredOutlineImage;