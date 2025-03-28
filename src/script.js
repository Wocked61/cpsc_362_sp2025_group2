var boardContainer = document.getElementById("boardContainer")
const rows = 8,
  cols = 8
let board = []
let currentPlayer = "black"
let selectedPiece = null
let redTime = 180 // 3 minutes in seconds for the red player
let blackTime = 180 // 3 minutes in seconds for the black player
let timerInterval // Timer interval
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
  currentPlayer = currentPlayer == "red" ? "black" : "red"

  //clear the border
  fromSquare.style.border = "none"
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

// Helper function to get valid moves for a piece
function getValidMoves(row, col) {
  const validMoves = []

  // Define movement directions based on player and whether it's a king
  const directions = []
  if (board[row][col] === "red") {
    directions.push([1, 1], [1, -1]) // Red moves forward
    if (getSquare(row, col).firstChild.dataset.king === "true") {
      directions.push([-1, 1], [-1, -1]) // Kings move backward as well
    }
  } else if (board[row][col] === "black") {
    directions.push([-1, 1], [-1, -1]) // Black moves forward
    if (getSquare(row, col).firstChild.dataset.king === "true") {
      directions.push([1, 1], [1, -1]) // Kings move backward as well
    }
  }

  // Check each direction for valid moves
  directions.forEach(([rowDiff, colDiff]) => {
    const newRow = row + rowDiff
    const newCol = col + colDiff

    // Ensure the move is within bounds and valid
    if (
      newRow >= 0 &&
      newRow < rows &&
      newCol >= 0 &&
      newCol < cols &&
      board[newRow][newCol] === null &&
      validMove(row, col, newRow, newCol)
    ) {
      validMoves.push({ row: newRow, col: newCol })
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
    toKing = getSquare(row, col)
    toKing.firstChild.classList.add("king")
    toKing.firstChild.dataset.king = "true"
  }
  if (currentPlayer == "black" && row == 0) {
    toKing = getSquare(row, col)
    toKing.firstChild.classList.add("king")
    toKing.firstChild.dataset.king = "true"
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

setupBoard()
startTimer()

highlightMovablePieces()
