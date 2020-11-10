// --- VARIABLE INITIALIZATION -- //

const mapContainerElt = document.getElementById('mapContainer')
const screenWidth  = window.innerWidth
const screenHeight = window.innerHeight
const mapWidth = 35
const mapHeight = 15
let squareSize = screenWidth / mapWidth
let isInventoryOpened = false
let selectedTexture = 'eraser'

let scene = localStorage.getItem('scene')
scene = JSON.parse(scene)
let sceneName = localStorage.getItem('sceneName')
console.log('initialized scene', sceneName)

const db = firebase.database()

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

function createSquare(x, y) {
	let newSquare = createObject(x, y)
	newSquare.className = 'square'
	newSquare.id = 'square:' + x + '-' + y
	return newSquare
}

// --- MAP INITIALIZATION --- //

function initMap() {

	for (let i = 0; i < mapHeight; i++) {
		const newLineElt = document.createElement('div')
		newLineElt.className = 'line'
		for (let j = 0; j < mapWidth; j++) {
			let newSquareElt = createSquare(j, i)
			newSquareElt.id = 'square:' + j + '-' + i
			if (scene[mapHeight - 1 - i][j] !== null) {
				newSquareElt.style.backgroundImage = "url('../" + scene[mapHeight - 1 - i][j] + "')"
				newSquareElt.style.outlineWidth = '0px'
			}
			newLineElt.appendChild(newSquareElt)
		}
		mapContainerElt.appendChild(newLineElt)
	}
}

// --- QUIT --- //

window.addEventListener("beforeunload", e => {

})

// --- EXECUTION --- //

initMap()

// --- INVENTORY --- //

document.onkeypress = e => {

    e = e || window.event

    if (e.key === 'e') {
    	if (isInventoryOpened) {
    		closeInventory()
    	} else {
    		openInventory()
    	}
    }
}

function openInventory() {
    document.getElementById('inventoryContainer').style.visibility = 'visible'
    isInventoryOpened = true
}

function closeInventory() {
    document.getElementById('inventoryContainer').style.visibility = 'hidden'
    isInventoryOpened = false
}

// --- PAINT --- //

let isMouseDown = false

document.addEventListener('mousedown', e => {
	isMouseDown = true
})

document.addEventListener('mouseup', e => {
	isMouseDown = false
})

document.addEventListener('mousemove', e => {
	if (isMouseDown) {
		const x = Math.floor(e.clientX/squareSize)
		const y = Math.floor((screenHeight-e.clientY)/squareSize)
		if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
			//document.getElementById('coords').textContent = x + ' ' + y
			let divY = mapHeight-y-1

			if (selectedTexture === 'eraser') {
				scene[y][x] = null
				document.getElementById('square:' + x + '-' + divY).style.backgroundImage = ''
				document.getElementById('square:' + x + '-' + divY).style.outlineWidth = '0.01px'
			} else {
				scene[y][x] = selectedTexture
				document.getElementById('square:' + x + '-' + divY).style.backgroundImage = "url('../" + selectedTexture + "')"
				document.getElementById('square:' + x + '-' + divY).style.outlineWidth = '0px'		
			}
		} else {
			//document.getElementById('coords').textContent = 'hors zone'
		}
	}
})

// --- INVENTORY --- //

for (item of document.getElementsByClassName('inventoryItem')) {
	item.onclick = e => {
		closeInventory()
		if (e.target.alt === 'eraser') {
			selectedTexture = 'eraser'
		} else {
			const src = 'images' + e.target.src.split('images')[1]
			selectedTexture = src
		}
	}
}

// --- SAVE SCENE --- //

document.getElementById('saveButton').onclick = e => {
	db.ref('scenes/' + sceneName).set(JSON.stringify(scene))
}


// --- ERASE SCENE --- //

document.getElementById('eraseAllButton').onclick = e => {
	for (let i = 0; i < mapHeight; i++) {
		for (let j = 0; j < mapWidth; j++) {
			let square = document.getElementById('square:' + j + '-' + i)
			square.id = 'square:' + j + '-' + i
			square.style.backgroundImage = ''
			square.style.outlineWidth = '0.01px'
			scene[i][j] = null
		}
	}
}



