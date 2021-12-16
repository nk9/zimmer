import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

export default class OutlineTimeClock extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.progress = get(info, 'progress');
		this.solved_image = scene.add.image(0, 0, name+"_solved");
		this.solved_image.visible = false;
		this.add(this.solved_image);
	}

	markSolved() {
		this.img.visible = false;
		this.img_outline.visible = false;
		this.solved_image.visible = true;

		this.input.enabled = false;
	}
}
