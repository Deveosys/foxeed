module.exports = {
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				// options placed here will be merged with default configuration and passed to electron-builder
				appId: "com.deveosys.foxeed",
				linux: {
					category: "Utility",
					icon: "./public/icons/icon.png",
					target: [
						"AppImage",
						"deb"
					]
				},
				mac: {
					icon: "./public/icons/icon.icns",
					target: [
						"dmg"
					]
				},
				win: {
					icon: "./public/icons/icon.ico",
					target: [
						"nsis"
					]
				},
				publish: [{
					provider: "github",
					owner: "Deveosys",
					repo: "foxeed"
				}],
  			}
		}
	}
}