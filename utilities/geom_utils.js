// Takes a Phaser.Geom.Rectangle and an object with x and y properties.
// Returns the point on the rectangle closest to the point object.

function nearestEdgeOnRect(rect, pointInside) {
	let r = rect;
	let p = pointInside;

	let points = [{
		distance: Math.abs(p.x-r.left),
		point: {x: r.left, y: p.y},
		edge: rect.getLineD(),
	},{
		distance: Math.abs(p.x-r.right),
		point: {x: r.right, y: p.y},
		edge: rect.getLineB(),
	},{
		distance: Math.abs(p.y-r.top),
		point: {x: p.x, y: r.top},
		edge: rect.getLineA(),
	},{
		distance: Math.abs(p.y-r.bottom),
		point: {x: p.x, y: r.bottom},
		edge: rect.getLineC(),
	}];

	points.sort((a, b) => {
		return a.distance - b.distance;
	});

	return points[0];
}

export function nearestPointOnRect(rect, pointInside) {
	let nearestEdge = nearestEdgeOnRect(rect, pointInside);
	
	return nearestEdge.point;
}

export function randomPointOnNearestEdge(rect, pointInside) {
	let nearestEdge = nearestEdgeOnRect(rect, pointInside);

	return Phaser.Geom.Line.Random(nearestEdge.edge);
}