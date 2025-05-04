// to do
// save settings when new game??
// improve design???
// fix issues that arised
// add a sound for regular takes
// add a setting for changing the take sound


var boardContainer = document.getElementById("boardContainer")
const rows = 8, cols = 8
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
let soundEnabled = true;
let winAlreadyProcessed = false;

//sounds for the game
//make them functions later
const sounds = {
  boom: new Audio("sounds/boom.mov"),
  click: new Audio("sounds/buttonclick.mp3"),
  start: new Audio("sounds/board_start.mp3"),
  move: new Audio("sounds/moving.mp3"),
  take: new Audio("sounds/take.mp3"),
  promote: new Audio("sounds/promote.mp3"),
  win: new Audio("sounds/yippee-tbh.mp3")
};




const buttons = document.querySelectorAll(".button")


function playSound(soundName) {
  if (soundEnabled && sounds[soundName]) {
    sounds[soundName].currentTime = 0;
    try {
      sounds[soundName].play().catch(error => {
        console.error("Sound play error:", error);
      });
    } catch (error) {
      console.error("Sound playback error:", error);
    }
  }
}
function toggleSound() {
  soundEnabled = !soundEnabled;
}

function updateSoundToggle() {
  const soundToggle = document.getElementById("soundToggle");
  soundToggle.checked = soundEnabled;
}

function handleSoundToggle() {
  const soundToggle = document.getElementById("soundToggle");
  soundEnabled = soundToggle.checked;
}

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

  //moves as king to the sides
  { piece: "red", enemy: "black", jumps: [-1, 1, -2, 2, -1, 3, 0, 0, 0, 4] }, //left down 
  { piece: "red", enemy: "black", jumps: [-1, -1, -2, -2, -1, -3, 0, 0, 0, -4] }, //left up 
  { piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 1, -3, 0, 0, 0, -4] }, //right down 
  { piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 1, 3, 0, 0, 0, 4] }, //right up 

  { piece: "black", enemy: "red", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0] }, //right
  { piece: "black", enemy: "red", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0] }, //left
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0] }, //right
  {
    piece: "black",
    enemy: "red",
    jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0],
  }, //left

  //moves as king to the sides
  { piece: "black", enemy: "red", jumps: [-1, -1, -2, -2, -1, -3, 0, 0, 0, -4] }, //left up 
  { piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -1, 3, 0, 0, 0, 4] }, //left down 

  { piece: "black", enemy: "red", jumps: [1, 1, 2, 2, 1, 3, 0, 0, 0, 4] }, //right up 
  { piece: "black", enemy: "red", jumps: [1, -1, 2, -2, 1, -3, 0, 0, 0, -4] }, //right down 
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

//pause Timer
function pauseTime() {
  clearInterval(timerInterval);  // Stop the timer
  timerInterval = null;  // Clear the interval reference
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

  if (!checkForValidMoves()) {
    endGame(`${currentPlayer === "red" ? "Red" : "Black"} has no valid moves!`)
    return
  }

  if (playerTurnElement) {
    playerTurnElement.textContent = `${currentPlayer === "red" ? player2Name : player1Name}'s Turn`
  }

  startTimer()
}

//helper function to check if there are valid moves for the current player that doesnt break the highlight feature
function checkForValidMoves() {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === currentPlayer) {
        const moves = getValidMoves(row, col)
        if (moves.length > 0) {
          return true // Found at least one valid move
        }
      }
    }
  }
  return false
}

// End the game
function endGame(reason) {
  if (winAlreadyProcessed) {
    console.log("Win already processed, skipping counter increment");

    const player1Name = document.getElementById("player1").value || "Player 1";
    const player2Name = document.getElementById("player2").value || "Player 2";
    let winner;

    if (reason.includes("time")) {
      winner = currentPlayer === "red" ? player1Name : player2Name;
    } else if (reason.includes("no valid moves")) {
      winner = currentPlayer === "black" ? player2Name : player1Name;
    } else if (reason.includes("Black captured")) {
      winner = player1Name;
    } else if (reason.includes("Red captured")) {
      winner = player2Name;
    }

    const score = `${player2Score} - ${player1Score}`;
    playSound('win');
    showGameOver(winner, score, reason);
    return;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  gameStarted = false;
  winAlreadyProcessed = true;

  const player1Name = document.getElementById("player1").value || "Player 1";
  const player2Name = document.getElementById("player2").value || "Player 2";

  let winner;

  if (reason.includes("time")) {
    if (currentPlayer === "red") {
      winner = player1Name;
      player1Wins++;
    } else {
      winner = player2Name;
      player2Wins++;
    }
  } else if (reason.includes("no valid moves")) {
    if (currentPlayer === "black") {
      winner = player2Name;
      player2Wins++;
    } else {
      winner = player1Name;
      player1Wins++;
    }
  } else if (reason.includes("Black captured")) {
    winner = player1Name;
    player1Wins++;
  } else if (reason.includes("Red captured")) {
    winner = player2Name;
    player2Wins++;
  }

  updateScores();
  saveWinsToStorage();

  const score = `${player2Score} - ${player1Score}`;
  playSound('win');
  showGameOver(winner, score, reason);
}

//makes board
function setupBoard() {
  boardContainer.innerHTML = "";
  const lightSquareColor = document.getElementById("light")?.value || "#f5f5dc";
  const darkSquareColor = document.getElementById("dark")?.value || "#a62b2b";

  for (let row = 0; row < rows; row++) {
    board[row] = [];
    for (let col = 0; col < cols; col++) {
      const square = document.createElement("div");
      const isLight = (row + col) % 2 === 0;
      square.classList.add("square", isLight ? "light" : "dark");
      square.style.backgroundColor = isLight ? lightSquareColor : darkSquareColor;
      square.dataset.row = row;
      square.dataset.col = col;
      square.addEventListener("click", handleClick);

      if (!isLight) {
        if (row < 3) {
          addPiece(square, "red");
          board[row][col] = "red";
        } else if (row > 4) {
          addPiece(square, "black");
          board[row][col] = "black";
        } else {
          board[row][col] = null;
        }
      } else {
        board[row][col] = null;
      }
      boardContainer.appendChild(square);
    }
  }
  enableDragAndDrop();
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
  const square = event.target.closest(".square")
  const row = parseInt(square.dataset.row)
  const col = parseInt(square.dataset.col)

  if (board[row][col] === currentPlayer) {
    playSound('click');
  }

  clearValidMoveIndicators()

  if (selectedPiece) {
    let valid = validMove(selectedPiece.row, selectedPiece.col, row, col)

    if (board[row][col] == currentPlayer) {
      selectedPiece.element.style.border = "none"
      selectedPiece = { row, col, element: square }
      highlightMovablePieces()
      square.style.border = "3px solid yellow"
      showValidMoves(row, col)
    } else if (!valid) {
      console.log("NON VALID MOVE")
      highlightMovablePieces()
    } else {
      movePiece(selectedPiece.row, selectedPiece.col, row, col, valid)
      selectedPiece = null
      highlightMovablePieces()
    }
  } else if (board[row][col] === currentPlayer) {
    selectedPiece = { row, col, element: square }
    highlightMovablePieces()
    square.style.border = "3px solid yellow"
    showValidMoves(row, col)
  }
}

//move piece
function movePiece(fromRow, fromCol, toRow, toCol, valid) {
  if (!valid) return
  playSound('move');

  if (!gameStarted) {
    gameStarted = true
    startTimer()
  }

  const fromSquare = getSquare(fromRow, fromCol)
  const toSquare = getSquare(toRow, toCol)
  toSquare.append(fromSquare.firstChild)

  board[toRow][toCol] = board[fromRow][fromCol]
  board[fromRow][fromCol] = null

  checkIfKing(toRow, toCol)

  switchPlayer()

  fromSquare.style.border = "none"

  //highlightMovablePieces()
}

function highlightMovablePieces() {
  document.querySelectorAll(".square").forEach((square) => {
    square.style.border = "none"
  })

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (board[row][col] === currentPlayer) {
        const moves = getValidMoves(row, col)
        if (moves.length > 0) {
          const square = getSquare(row, col)
          square.style.border = "2px solid green"
        }
      }
    }
  }
}

//Helper function to get valid moves for a piece
function getValidMoves(row, col) {
  const validMoves = []
  const directions = []


  if (getSquare(row, col).firstChild.dataset.king === "true") {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1])
  } else if (board[row][col] === "red") {
    directions.push([1, 1], [1, -1])
  } else {
    directions.push([-1, 1], [-1, -1])
  }


  directions.forEach(([rowDiff, colDiff]) => {
    const newRow = row + rowDiff
    const newCol = col + colDiff


    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      if (board[newRow][newCol] === null) {
        validMoves.push({ row: newRow, col: newCol })
      } else {
        validHopMoves = checkHops(row, col, row, col, rowDiff*2, colDiff*2, directions)
        for (i = 0; i < validHopMoves.length; i++) {
          validMoves.push({ row: validHopMoves[i].row, col: validHopMoves[i].col })
        }

      }
    }
  })


  return validMoves
}

function checkHops (origRow, origCol, row, col, rd, cd, directions) {
  const validHopMoves = []
  nextHops = []
  const newRow = row + rd
  const newCol = col + cd
  const jumpOverRow = row + rd/2
  const jumpOverCol = col + cd/2
  if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols || board[newRow][newCol] != null || board[origRow][origCol] == board[jumpOverRow][jumpOverCol] || board[jumpOverRow][jumpOverCol] == null) {
    return validHopMoves
  }
  if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && board[newRow][newCol] == null && board[origRow][origCol] != board[jumpOverRow][jumpOverCol] && board[jumpOverRow][jumpOverCol] != null) {
    validHopMoves.push({ row: newRow, col: newCol })
    directions.forEach(([rowDiff, colDiff]) => {
      nextHops = checkHops(origRow, origCol, newRow, newCol, rowDiff*2, colDiff*2, directions)
      for (i = 0; i < nextHops.length; i++) {
        validHopMoves.push(nextHops[i])
      }
    })
  }
  return validHopMoves;
}



function validMove(fromRow, fromCol, toRow, toCol) {
  if (board[toRow][toCol] != null) return false

  const rowDiff = toRow - fromRow
  const colDiff = Math.abs(toCol - fromCol)

  for (let x of moveSet) {
    if (getSquare(fromRow, fromCol).firstChild.dataset.king == "false") {
      if (hops(fromRow, fromCol, toRow, toCol, x)) {
        return true
      }
    }
  }

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

function removePiece(row, col) {
  const removeSquare = getSquare(row, col)
  const capturedColor = board[row][col];
  
  removeSquare.innerHTML = ""
  board[row][col] = null
  
  addToCapturedPieces(capturedColor);
}


function checkIfKing(row, col) {
  if (currentPlayer == "red" && row == 7) {
    const toKing = getSquare(row, col)
    if (toKing.firstChild.dataset.king !== "true") {
      toKing.firstChild.classList.add("king")
      toKing.firstChild.dataset.king = "true"

      const currentColor = window.getComputedStyle(
        toKing.firstChild,
      ).backgroundColor
      const hexColor = rgbToHex(currentColor)
      const darkerColor = darkenColor(hexColor, 20)
      toKing.firstChild.style.backgroundColor = darkerColor
      playSound('promote');
    }
  }
  if (currentPlayer == "black" && row == 0) {
    const toKing = getSquare(row, col)
    if (toKing.firstChild.dataset.king !== "true") {
      toKing.firstChild.classList.add("king")
      toKing.firstChild.dataset.king = "true"

      const currentColor = window.getComputedStyle(
        toKing.firstChild,
      ).backgroundColor
      const hexColor = rgbToHex(currentColor)
      const darkerColor = darkenColor(hexColor, 20)
      toKing.firstChild.style.backgroundColor = darkerColor
      playSound('promote');

    }
  }
}

function hops(fromRow, fromCol, toRow, toCol, moves) {
  let { piece, enemy, jumps } = moves
  let i = 0
  j = 1
  for (; j < jumps.length;) {
    if ((fromRow + jumps[i] == toRow && fromCol + jumps[j] == toCol) && ((fromRow + jumps[2] < 8 && fromRow + jumps[2] >= 0) && (fromCol + jumps[3] < 8 && fromCol + jumps[3] >= 0))) {
      if (
        board[fromRow][fromCol] == piece &&
        board[fromRow + jumps[0]][fromCol + jumps[1]] == enemy &&
        board[fromRow + jumps[2]][fromCol + jumps[3]] == null
      ) {
        if (toRow == fromRow + jumps[2] && toCol == fromCol + jumps[3]) {
          removePiece(fromRow + jumps[0], fromCol + jumps[1])
          updateScore(currentPlayer === "red" ? 1 : 2)
          return true
        }
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
          if (jumps[6] == 0 && jumps[7] == 0) { //checks if a king move out in
            removePiece(fromRow + jumps[4], fromCol + jumps[5]);
            removePiece(fromRow + jumps[0], fromCol + jumps[1]);
            updateScore(currentPlayer === "red" ? 1 : 2)
            updateScore(currentPlayer === "red" ? 1 : 2)
            return true;
          } else {
            removePiece(fromRow + jumps[4], fromCol + jumps[1]);
            removePiece(fromRow + jumps[0], fromCol + jumps[1]);
            updateScore(currentPlayer === "red" ? 1 : 2)
            updateScore(currentPlayer === "red" ? 1 : 2)
            return true;
          }
        }
      }
    } else i = i + 2
    j = j + 2
  }
}

//gets the square div
function getSquare(row, col) {
  return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`)
}

//add a function for the new game button

function newGame() {
  boardContainer.innerHTML = ""; // Clear the board
  currentPlayer = "black"; // Reset current player to black
  setupBoard(); // Set up the board again
  resetTime(); // Restart the timer
  clearInterval(timerInterval); // Clear the timer interval
  gameStarted = false; // Reset game started flag
  winAlreadyProcessed = false; // Reset win processed flag
  highlightMovablePieces();
  resetScores(); // Reset scores for the current game
  updateScores(); // Update the display to show current game scores and total wins

  resetCapturedPieces();

  playSound('start');
}

function resetCapturedPieces() {
  const redCaptured = document.getElementById('red-captured');
  const blackCaptured = document.getElementById('black-captured');
  
  if (redCaptured) {
    redCaptured.innerHTML = '<h3>Red Captures</h3>';
    const initialRedRow = document.createElement('div');
    initialRedRow.classList.add('captured-row');
    redCaptured.appendChild(initialRedRow);
  }
  
  if (blackCaptured) {
    blackCaptured.innerHTML = '<h3>Black Captures</h3>';
    const initialBlackRow = document.createElement('div');
    initialBlackRow.classList.add('captured-row');
    blackCaptured.appendChild(initialBlackRow);
  }
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

  const lightSquare = document.querySelector(".square.light");
  const darkSquare = document.querySelector(".square.dark");

  if (lightSquare) {
    document.getElementById("lightSquareColor").value = rgbToHex(getComputedStyle(lightSquare).backgroundColor);
  }
  if (darkSquare) {
    document.getElementById("darkSquareColor").value = rgbToHex(getComputedStyle(darkSquare).backgroundColor);
  }

  document.getElementById("gameTimer").value = Math.floor(redTime / 60)
  updateSoundToggle();
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
  const lightSquareColor = document.getElementById("lightSquareColor").value;
  const darkSquareColor = document.getElementById("darkSquareColor").value;
  const newTime = document.getElementById("gameTimer").value * 60

  handleSoundToggle();

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

  // Update board colors
  document.querySelectorAll(".square.light").forEach(square => {
    square.style.backgroundColor = lightSquareColor;
  });
  document.querySelectorAll(".square.dark").forEach(square => {
    square.style.backgroundColor = darkSquareColor;
  });

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

    const savedPlayer1Wins = localStorage.getItem('checkers_player1Wins') || 0;
    const savedPlayer2Wins = localStorage.getItem('checkers_player2Wins') || 0;

    localStorage.setItem('checkers_player1Name', player1Name);
    localStorage.setItem('checkers_player2Name', player2Name);

    // Just update display without incrementing
    document.getElementById("scoreText").textContent =
      `${player1Name} : ${player1Wins} | ${player2Name} : ${player2Wins}`;
  }
}

function updateScore(capturingPlayer) {
  if (capturingPlayer === 1) {
    player2Score += 1;
  } else {
    player1Score += 1;
  }

  const player1Name = document.getElementById("player1").value || "Player 1";
  const player2Name = document.getElementById("player2").value || "Player 2";

  // Update the score display
  document.getElementById("score").textContent =
    `${player1Name}: ${player1Score} | ${player2Name}: ${player2Score}`;

  const redPieces = document.querySelectorAll(".piece.red").length;
  const blackPieces = document.querySelectorAll(".piece.black").length;

  // Check if the game is over because a player has no pieces left
  if (redPieces === 0 || blackPieces === 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    gameStarted = false;

    if (redPieces === 0) {
      endGame("Black captured all pieces!");
    } else {
      endGame("Red captured all pieces!");
    }
    return;
  }

  playSound('boom');
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

function showGameOver(winner, score, reason) {
  if (document.getElementById("gameOverPopup").style.display === "block") {
    return;
  }

  const popup = document.getElementById("gameOverPopup");
  const winnerText = document.getElementById("winnerText");
  const finalScore = document.getElementById("finalScore");
  const gameEndReason = document.getElementById("gameEndReason");

  winnerText.textContent = `${winner} wins!`;
  finalScore.textContent = `Final Score: ${score}`;
  gameEndReason.textContent = reason;

  popup.style.display = "block";

  gameStarted = false;
}

function closeGameOver() {
  const popup = document.getElementById("gameOverPopup")
  popup.style.display = "none"

  const squares = document.querySelectorAll(".square")
  squares.forEach(square => {
    square.removeEventListener("click", handleClick)
    square.removeEventListener("dragover", handleDragOver)
    square.removeEventListener("drop", handleDrop)
  })

  const pieces = document.querySelectorAll(".piece")
  pieces.forEach(piece => {
    piece.draggable = false
    piece.removeEventListener("dragstart", handleDragStart)
    piece.removeEventListener("dragend", handleDragEnd)
  })

  if (selectedPiece) {
    selectedPiece.element.style.border = "none"
    selectedPiece = null
  }

  document.querySelectorAll(".square").forEach(square => {
    square.style.border = "none"
  })
}

function startNewGame() {
  closeGameOver()
  newGame()
  pauseTime()
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
  if (board[e.target.parentNode.dataset.row][e.target.parentNode.dataset.col] !== currentPlayer) {
    e.preventDefault();
    return;
  }
  e.target.classList.add("dragging");
  const row = parseInt(e.target.parentNode.dataset.row);
  const col = parseInt(e.target.parentNode.dataset.col);
  selectedPiece = { row, col, element: e.target.parentNode };
  showValidMoves(row, col);
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

  // Clear valid move indicators
  clearValidMoveIndicators()

  // If the target square already has a piece, return
  if (square.hasChildNodes()) {
    selectedPiece = null
    return
  }

  if (selectedPiece) {
    const valid = validMove(selectedPiece.row, selectedPiece.col, toRow, toCol)
    if (valid) {
      playSound('move');
      const fromSquare = getSquare(selectedPiece.row, selectedPiece.col)
      const piece = fromSquare.firstChild
      square.appendChild(piece)
      board[toRow][toCol] = board[selectedPiece.row][selectedPiece.col]
      board[selectedPiece.row][selectedPiece.col] = null
      checkIfKing(toRow, toCol)
      switchPlayer()
    }
    selectedPiece = null
    highlightMovablePieces()
  }
}

function updateScores() {
  const player1Name = document.getElementById("player1").value || "Player 1";
  const player2Name = document.getElementById("player2").value || "Player 2";

  // Update the wins display
  document.getElementById("scoreText").textContent =
    `${player1Name} : ${player1Wins} | ${player2Name} : ${player2Wins}`;
}


function redPlayerWins() {
  player2Wins++;
  updateScores();

  saveWinsToStorage();
}

function blackPlayerWins() {
  player1Wins++;
  updateScores();

  saveWinsToStorage();
}

function saveWinsToStorage() {
  const player1Name = document.getElementById("player1").value || "Player 1";
  const player2Name = document.getElementById("player2").value || "Player 2";

  localStorage.setItem('checkers_player1Wins', player1Wins);
  localStorage.setItem('checkers_player2Wins', player2Wins);
  localStorage.setItem('checkers_player1Name', player1Name);
  localStorage.setItem('checkers_player2Name', player2Name);
}

function loadWinsFromStorage() {
  player1Wins = parseInt(localStorage.getItem('checkers_player1Wins')) || 0;
  player2Wins = parseInt(localStorage.getItem('checkers_player2Wins')) || 0;

  const savedPlayer1Name = localStorage.getItem('checkers_player1Name');
  const savedPlayer2Name = localStorage.getItem('checkers_player2Name');

  if (savedPlayer1Name) {
    document.getElementById("player1").value = savedPlayer1Name;
  }

  if (savedPlayer2Name) {
    document.getElementById("player2").value = savedPlayer2Name;
  }

  updateScores();
}


function resetWins() {
  player1Wins = 0;
  player2Wins = 0;
  saveWinsToStorage();
  updateScores();
}


function clearValidMoveIndicators() {
  document.querySelectorAll('.valid-move-indicator').forEach(indicator => {
    indicator.remove()
  })
}

function showValidMoves(row, col) {
  clearValidMoveIndicators()

  // If the clicked piece doesn't belong to current player, return
  if (board[row][col] !== currentPlayer) {
    return
  }

  const validMoves = getValidMoves(row, col)
  validMoves.forEach(move => {
    const square = getSquare(move.row, move.col)
    const indicator = document.createElement('div')
    indicator.className = 'valid-move-indicator'
    square.appendChild(indicator)
  })
}

function addToCapturedPieces(color) {
  const container = color === 'red' ? 
    document.getElementById('black-captured') : 
    document.getElementById('red-captured');
  
  if (container) {
    const capturedPiece = document.createElement('div');
    capturedPiece.classList.add('captured-piece', color);
    
    let currentRow = container.querySelector('.captured-row:last-child');
    const piecesPerRow = 4;
    
    if (!currentRow || currentRow.children.length >= piecesPerRow) {
      currentRow = document.createElement('div');
      currentRow.classList.add('captured-row');
      container.appendChild(currentRow);
    }
    
    currentRow.appendChild(capturedPiece);
  }
}


document.getElementById('volumeControl').addEventListener('input', function () {
  const volumeValue = this.value;
  document.getElementById('volumeValue').textContent = `${Math.round(volumeValue * 100)}%`;
});



document.addEventListener("DOMContentLoaded", function () {
  setupBoard()
  loadWinsFromStorage()
  startTimer()
  highlightMovablePieces()
  playSound('start');
  document.getElementById("newGameButton").addEventListener("click", newGame)
  addResetWinsButton();
  updatePlayerNames();
})

buttons.forEach((button) => {
  button.addEventListener("click", () => {
    playSound('boom');
  })
})
