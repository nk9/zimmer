import log from 'loglevel';

import { Scene } from 'phaser';

import { GAME_WIDTH, GAME_HEIGHT } from '../constants/config'

export default class Lockscreen extends Scene {
	create() {
		let data = this.scene.settings.data;

		this.enteredText = '';

		const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
		const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;
		const width = 400;
		const height = 0;

		let contentStyle = {
			fontSize: '18px',
			fontFamily: 'sans-serif',
			align: "center",
			wordWrap: { width: width-30, useAdvancedWrap: true } // width minus 2*inset
		};
		let content = this.add.text(0, 0, data.content, contentStyle);
		let contentBounds = content.getBounds();

		let bg = this.add.rectangle(screenCenterX, screenCenterY, width, GAME_HEIGHT, 0x000000, .9);
		bg.setStrokeStyle(3, 0xffffff)
		bg.setOrigin(0.5, 0.5);
		bg.setDepth(-1);

		let inset = Phaser.Geom.Rectangle.Inflate(bg.getBounds(), -15, -15);

		this.entryField = this.createEntryField(500, 170)
		this.entryField.x = GAME_WIDTH/2;
		this.entryFieldLength = data.answer.length; // Needs to be dynamic, passed in by data

		this.updateEntryField()
		this.createButtonGrid(500, 250)

		let title = this.add.text(inset.centerX, inset.y, data.title, {fontSize: '22px', fontFamily: 'sans-serif'});
		title.setOrigin(0.5, 0);

		let titleBottomLeft = title.getBottomLeft();
		content.x = inset.x;
		content.y = titleBottomLeft.y+20;

		this.buttonRect = this.add.rectangle(inset.right, inset.bottom, 150, 36, 0x000000, .5);
		this.buttonRect.setStrokeStyle(2, 0xffffff);
		this.buttonRect.setOrigin(1, 1);

		let btnBounds = this.buttonRect.getBounds();
		this.buttonText = this.add.text(btnBounds.centerX, btnBounds.centerY, data.buttonText, {fontSize: '24px', fontFamily: 'sans-serif'});
		this.buttonText.setOrigin(0.5, 0.5);
		this.buttonText.setDepth(10);

		this.buttonRect.setInteractive({useHandCursor: true})
			.on('pointerover', () => {
				this.buttonRect.setFillStyle(0xeeeeee, 1);
				this.buttonText.setColor('#f00');
			})
			.on('pointerout', () => {
				this.buttonRect.setFillStyle(0x000000, 1);
				this.buttonText.setColor('#fff');
			})
			.on('pointerup', (pointer, localX, localY, event) => {
				const bound = data.buttonAction.bind(data.context);
				event.stopPropagation(); // Doesn't work?? Probably a Phaser bug.
				bound();
			});
	}

	createButtonGrid(x, y) {
		let buttons = [
			{'number': '1', 'letters': ''},
			{'number': '2', 'letters': 'ABC'},
			{'number': '3', 'letters': 'DEF'},
			{'number': '4', 'letters': 'GHI'},
			{'number': '5', 'letters': 'JKL'},
			{'number': '6', 'letters': 'MNO'},
			{'number': '7', 'letters': 'PQRS'},
			{'number': '8', 'letters': 'TUV'},
			{'number': '9', 'letters': 'WXYZ'},
			{'number': '0', 'letters': ''},
		]

		var row = 0;

		buttons.forEach((button_dict, index) => {
			let row = Math.floor(index / 3);
			let col = index % 3;

			if (button_dict.number == '0') {
				col = 1;
			}

			this.createCircleButton(x + (col*100), y + (row*100), button_dict.number, button_dict.letters)
		});
	}

	createEntryField(x, y) {
		let entryfield_style = {
			fontSize: '40px',
			fontFamily: 'monospace',
			align: "center"
		};
		let entryfield = this.add.text(x, y, '', entryfield_style);
		entryfield.setOrigin(0.5, 1);

		return entryfield
	}

	updateEntryField() {
		var fieldText = '';
		for (var i = 0; i < this.entryFieldLength; i++) {
			if (i < this.enteredText.length) {
				fieldText = fieldText.concat('*');
			} else {
				fieldText = fieldText.concat('-');
			}

			// Another one is coming
			if (i+1 < this.entryFieldLength) {
				fieldText = fieldText.concat(' ');
			}
		}

		this.entryField.text = fieldText;
	}

	pressDigit(title_str) {
		log.debug(`clicked ${title_str}`);

		if (this.enteredText.length < this.entryFieldLength) {
			this.enteredText = this.enteredText.concat(title_str);
			this.updateEntryField()
		}

		if (this.enteredText.length == this.entryFieldLength) {
			this.handleGuess()
		}
	}

	createCircleButton(x, y, title_str, subtitle_str) {
		let circle = this.add.circle(x, y, 40, 0x111111, 1);
		circle.setStrokeStyle(2, 0xffffff);
		circle.zTitle = title_str;

		let down_shift = 10
		let title_style = {
			fontSize: '40px',
			fontFamily: 'sans-serif',
			align: "center"
		};
		let title = this.add.text(x, y+down_shift, title_str, title_style);
		title.setOrigin(0.5, 1);

		let subtitle_style = {
			fontSize: '11px',
			fontFamily: 'sans-serif',
			align: "center"
		};
		let subtitle = this.add.text(x, y+down_shift, subtitle_str, subtitle_style);
		subtitle.setOrigin(0.5, 0);

		circle.setInteractive({useHandCursor: true})
			.on('pointerup', () => this.pressDigit(title_str))
		return circle
	}

	handleGuess() {
		let data = this.scene.settings.data
		if (this.enteredText == data.answer) {
			log.debug('CORRECT');
			data.context.lockscreenSuccess(this.scene.key, data.phoneNum);
		} else {
			data.context.lockscreenFailure(this.scene.key);
		}
	}
}
