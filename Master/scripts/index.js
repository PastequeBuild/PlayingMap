const mapWidth = 35
const mapHeight = 15

let newScene = {}

for (let i = 0; i < mapHeight; i++) {
	let line = {}
	for (let j = 0; j < mapWidth; j++) {
		line[j] = 'images/textures/grounds/grass_1.png'
	}
	newScene[i] = line
}

const createSceneButton = document.getElementById('createSceneButton')
createSceneButton.onclick = e => {
	localStorage.setItem('scene', JSON.stringify(newScene))
	window.location = './scene_editor.html'
}


const defaultSceneButton = document.getElementById('defaultSceneButton')
defaultSceneButton.onclick = e => {

	const db = firebase.database()
	db.ref('scenes/default').once('value').then( snap => {
		console.log(snap.val())
		localStorage.setItem('scene', snap.val())
		window.location = './scene_editor.html'
	})
}