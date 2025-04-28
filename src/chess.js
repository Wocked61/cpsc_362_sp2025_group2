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

//can add more cords in jumps to hop over 3 or more peices
const moveSet = [
  { piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  {
    piece: "black",
    enemy: "red",
    jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0],
  }, //left
]
const kingMoveSet = [
  //add jump down then up for left and right
  { piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "red", enemy: "black", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  {
    piece: "red",
    enemy: "black",
    jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0],
  }, //left
  { piece: "black", enemy: "red", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "black", enemy: "red", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  {
    piece: "black",
    enemy: "red",
    jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0],
  }, //left
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
        alert("Red player ran out of time! Black wins.")
        endGame()
      }
    } else if (currentPlayer === "black") {
      blackTime-- // Decrease black's timer
      document.getElementById("timer").textContent =
        `Red Time Left: ${formatTime(redTime)} | Black Time Left: ${formatTime(blackTime)}`
      if (blackTime <= 0) {
        clearInterval(timerInterval)
        alert("Black player ran out of time! Red wins.")
        endGame()
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
  startTimer() // Start the timer for the next player
}

// End the game
function endGame() {
  clearInterval(timerInterval) // Stop the timer
  boardContainer.innerHTML = "" // Clear the board
  alert("Game Over! Refresh the page to play again.")
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

document.addEventListener("DOMContentLoaded", function () {
  setupBoard()
  startTimer()
})
