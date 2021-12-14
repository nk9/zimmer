// Adaped from https://phaser.io/examples/v3/view/time/clock

export default class Clockface extends Phaser.GameObjects.Graphics {
	radius;

    // _scene:  the scene you want to display the meter in
    // _x, _y:  the position to display the meter
    // _radi:   the fadius of the meter
    constructor(_scene, _x, _y, _radi) {
        super(_scene, { x: _x, y: _y });
        this.radius = _radi;
        this.setActive(true);

        this.mline = new Phaser.Geom.Line();
        this.hline = new Phaser.Geom.Line();
        _scene.add.existing(this);
    }

    drawTime(hour, min) {
    	var hmdeg = (360/12) * (min/60);
    	var hdeg = (360/12) * (hour%12); // Degrees represented exclusively by the hours
    	var mdeg = (360/60) * min;

        // 0 degrees is 3 o'clock, so we have to back up to 12.
    	let hhand = hmdeg + hdeg - 90;
    	let mhand = mdeg - 90;

    	let mhand_size = this.radius * 0.95;
    	Phaser.Geom.Line.SetToAngle(this.mline, this.x, this.y, Phaser.Math.DegToRad(mhand), mhand_size);
       	this.lineStyle(6, 0x666666).strokeLineShape(this.mline);

        let hhand_size = this.radius * 0.7;
        Phaser.Geom.Line.SetToAngle(this.hline, this.x, this.y, Phaser.Math.DegToRad(hhand), hhand_size);
        this.lineStyle(10, 0x555555).strokeLineShape(this.hline);
    }
}