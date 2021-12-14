// Adaped from https://phaser.io/examples/v3/view/time/clock

export default class Clockface extends Phaser.GameObjects.Graphics {
	radius;

    // _scene:  the scene you want to display the meter in
    // _x, _y:  the position to display the meter
    // _radi:   the fadius of the meter
    constructor(_scene, _x, _y, _radi) {
        super(_scene, { x: _x, y: _y });
        // this.alpha = 1;
        this.radius = _radi;
        this.setActive(true);
        _scene.add.existing(this);
    }

    drawTime(hour, min) {
    	var hmdeg = (360/12) * (min/60);
    	var hdeg = (360/12) * (hour%12); // Degrees represented exclusively by the hours
    	var mdeg = (360/60) * min;

    	let hhand = hmdeg + hdeg - 90;
    	let mhand = mdeg - 90;

        this.lineStyle(4, 0xffffff, 1);
    	this.strokeCircle(this.x, this.y, this.radius);

    	let mhand_size = this.radius * 0.9;

    	let hhand_size = this.radius * 0.8;

    	let twelve = new Phaser.Geom.Point(this.x, this.y - this.radius);
    	let line = new Phaser.Geom.Line(this.x, this.y, twelve.x, twelve.y);
    	this.lineStyle(10, 0xffffff).strokeLineShape(line);
    }

}