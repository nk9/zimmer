import Phaser from 'phaser'

function preload() {
	// this.load.setBaseURL('http://labs.phaser.io')
	this.load.image('hallway', 'assets/pics/hallway.jpg')
	this.load.image('under_bridge', 'assets/pics/under_the_bridge.jpg')
}

function create() {
	var hallway = this.add.image(0, 0, 'hallway')
	hallway.setOrigin(0,0)

	// var under_bridge = this.add.image(0, 0, 'under_bridge')
	// under_bridge.setOrigin(0,0)
}

const config = {
	type: Phaser.AUTO,
	width: 1200,
	height: 768,
	scene: {
		preload: preload,
		create: create,
	},
}

const game = new Phaser.Game(config)
