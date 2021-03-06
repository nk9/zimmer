import { get } from 'lodash-es'

const DATA_KEY = 'zimmerData';

export default class JSONStorage {
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
		return this.cache;
	}
}
