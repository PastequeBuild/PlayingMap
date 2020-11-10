// --- VARIABLE INITIALIZATION -- //

const mapContainerElt = document.getElementById('mapContainer')
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight
const mapWidth = 35
const mapHeight = 15
let squareSize = screenWidth / mapWidth
let name = undefined

let walkingPlayerStep = 1


const db = firebase.database()

let players = {}

// --- CREATE OBJECT --- //

function createObject(x, y) {
	const newObject = document.createElement('div')

	newObject.style.width = squareSize + 'px'
	newObject.style.height = squareSize + 'px'

	if (x !== undefined && y !== undefined) {
		newObject.style.left = x * squareSize + 'px'
		newObject.style.bottom = y * squareSize + 'px'
	}
	return newObject
}

// --- CREATE SQUARE --- //

function createSquare() {
	let newSquare = createObject()
	newSquare.className = 'square'
	return newSquare
} 

// --- CREATE SELF PLAYER --- //

function createSelfPlayer(name, x = 0, y = 0) {
	if (name !== undefined && name !== null) {
		const newPlayer = createObject(x, y)
		newPlayer.className = 'player'
		newPlayer.id = 'selfPlayer'
   		newPlayer.style.backgroundImage = 'url("../images/player/skin_1/backward_' + walkingPlayerStep + '.png")'
		const playerRef = db.ref('players/' + name)
		playerRef.set({
			x: x,
			y: y,
			element: newPlayer
		}).then( () => {
			const playerName = document.createElement('span')
			playerName.textContent = name
			playerName.className = 'playerName'
			newPlayer.appendChild(playerName)
			mapContainerElt.appendChild(newPlayer)
		})
	}
}

// --- SELF PLAYER MOVING --- //

function movePlayer(moveX, moveY) {

	if (walkingPlayerStep === 4) {
		walkingPlayerStep = 1
	} else {
		walkingPlayerStep++
	}

	const playerRef = db.ref('players/' + name)
	playerRef.once('value').then( snap => {
		const { x, y } = snap.val()
		const playerElt = document.getElementById('selfPlayer')
		playerElt.animate(
			[
				{ bottom: (y+moveY) * squareSize + 'px', left: (x+moveX) * squareSize + 'px'  },
			], 
			{ 
				// timing options
				duration: 50,
				iterations: 1
			}
		)

		setTimeout( () => {
			playerElt.style.left = (x+moveX) * squareSize + 'px'
			playerElt.style.bottom = (y+moveY) * squareSize + 'px'
		}, 51)
		playerRef.update({
			x: x+moveX,
			y: y+moveY
		}).then( () => {
			/*const playerElt = document.getElementById('selfPlayer')
			playerElt.style.left = (x+moveX) * squareSize + 'px'
			playerElt.style.bottom = (y+moveY) * squareSize + 'px'*/
		})
	})
}

// --- DISPLAY OTHER PLAYER --- //

function displayOtherPlayer(otherPlayerName, x, y) {
	const newOtherPlayer = createObject(x, y)
	newOtherPlayer.className = 'player'
	newOtherPlayer.id = 'otherPlayer:' + otherPlayerName
	newOtherPlayer.style.backgroundImage = "url('../images/player/skin_1/backward_1.png')" 
	const playerName = document.createElement('span')
	playerName.className = 'playerName'
	playerName.textContent = otherPlayerName
	newOtherPlayer.appendChild(playerName)
	mapContainerElt.appendChild(newOtherPlayer)
}

// --- MAP INITIALIZATION --- //

function initMap(scene) {
	for (let i = 0; i < mapHeight; i++) {
		const newLineElt = document.createElement('div')
		newLineElt.className = 'line'
		for (let j = 0; j < mapWidth; j++) {
			let newSquareElt = createSquare()

			if (scene[mapHeight - 1 - i][j] !== null) {
				newSquareElt.style.backgroundImage = "url('../" + scene[mapHeight - 1 - i][j] + "')"
				newSquareElt.style.outlineWidth = '0px'
			}

			newLineElt.appendChild(newSquareElt)
		}
		mapContainerElt.appendChild(newLineElt)
	}
}

// --- ASK NAME --- //

function askName(playerNames) {
	name = window.prompt("Comment t'appelles-tu ?")
	if (playerNames.includes(name)) {
		window.confirm("Ce nom est déjà pris.")
		askName(playerNames)
	} else {
		document.getElementById('nameText').textContent = name
	}
}

// --- LISTEN TO OTHER PLAYERS CREATIONS / MOVES / DELETIONS --- //

db.ref('players').on('value', snap => {

	const newPlayers = snap.val()

	const newPlayerNames = newPlayers === null ? [] : Object.keys(newPlayers)

	if (name === undefined) {
		askName(newPlayerNames)
		createSelfPlayer(name, 0, 0)
	}

	document.getElementById('numberOfPlayersText').textContent = newPlayerNames.length + ' joueurs en ligne'

	//remove players who left
	for (playerName of Object.keys(players)) {
		if (!newPlayerNames.includes(playerName)) {
			document.getElementById('mapContainer').removeChild(document.getElementById('otherPlayer:' + playerName))
		}
	}

	for (playerName of newPlayerNames) {

		if (playerName !== name) {
			if (Object.keys(players).includes(playerName)) {

				const otherPlayer = document.getElementById('otherPlayer:' + playerName)

				//handle move
				if (newPlayers[playerName].x !== players[playerName].x) {
					if (newPlayers[playerName].x > players[playerName].x) {
						otherPlayer.style.backgroundImage = "url('../images/player/skin_1/right_1.png')" 
					} else {
						otherPlayer.style.backgroundImage = "url('../images/player/skin_1/left_1.png')" 
					}

					players[playerName].x = newPlayers[playerName].x
					otherPlayer.style.left = players[playerName].x * squareSize + 'px'
				}
				if (newPlayers[playerName].y !== players[playerName].y) {

					if (newPlayers[playerName].y > players[playerName].y) {
						otherPlayer.style.backgroundImage = "url('../images/player/skin_1/forward_1.png')" 
					} else {
						otherPlayer.style.backgroundImage = "url('../images/player/skin_1/backward_1.png')" 
					}

					players[playerName].y = newPlayers[playerName].y
					otherPlayer.style.bottom = players[playerName].y * squareSize + 'px'
				}

			} else {
				//handle new player
				players[playerName] = newPlayers[playerName]
				displayOtherPlayer(playerName, players[playerName].x, players[playerName].y)
			}
		}
	}
})

// --- QUIT --- //

window.addEventListener("beforeunload", e => {
	db.ref('players/' + name).remove()
})

// --- EXECUTION --- //

db.ref('selectedScene').once('value').then( selectedSceneSnap => {
	const selectedScene = selectedSceneSnap.val()
	db.ref('scenes/' + selectedScene).once('value').then( sceneSnap => {
		scene = JSON.parse(sceneSnap.val())
		initMap(scene)
	})
})

document.onkeypress = e => {

    e = e || window.event
    const letter = String.fromCharCode(e.keyCode)

    switch (letter) {
    	case 'z':
    		document.getElementById('selfPlayer').style.backgroundImage = 'url("../images/player/skin_1/forward_' + walkingPlayerStep + '.png")'
    		movePlayer(0, 1)
    		break
    	case 's':
    		document.getElementById('selfPlayer').style.backgroundImage = 'url("../images/player/skin_1/backward_' + walkingPlayerStep + '.png")'
    		movePlayer(0, -1)
    		break
    	case 'd':
    		document.getElementById('selfPlayer').style.backgroundImage = 'url("../images/player/skin_1/right_' + walkingPlayerStep + '.png")'
    		movePlayer(1, 0)
    		break
    	case 'q':
     		document.getElementById('selfPlayer').style.backgroundImage = 'url("../images/player/skin_1/left_' + walkingPlayerStep + '.png")'
    		movePlayer(-1, 0)
    		break
    }
}



