import Brick, { LEGO_GRID } from '../components/brick';

import { shuffle } from 'lodash-es';

export const BSBrick = {
	B1x1:		{hL: 1, wL: 1},
	B1x2:		{hL: 1, wL: 2},
	B1x3:		{hL: 1, wL: 3},
	B1x4:		{hL: 1, wL: 4},
	B1x5:		{hL: 1, wL: 5},
	B1x6:		{hL: 1, wL: 6},
	B1x7:		{hL: 1, wL: 7},
	B1x8:		{hL: 1, wL: 8},
	B2x2:		{hL: 2, wL: 2},
	B2x3:		{hL: 2, wL: 3},
	B2x4:		{hL: 2, wL: 4},
}

class BrickStore {

	constructor(_scene, xL, yL) {
		[this.x, this.y] = [xL, yL].map(n => n * LEGO_GRID);
		this.bricks = [];
		this.brickRows = [];
		this.scene = _scene;
	}

	addRow(...args) {
		var newRow = [];

		for (const obj of args) {
			let brick = new Brick(this.scene, obj.wL, obj.hL, 0, 0);
			newRow.push(brick);
		}

		this.brickRows.push(newRow);
		this.generateBricksArray();
	}

	generateBricksArray() {
		this.bricks = [];

		for (const row of this.brickRows) {
			this.bricks.push(...row);
		}
	}

	shuffle() {
		for (var row of this.brickRows) {
			row = shuffle(row);
		}

		this.brickRows = shuffle(this.brickRows);

		this.layoutBricks();
		this.generateBricksArray();
	}

	layoutBricks() {
		var yCur = this.y;

		for (const row of this.brickRows) {
			var xCur = this.x, maxHeight = 0;

			for (const brick of row) {
				brick.setInitialPosition(xCur, yCur);
				xCur += brick.width + LEGO_GRID;
				maxHeight = Math.max(maxHeight, brick.height);
			}

			yCur += maxHeight + LEGO_GRID;
		}
	}

	toString() {
		var str = 'By Row:\n';

		for (const [i, row] of this.brickRows.entries()) {
			str += `\n Row ${i}\n`;
			for (const brick of row) {
				str += `  ${brick.legoTotal} [${brick.legoW}x${brick.legoH}] (${brick.x}, ${brick.y})\n`;
			}
		}

		str += '\n\nBy Individiual Bricks:\n\n';
		for (const [i, brick] of this.bricks.entries()) {
			let rownum = `${i}`.padStart(2, '0');
			str += `${rownum} ${brick.legoTotal} [${brick.legoW}x${brick.legoH}] (${brick.x}, ${brick.y})\n`;
		}

		return str;
	}
}

export default BrickStore;