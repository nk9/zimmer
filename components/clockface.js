// Adaped from https://phaser.io/examples/v3/view/time/clock

export default class Clockface extends Phaser.GameObjects.Graphics {
    _time;

    // _scene:  the scene you want to display the clock in
    // x, y:    the position to display the clock
    // radius:  the radius of the clock
    // time:    the initial time, in minutes where 0 is 00:00 and 01:30 is 90.
    constructor(_scene, x, y, radius, time) {
        super(_scene, { x: x, y: y });
        this.radius = radius;
        this.setActive(true);

        this.mline = new Phaser.Geom.Line();
        this.hline = new Phaser.Geom.Line();

        this.time = time;

        _scene.add.existing(this);
    }

    get time() {
        return this._time;
    }

    set time(newTime) {
        let h = Math.round(newTime/60);
        let m = newTime - (h*60);
        this.drawTime(h, m);

        this._time = newTime;
    }

    drawTime(hour, min) {
        this.clear();

    	var hmdeg = (360/12) * (min/60);
    	var hdeg = (360/12) * (hour%12); // Degrees represented exclusively by the hours
    	var mdeg = (360/60) * min;

        // 0 degrees is 3 o'clock, so we have to back up to 12.
    	let hhand = hmdeg + hdeg - 90;
    	let mhand = mdeg - 90;

        console.log(hour, min);

    	let mhand_size = this.radius * 0.95;
    	Phaser.Geom.Line.SetToAngle(this.mline, this.x, this.y, Phaser.Math.DegToRad(mhand), mhand_size);
       	this.lineStyle(6, 0x666666).strokeLineShape(this.mline);

        let hhand_size = this.radius * 0.7;
        Phaser.Geom.Line.SetToAngle(this.hline, this.x, this.y, Phaser.Math.DegToRad(hhand), hhand_size);
        this.lineStyle(10, 0x555555).strokeLineShape(this.hline);
    }


}