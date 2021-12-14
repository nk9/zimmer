export function hmFromMinutes(min) {
	let h = Math.round(min/60);
	let m = min % 60;

    return {h: h, m: m}
}

export function formatMinutes(min) {
	let {h, m} = hmFromMinutes(min);
	return `${h}:${m.toString().padStart(2, '0')}`;
}