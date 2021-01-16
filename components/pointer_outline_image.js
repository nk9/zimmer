import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

export default class PointerOutlineImage extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);
		this.input.cursor = 'pointer';
	}
}
