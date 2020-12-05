// Adapted from https://andradearts.com/quick-code-circle-pie-meter-class-for-phaser-3/

class PieMeter extends Phaser.GameObjects.Graphics {

    myRadius;
    direction = 0;

    // _scene:  the scene you want to display the meter in
    // _x, _y:  the position to display the meter
    // _radi:   the fadius of the meter
    // _dir:    the direction of the meter.  Value is either 1 or 0
    // _flip:   flips the meter horizontially and is used in conjunction with the _dir
    constructor(_scene, _x, _y, _radi, _dir, _flip) {
        super(_scene, { x: _x, y: _y });
        this.angle = 0;
        this.alpha = 1;
        this.scaleY = _flip;
        this.setActive(true);
        this.myRadius = _radi;
        this.direction = _dir;
        _scene.add.existing(this);
    }

    // requires a vaule between 0 and 360
    drawPie(degrees) {

        this.clear();
        this.fillStyle(0xffffff, 1);
        let radius = this.myRadius;

        // Rotate to make 0 as 12 o'clock
        this.angle = -90;

        // Don't re-draw after end
        if (degrees != 360) {
            if (this.direction == 0) {
                this.slice(0, 0, radius, 0, Phaser.Math.DegToRad(degrees), true);
            } else {
                this.slice(0, 0, radius, Phaser.Math.DegToRad(degrees), 0, true);
            }
        }

        this.fillPath();

        this.lineStyle(4, 0xffffff, 1);
        this.strokeCircle(0, 0, radius);
    }

}

export default PieMeter;
