var get = require('lodash.get');
// var merge = require('lodash.merge');

const DATA_KEY = 'zimmerData';

class JSONStorage {
	constructor() {
		this.cache = this.loadFile();
	}

	loadFile() {
		// var 
		let onDisk = localStorage.getItem(DATA_KEY);

		if (onDisk === null) {
			return {};
		}

		return JSON.parse(onDisk);
	}

	persistFile() {
		localStorage.setItem(DATA_KEY, JSON.stringify(this.cache));
	}

	set(key, value) {
		this.cache[key] = value;
		this.persistFile();
	}

	get(key) {
		return get(this.cache, key);
	}

	get data() {
		this.cache;
	}
}

export default JSONStorage;