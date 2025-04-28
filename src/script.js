// to do
// add change board color option
// wins and losses
// save settings when new game??
// show available moves for pieces
// improve design???
// make easier accessibility for king promotion
// fix issues that arised
// fix the highlight feature
// fix new game button timer
// fix end game popup timer

var boardContainer = document.getElementById("boardContainer")
const rows = 8,
  cols = 8
let board = []
let currentPlayer = "black"
let selectedPiece = null
let redTime = 180 // 3 minutes in seconds for the red player
let blackTime = 180 // 3 minutes in seconds for the black player
let timerInterval // Timer interval
let gameStarted = false // Flag to check if the game has started
let player1Score = 0
let player2Score = 0
let player1Wins = 0
let player2Wins = 0

//sounds for the game
//make them functions later
const sound = new Audio("sounds/boom.mov")
const buttons = document.querySelectorAll(".button")
const soundClick = new Audio("sounds/buttonclick.mp3")
const startSound = new Audio("sounds/board_start.mp3")
const moveSound = new Audio("sounds/moving.mp3")
const takeSound = new Audio("sounds/take.mp3")
const promoteSound = new Audio("sounds/promote.mp3")
const winNoise = new Audio("sounds/yippee-tbh.mp3")


//can add more cords in jumps to hop over 3 or more peices
const moveSet = [
  { piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  { piece: "black", enemy: "red", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]} //left
]
const kingMoveSet = [
  //add jump down then up for left and right
  { piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "red", enemy: "black", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  { piece: "red", enemy: "black", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]}, //left
  { piece: "black", enemy: "red", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "black", enemy: "red", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  { piece: "black", enemy: "red", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]} //left
]

// Timer functionality
function startTimer() {
  clearInterval(timerInterval) // Clear the previous timer
  if (!gameStarted) return // Don't start the timer if the game hasn't started yet
  timerInterval = setInterval(() => {
    if (currentPlayer === "red") {
      redTime-- // Decrease red's timer
      document.getElementById("timer").textContent =
        `Red Time Left: ${formatTime(redTime)} | Black Time Left: ${formatTime(blackTime)}`
      if (redTime <= 0) {
        clearInterval(timerInterval)
        endGame("Red player ran out of time!")
      }
    } else if (currentPlayer === "black") {
      blackTime-- // Decrease black's timer
      document.getElementById("timer").textContent =
        `Red Time Left: ${formatTime(redTime)} | Black Time Left: ${formatTime(blackTime)}`
      if (blackTime <= 0) {
        clearInterval(timerInterval)
        endGame("Black player ran out of time!")
      }
    }
  }, 1000) // Update every second
}

// Helper function to format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

// Switch player and reset the timer
function switchPlayer() {
  clearInterval(timerInterval) // Stop the current timer before switching players
  currentPlayer = currentPlayer === "red" ? "black" : "red" // Switch to the other player
  const player1Name = document.getElementById("player1").value || "Player 1"
  const player2Name = document.getElementById("player2").value || "Player 2"
  const playerTurnElement = document.querySelector(".player-turn")

  if (playerTurnElement) {
    playerTurnElement.textContent = `${currentPlayer === "red" ? player2Name : player1Name}'s Turn`
  }

  startTimer() // Start the timer for the next player
}

// End the game
function endGame(reason) {
  clearInterval(timerInterval)
  gameStarted = false

  const player1Name = document.getElementById("player1").value || "Player 1"
  const player2Name = document.getElementById("player2").value || "Player 2"

  // Determine winner based on current game state
  const redPieces = document.querySelectorAll(".piece.red").length
  const blackPieces = document.querySelectorAll(".piece.black").length

  let winner
  if (reason.includes("time")) {
    winner = currentPlayer === "red" ? player1Name : player2Name
  } else {
    winner = redPieces === 0 ? player1Name : player2Name
  }

  const score = `${player2Score} - ${player1Score}`

  showGameOver(winner, score, reason)
  winNoise.currentTime = 0
  winNoise.play()
}
//makes board
function setupBoard() {
  boardContainer.innerHTML = ""
  for (let row = 0; row < rows; row++) {
    board[row] = [] //make 2d
    for (let col = 0; col < cols; col++) {
      const square = document.createElement("div")
      square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark") //adds square light or square dark class
      square.dataset.row = row //stores row
      square.dataset.col = col //stores col
      square.addEventListener("click", handleClick)
      if ((row + col) % 2 === 1) {
        // Only on dark squares
        if (row < 3) {
          addPiece(square, "red")
          board[row][col] = "red"
        } else if (row > 4) {
          addPiece(square, "black")
          board[row][col] = "black"
        } else {
          board[row][col] = null
        }
      } else {
        board[row][col] = null
      }
      boardContainer.appendChild(square)
    }
  }
  enableDragAndDrop()
}

//creates and adds appends the piece to the square
function addPiece(square, color) {
  const piece = document.createElement("div")
  piece.dataset.king = "false"
  piece.classList.add("piece", color)
  square.appendChild(piece)
}

//click on square
function handleClick(event) {
  const square = event.target.closest(".square") //current clicked
  const row = parseInt(square.dataset.row)
  const col = parseInt(square.dataset.col)

  if (board[row][col] === currentPlayer) {
    soundClick.currentTime = 0
    soundClick.play()
  }

  if (selectedPiece) {
    //if selectedPiece is not empty
    let valid = validMove(selectedPiece.row, selectedPiece.col, row, col)

    //change selected square
    if (
      board[row][col] == currentPlayer &&
      board[selectedPiece.row][selectedPiece.col] == currentPlayer
    ) {
      selectedPiece.element.style.border = "none"
      selectedPiece = { row, col, element: square }
      square.style.border = "3px solid yellow"
    } else if (!valid) {
      //if trys to move where antoher is
      console.log("NON VALID MOVE")
    } else {
      movePiece(selectedPiece.row, selectedPiece.col, row, col, valid)
      selectedPiece = ""
    }
  } else if (board[row][col] === currentPlayer) {
    selectedPiece = { row, col, element: square }
    square.style.border = "3px solid yellow" // Highlight selected piece
  }
}

//move piece
function movePiece(fromRow, fromCol, toRow, toCol, valid) {
  //check if valid move
  if (!valid) return
  moveSound.currentTime = 0
  moveSound.play()

  if (!gameStarted) {
    gameStarted = true // Set the flag to true when the game starts
    startTimer() // Start the timer when the game starts
  }

  //update visuals
  const fromSquare = getSquare(fromRow, fromCol)
  const toSquare = getSquare(toRow, toCol)
  toSquare.append(fromSquare.firstChild)

  //change the array
  board[toRow][toCol] = board[fromRow][fromCol]
  board[fromRow][fromCol] = null

  //check if should be king
  checkIfKing(toRow, toCol)

  //switch player
  switchPlayer()

  //clear the border
  fromSquare.style.border = "none"

  highlightMovablePieces()
}

function highlightMovablePieces() {
  // Clear previous highlights
  document.querySelectorAll(".square").forEach((square) => {
    square.style.border = "none"
  })

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === currentPlayer) {
        // Check if the piece has any valid moves
        const moves = getValidMoves(row, col)
        if (moves.length > 0) {
          const square = getSquare(row, col)
          square.style.border = "2px solid green" // Highlight movable pieces
        }
      }
    }
  }
}

//Helper function to get valid moves for a piece
function getValidMoves(row, col) {
  const validMoves = []
  const directions = []

  // Define movement directions based on player and whether it's a king
  if (getSquare(row, col).firstChild.dataset.king === "true") {
    directions.push([1, 1], [1, -1], [-1, 1] ,[-1, -1])
  } else if (board[row][col] === "red") {
    directions.push([1, 1], [1, -1])
  } else {
    directions.push([-1, 1], [-1, -1])
  }

  // Check each direction for valid moves
  directions.forEach(([rowDiff, colDiff]) => {
    const newRow = row + rowDiff
    const newCol = col + colDiff

    // Ensure the move is within bounds and valid
    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      if (board[newRow][newCol] === null) {
        validMoves.push({ row: newRow, col: newCol })
      } else {
        nextRow = newRow
        nextCol = newCol
        if (rowDiff > 0) {
          nextRow++
        } else {
          nextRow--
        }
        if (colDiff > 0) {
          nextCol++
        } else {
          nextCol--
        }
        if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols && board[nextRow][nextCol] === null && board[row][col] != board[newRow][newCol]) {
          validMoves.push({ row: nextRow, col: nextCol })
        }
      }
    }
  })

  return validMoves
}

function validMove(fromRow, fromCol, toRow, toCol) {
  if (board[toRow][toCol] != null) return false //must move to an empty square

  const rowDiff = toRow - fromRow
  const colDiff = Math.abs(toCol - fromCol)

  //chek if in bounds of board
  for (let x of moveSet) {
    if (getSquare(fromRow, fromCol).firstChild.dataset.king == "false") {
      if (hops(fromRow, fromCol, toRow, toCol, x)) {
        return true
      }
    }
  }

  //if king
  if (getSquare(fromRow, fromCol).firstChild.dataset.king == "true") {
    if (
      (fromRow + 1 == toRow && fromCol + 1 == toCol) ||
      (fromRow + 1 == toRow && fromCol - 1 == toCol) ||
      (fromRow - 1 == toRow && fromCol + 1 == toCol) ||
      (fromRow - 1 == toRow && fromCol - 1 == toCol)
    ) {
      return true
    }
    for (let x of kingMoveSet) {
      if (hops(fromRow, fromCol, toRow, toCol, x)) {
        return true
      }
    }
    return false
  }

  //checks if single square move is valid
  //with colDiff check if trying to move to far to right or left
  //with rowDiff it checks if trying to move back
  if (
    colDiff != 1 ||
    (currentPlayer == "red" && rowDiff != 1) ||
    (currentPlayer == "black" && rowDiff != -1)
  ) {
    console.log("non valid")
    return false
  }
  return true
}

//take piece
function removePiece(row, col) {
  const removeSquare = getSquare(row, col)
  removeSquare.innerHTML = ""
  board[row][col] = null
}

//converts piece
function checkIfKing(row, col) {
  if (currentPlayer == "red" && row == 7) {
    const toKing = getSquare(row, col)
    // Check if piece is not already a king
    if (toKing.firstChild.dataset.king !== "true") {
      toKing.firstChild.classList.add("king")
      toKing.firstChild.dataset.king = "true"

      // Get the current piece color and make it darker
      const currentColor = window.getComputedStyle(
        toKing.firstChild,
      ).backgroundColor
      const hexColor = rgbToHex(currentColor)
      const darkerColor = darkenColor(hexColor, 20)
      toKing.firstChild.style.backgroundColor = darkerColor
      promoteSound.currentTime = 0
      promoteSound.play()
    }
  }
  if (currentPlayer == "black" && row == 0) {
    const toKing = getSquare(row, col)
    // Check if piece is not already a king
    if (toKing.firstChild.dataset.king !== "true") {
      toKing.firstChild.classList.add("king")
      toKing.firstChild.dataset.king = "true"

      // Get the current piece color and make it darker
      const currentColor = window.getComputedStyle(
        toKing.firstChild,
      ).backgroundColor
      const hexColor = rgbToHex(currentColor)
      const darkerColor = darkenColor(hexColor, 20)
      toKing.firstChild.style.backgroundColor = darkerColor

      promoteSound.currentTime = 0
      promoteSound.play()
    }
  }
}

//move over 1 or move peice
function hops(fromRow, fromCol, toRow, toCol, moves) {
  let { piece, enemy, jumps } = moves
  let i = 0
  j = 1
  for (; j < jumps.length; ) {
    if (fromRow + jumps[i] == toRow && fromCol + jumps[j] == toCol) {
      if (
        board[fromRow][fromCol] == piece &&
        board[fromRow + jumps[0]][fromCol + jumps[1]] == enemy &&
        board[fromRow + jumps[2]][fromCol + jumps[3]] == null
      ) {
        //single
        if (toRow == fromRow + jumps[2] && toCol == fromCol + jumps[3]) {
          removePiece(fromRow + jumps[0], fromCol + jumps[1])
          // Update score for single capture
          updateScore(currentPlayer === "red" ? 1 : 2)
          return true
        }
        //double same (r-r or l-l)
        if (
          board[fromRow + jumps[4]][fromCol + jumps[5]] == enemy &&
          fromRow + jumps[6] == toRow &&
          fromCol + jumps[7] == toCol
        ) {
          removePiece(fromRow + jumps[4], fromCol + jumps[5])
          removePiece(fromRow + jumps[0], fromCol + jumps[1])
          // Update score for double capture
          updateScore(currentPlayer === "red" ? 1 : 2)
          updateScore(currentPlayer === "red" ? 1 : 2)
          return true
        }
        //double diff (r-l or l-r)
        if (
          board[fromRow + jumps[4]][fromCol + jumps[1]] == enemy &&
          fromRow + jumps[8] == toRow &&
          fromCol + jumps[9] == toCol
        ) {
          removePiece(fromRow + jumps[4], fromCol + jumps[1])
          removePiece(fromRow + jumps[0], fromCol + jumps[1])
          // Update score for double capture
          updateScore(currentPlayer === "red" ? 1 : 2)
          updateScore(currentPlayer === "red" ? 1 : 2)
          return true
        }
      }
    } else i = i + 2
    j = j + 2
  }
}

//gets the square div
function getSquare(row, col) {
  //in class square with where .dataset.row and .col = row,col
  return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`)
}

//add a function for the new game button

function newGame() {
  boardContainer.innerHTML = "" // Clear the board
  currentPlayer = "black" // Reset current player to black
  setupBoard() // Set up the board again
  resetTime() //restart the timer
  gameStarted = false // Reset game started flag
  highlightMovablePieces()
  resetScores() // Reset scores
}

//add a popup for the settings for changing colors and pieces
function openSettings() {
  const settingsPopup = document.getElementById("settingsPopup")
  settingsPopup.style.display = "block"

  const redPiece = document.querySelector(".piece.red")
  const blackPiece = document.querySelector(".piece.black")

  if (redPiece) {
    document.getElementById("redColor").value = rgbToHex(
      getComputedStyle(redPiece).backgroundColor,
    )
  }
  if (blackPiece) {
    document.getElementById("blackColor").value = rgbToHex(
      getComputedStyle(blackPiece).backgroundColor,
    )
  }
  document.getElementById("gameTimer").value = Math.floor(redTime / 60)
}

function closeSettings() {
  const settingsPopup = document.getElementById("settingsPopup")
  settingsPopup.style.display = "none"
}

function rgbToHex(rgb) {
  if (rgb.startsWith("#")) return rgb
  const values = rgb.match(/\d+/g)
  if (!values) return "#000000"
  const r = parseInt(values[0])
  const g = parseInt(values[1])
  const b = parseInt(values[2])
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function darkenColor(color, percent) {
  const num = parseInt(color.replace("#", ""), 16)
  const amt = Math.round(2.55 * percent)
  const R = (num >> 16) - amt
  const G = ((num >> 8) & 0x00ff) - amt
  const B = (num & 0x0000ff) - amt
  return (
    "#" +
    (
      0x1000000 +
      Math.max(Math.min(R, 255), 0) * 0x10000 +
      Math.max(Math.min(G, 255), 0) * 0x100 +
      Math.max(Math.min(B, 255), 0)
    )
      .toString(16)
      .slice(1)
  )
}

function saveSettings() {
  const redColor = document.getElementById("redColor").value
  const blackColor = document.getElementById("blackColor").value
  const newTime = document.getElementById("gameTimer").value * 60

  // Update piece colors
  document.querySelectorAll(".piece.red:not(.king)").forEach((piece) => {
    piece.style.backgroundColor = redColor
  })
  document.querySelectorAll(".piece.black:not(.king)").forEach((piece) => {
    piece.style.backgroundColor = blackColor
  })

  // Update king colors (slightly darker shade)
  const darkerRed = darkenColor(redColor, 20)
  const darkerBlack = darkenColor(blackColor, 20)

  // Update king colors with darker shades
  document.querySelectorAll(".piece.red.king").forEach((piece) => {
    piece.style.backgroundColor = darkerRed
  })
  document.querySelectorAll(".piece.black.king").forEach((piece) => {
    piece.style.backgroundColor = darkerBlack
  })
  // Update timer
  redTime = newTime
  blackTime = newTime

  closeSettings()
}

//help popup open and close functions
function openHelp() {
  const helpPopup = document.getElementById("helpPopup")
  helpPopup.style.display = "block"
}

function closeHelp() {
  const helpPopup = document.getElementById("helpPopup")
  helpPopup.style.display = "none"
}

// const helpSound = new Audio('buttonclick.mp3')

// const helpButton = document.getElementById("helpButton")

// helpButton.addEventListener('click', () => {
//   helpSound.play()
// })

//function to change the names of the players
function updatePlayerNames() {
  const player1Name = document.getElementById("player1").value || "Player 1"
  const player2Name = document.getElementById("player2").value || "Player 2"

  // Update the player turn display
  const playerTurnElement = document.querySelector(".player-turn")
  if (playerTurnElement) {
    playerTurnElement.textContent = `${player1Name}'s Turn`
  }

  // Update the score display
  const scoreElement = document.querySelector(".score")
  if (scoreElement) {
    scoreElement.textContent = `${player1Name}: 0 | ${player2Name}: 0`
  }
}

function updateScore(capturingPlayer) {
  if (capturingPlayer === 1) {
    player1Score += 1
  } else {
    player2Score += 1
  }

  const player1Name = document.getElementById("player1").value || "Player 1"
  const player2Name = document.getElementById("player2").value || "Player 2"

  // Update the score display
  document.getElementById("score").textContent =
    `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`

  const redPieces = document.querySelectorAll(".piece.red").length
  const blackPieces = document.querySelectorAll(".piece.black").length

  if (redPieces === 0) {
    endGame("Black captured all pieces!")
  } else if (blackPieces === 0) {
    endGame("Red captured all pieces!")
  }

  sound.currentTime = 0
  sound.play()
}

function resetScores() {
  player1Score = 0
  player2Score = 0

  const player1Name = document.getElementById("player1").value || "Player 1"
  const player2Name = document.getElementById("player2").value || "Player 2"

  // Update the score display
  document.getElementById("score").textContent =
    `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`
}

function resetTime() {
  const settingsTime = document.getElementById("gameTimer").value * 60 // Get time from settings in seconds
  redTime = settingsTime
  blackTime = settingsTime
  document.getElementById("timer").textContent =
    `Red Time Left: ${formatTime(redTime)} | Black Time Left: ${formatTime(blackTime)}`
}

document.addEventListener("DOMContentLoaded", function () {
  setupBoard()
  startTimer()
  highlightMovablePieces()
  startSound.currentTime = 0
  startSound.play()
  //connects the new game button to the function
  document.getElementById("newGameButton").addEventListener("click", newGame)
})



buttons.forEach((button) => {
  button.addEventListener("click", () => {
    sound.currentTime = 0
    sound.play()
  })
})

function showGameOver(winner, score, reason) {
  const popup = document.getElementById("gameOverPopup")
  const winnerText = document.getElementById("winnerText")
  const finalScore = document.getElementById("finalScore")
  const gameEndReason = document.getElementById("gameEndReason")

  winnerText.textContent = `${winner} wins!`
  finalScore.textContent = `Final Score: ${score}`
  gameEndReason.textContent = reason

  popup.style.display = "block"
  gameStarted = false
}

function closeGameOver() {
  const popup = document.getElementById("gameOverPopup")
  popup.style.display = "none"
}

function startNewGame() {
  closeGameOver()
  newGame()
}

//drag and drop functionality
function enableDragAndDrop() {
  const pieces = document.querySelectorAll(".piece")
  pieces.forEach((piece) => {
    piece.draggable = true
    piece.addEventListener("dragstart", handleDragStart)
    piece.addEventListener("dragend", handleDragEnd)
  })

  const squares = document.querySelectorAll(".square")
  squares.forEach((square) => {
    square.addEventListener("dragover", handleDragOver)
    square.addEventListener("drop", handleDrop)
  })
}

function handleDragStart(e) {
  if (
    board[e.target.parentNode.dataset.row][e.target.parentNode.dataset.col] !==
    currentPlayer
  ) {
    e.preventDefault()
    return
  }
  e.target.classList.add("dragging")
  selectedPiece = {
    row: parseInt(e.target.parentNode.dataset.row),
    col: parseInt(e.target.parentNode.dataset.col),
    element: e.target.parentNode,
  }
}

function handleDragEnd(e) {
  e.target.classList.remove("dragging")
}

function handleDragOver(e) {
  e.preventDefault()
}

function handleDrop(e) {
  e.preventDefault()
  const square = e.target.closest(".square")
  const toRow = parseInt(square.dataset.row)
  const toCol = parseInt(square.dataset.col)

  if (selectedPiece) {
    const valid = validMove(selectedPiece.row, selectedPiece.col, toRow, toCol)
    if (valid) {
      movePiece(selectedPiece.row, selectedPiece.col, toRow, toCol, valid)
    }
    selectedPiece = null
  }
}
