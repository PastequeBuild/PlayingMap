const mapWidth = 35
const mapHeight = 15
const db = firebase.database()
let sceneNames

db.ref('scenes').once('value').then( snap => {
	const scenes = snap.val()
	sceneNames = Object.keys(scenes)
	displaySceneList()
})


// --- CREATE NEW SCENE --- //

let newScene = {}

for (let i = 0; i < mapHeight; i++) {
	let line = {}
	for (let j = 0; j < mapWidth; j++) {
		line[j] = null
	}
	newScene[i] = line
}

function askName() {
	const newSceneName = window.prompt('Entrez le nom de la nouvelle scène')
	if (sceneNames.includes(newSceneName)) {
		window.confirm("Ce nom est déjà pris.")
		return askName(sceneNames)
	} else {
		return newSceneName
	}
}


const createSceneButton = document.getElementById('createSceneButton')
createSceneButton.onclick = e => {
	const newSceneName = askName()
	localStorage.setItem('sceneName', newSceneName)
	localStorage.setItem('scene', JSON.stringify(newScene))
	db.ref('scenes/' + newSceneName).set(JSON.stringify(newScene)).then( () => {
		window.location = './scene_editor.html'
	})
}

// --- GENERATE SCENE BUTTON LIST --- //


function displaySceneList() {
	db.ref('selectedScene').once('value').then( snap => {
		let selectedSceneName = snap.val()

		for (sceneName of sceneNames) {
			console.log('i', sceneName)
			const sceneButton = document.createElement('button')
			sceneButton.textContent = sceneName
			sceneButton.className = 'sceneButton'
			sceneButton.onclick = e => {
				db.ref('scenes/' + e.target.textContent).once('value').then( snap => {
					localStorage.setItem('sceneName', e.target.textContent)
					localStorage.setItem('scene', snap.val())
					window.location = './scene_editor.html'
				})
			}
			document.getElementById('sceneList').appendChild(sceneButton)


			const sceneOption = document.createElement('option')
			sceneOption.textContent = sceneName
			sceneOption.value = sceneName
			sceneOption.selected = selectedSceneName === sceneName
			document.getElementById('selectOpenedScene').appendChild(sceneOption)
		}
	})
}

// --- SELECT OPENED SCENE --- //

document.getElementById('selectOpenedScene').onchange = e => {
	db.ref('selectedScene').set(e.target.value)
}



