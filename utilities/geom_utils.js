// Takes a Phaser.Geom.Rectangle and an object with x and y properties.
// Returns the point on the rectangle closest to the point object.

export function nearestPointOnRect(rect, pointInside) {
	let r = rect;
	let p = pointInside;

	let points = [{
		distance: Math.abs(p.x-r.left),
		point: {x: r.left, y: p.y}
	},{
		distance: Math.abs(p.x-r.right),
		point: {x: r.right, y: p.y}
	},{
		distance: Math.abs(p.y-r.top),
		point: {x: p.x, y: r.top}
	},{
		distance: Math.abs(p.y-r.bottom),
		point: {x: p.x, y: r.bottom}
	}];

	points.sort((a, b) => {
		return a.distance - b.distance;
	});

	return points[0].point;
}