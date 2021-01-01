import StoredOutlineImage from './stored_outline_image';

import { get } from 'lodash-es';

class NumberSentenceImage extends StoredOutlineImage {
	constructor(scene, name, info) {
		super(scene, name, info);

		this.img_answer = scene.add.image(0, 0, name+'_answer');
		this.img_answer.visible = false;
		this.input.dropZone = true;
		this.add(this.img_answer);
	}

	reset() {
		this.img.visible = true;
		this.img_answer.visible = false;
		this.img_outline.visible = false;

		this.input.enabled = true;
	}

	revealAnswer() {
		this.img.visible = false;
		this.img_answer.visible = true;
		this.img_outline.visible = false;

		this.input.enabled = false;
	}
}

export default NumberSentenceImage;