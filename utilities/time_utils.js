export function hmFromMinutes(min) {
	let h = Math.floor(min/60);
	let m = min % 60;

    return {h: h, m: m}
}

export function formatMinutes(min) {
	var {h, m} = hmFromMinutes(min);

	if (h == 0) {
		h = 12;
	}

	return `${h}:${m.toString().padStart(2, '0')}`;
}