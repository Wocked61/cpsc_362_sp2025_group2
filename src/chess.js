var boardContainer = document.getElementById("boardContainer")
const rows = 8, cols = 8
let board = []
let currentPlayer = "white"  // Chess traditionally starts with white
let selectedPiece = null
let whiteTime = 180
let blackTime = 180
let timerInterval
let gameStarted = false
let player1Score = 0
let player2Score = 0
let player1Wins = 0
let player2Wins = 0

let castlingRights = {
    white: { kingSide: true, queenSide: true },
    black: { kingSide: true, queenSide: true }
};
let lastPawnDoubleMove = null; // Track last pawn that moved two squares for en passant

let moveHistory = [];
let moveNumber = 1;

// Chess piece movement patterns
const movePatterns = {
    pawn: {
        white: [{row: -1, col: 0}, {row: -2, col: 0}],
        black: [{row: 1, col: 0}, {row: 2, col: 0}],
        captures: {
            white: [{row: -1, col: -1}, {row: -1, col: 1}],
            black: [{row: 1, col: -1}, {row: 1, col: 1}]
        }
    },
    rook: [
        {row: 1, col: 0}, {row: -1, col: 0}, 
        {row: 0, col: 1}, {row: 0, col: -1}
    ],
    knight: [
        {row: -2, col: -1}, {row: -2, col: 1},
        {row: 2, col: -1}, {row: 2, col: 1},
        {row: -1, col: -2}, {row: -1, col: 2},
        {row: 1, col: -2}, {row: 1, col: 2}
    ],
    bishop: [
        {row: 1, col: 1}, {row: 1, col: -1},
        {row: -1, col: 1}, {row: -1, col: -1}
    ],
    queen: [
        {row: 1, col: 0}, {row: -1, col: 0},
        {row: 0, col: 1}, {row: 0, col: -1},
        {row: 1, col: 1}, {row: 1, col: -1},
        {row: -1, col: 1}, {row: -1, col: -1}
    ],
    king: [
        {row: 1, col: 0}, {row: -1, col: 0},
        {row: 0, col: 1}, {row: 0, col: -1},
        {row: 1, col: 1}, {row: 1, col: -1},
        {row: -1, col: 1}, {row: -1, col: -1}
    ]
}

// Add piece values at the top with other constants
const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0  // King has no capture value since game ends if captured
};

function setupBoard() {
    boardContainer.innerHTML = ""
    for (let row = 0; row < rows; row++) {
        board[row] = []
        for (let col = 0; col < cols; col++) {
            const square = document.createElement("div")
            square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark")
            square.dataset.row = row
            square.dataset.col = col
            square.addEventListener("click", handleClick)
            boardContainer.appendChild(square)
            board[row][col] = null
        }
    }
    
    setupPieces()
}

function setupPieces() {
    setupRank(7, "white")
    setupPawns(6, "white")
    
    setupRank(0, "black")
    setupPawns(1, "black")
}

function setupRank(row, color) {
    const pieces = ["rook", "knight", "bishop", "queen", "king", "bishop", "knight", "rook"]
    pieces.forEach((piece, col) => {
        addPiece(row, col, color, piece)
    })
}

function setupPawns(row, color) {
    for (let col = 0; col < 8; col++) {
        addPiece(row, col, color, "pawn")
    }
}

function addPiece(row, col, color, type) {
    const square = getSquare(row, col)
    const piece = document.createElement("div")
    piece.classList.add("piece", color, type)
    piece.dataset.type = type
    piece.dataset.color = color
    square.appendChild(piece)
    board[row][col] = {type, color}
}

function validMove(startRow, startCol, endRow, endCol) {
    const piece = board[startRow][startCol]
    if (!piece) return false
    
    // Basic movement validation
    const pattern = movePatterns[piece.type]
    switch(piece.type) {
        case "pawn":
            return validatePawnMove(startRow, startCol, endRow, endCol, piece.color)
        case "rook":
            return validateStraightMove(startRow, startCol, endRow, endCol)
        case "knight":
            return validateKnightMove(startRow, startCol, endRow, endCol)
        case "bishop":
            return validateDiagonalMove(startRow, startCol, endRow, endCol)
        case "queen":
            return validateQueenMove(startRow, startCol, endRow, endCol)
        case "king":
            return validateKingMove(startRow, startCol, endRow, endCol)
        default:
            return false
    }
}

function validatePawnMove(startRow, startCol, endRow, endCol, color) {
  const direction = color === 'white' ? -1 : 1;
  const startingRank = color === 'white' ? 6 : 1;
  const moveForward = endCol === startCol;
  const distance = Math.abs(endRow - startRow);
  
  if (moveForward && endRow === startRow + direction && !board[endRow][endCol]) {
      return true;
  }
  
  if (moveForward && startRow === startingRank && 
      distance === 2 && !board[endRow][endCol] && 
      !board[startRow + direction][startCol]) {
      return true;
  }
  
  if (Math.abs(endCol - startCol) === 1 && endRow === startRow + direction) {
      const targetPiece = board[endRow][endCol];
      return targetPiece && targetPiece.color !== color;
  }
  
  // En passant capture
  if (lastPawnDoubleMove && 
      Math.abs(endCol - startCol) === 1 && 
      endRow === (color === 'white' ? 2 : 5)) {
      const lastMove = lastPawnDoubleMove;
      if (lastMove.col === endCol && 
          lastMove.row === (color === 'white' ? 3 : 4) && 
          lastMove.color !== color) {
          return true;
      }
  }
  
  return false;
}

function validateStraightMove(startRow, startCol, endRow, endCol) {
  const isVertical = startCol === endCol;
  const isHorizontal = startRow === endRow;
  
  if (!isVertical && !isHorizontal) return false;
  
  const rowStep = isVertical ? Math.sign(endRow - startRow) : 0;
  const colStep = isHorizontal ? Math.sign(endCol - startCol) : 0;
  
  let currentRow = startRow + rowStep;
  let currentCol = startCol + colStep;
  
  while (currentRow !== endRow || currentCol !== endCol) {
      if (board[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
  }
  
  const targetPiece = board[endRow][endCol];
  return !targetPiece || targetPiece.color !== board[startRow][startCol].color;
}

function validateKnightMove(startRow, startCol, endRow, endCol) {
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);
  
  const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || 
                           (rowDiff === 1 && colDiff === 2);
  
  if (!isValidKnightMove) return false;
  
  const targetPiece = board[endRow][endCol];
  return !targetPiece || targetPiece.color !== board[startRow][startCol].color;
}

function validateDiagonalMove(startRow, startCol, endRow, endCol) {
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);
  
  if (rowDiff !== colDiff) return false;
  
  const rowStep = Math.sign(endRow - startRow);
  const colStep = Math.sign(endCol - startCol);
  
  let currentRow = startRow + rowStep;
  let currentCol = startCol + colStep;
  
  while (currentRow !== endRow && currentCol !== endCol) {
      if (board[currentRow][currentCol]) return false;
      currentRow += rowStep;
      currentCol += colStep;
  }
  const targetPiece = board[endRow][endCol];
  return !targetPiece || targetPiece.color !== board[startRow][startCol].color;
}

function validateQueenMove(startRow, startCol, endRow, endCol) {
  // Queen combines rook and bishop movements
  return validateStraightMove(startRow, startCol, endRow, endCol) || 
         validateDiagonalMove(startRow, startCol, endRow, endCol);
}

function validateKingMove(startRow, startCol, endRow, endCol) {
  const rowDiff = Math.abs(endRow - startRow);
  const colDiff = Math.abs(endCol - startCol);
  
  // Normal king move
  if (rowDiff <= 1 && colDiff <= 1) {
      const targetPiece = board[endRow][endCol];
      return !targetPiece || targetPiece.color !== board[startRow][startCol].color;
  }
  
  // Castling
  const color = board[startRow][startCol].color;
  if (rowDiff === 0 && colDiff === 2 && !isInCheck(color)) {
      // Kingside castling
      if (endCol === 6 && castlingRights[color].kingSide) {
          return validateCastling(startRow, startCol, true);
      }
      // Queenside castling
      if (endCol === 2 && castlingRights[color].queenSide) {
          return validateCastling(startRow, startCol, false);
      }
  }
  
  return false;
}

function validateCastling(row, startCol, isKingSide) {
  const color = board[row][startCol].color;
  const rookCol = isKingSide ? 7 : 0;
  
  // Check if the path is clear
  const path = isKingSide ? [5, 6] : [1, 2, 3];
  for (const col of path) {
      if (board[row][col] || wouldBeInCheck(row, startCol, row, col, color)) {
          return false;
      }
  }
  
  // Verify rook presence and movement
  const rook = board[row][rookCol];
  return rook && rook.type === 'rook' && rook.color === color;
}

function isInCheck(color) {
  // Find the king's position
  let kingRow, kingCol;
  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.type === 'king' && piece.color === color) {
              kingRow = row;
              kingCol = col;
              break;
          }
      }
  }

  // Check if any opponent piece can capture the king
  const opponentColor = color === 'white' ? 'black' : 'white';
  for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
          const piece = board[row][col];
          if (piece && piece.color === opponentColor) {
              if (validMove(row, col, kingRow, kingCol)) {
                  return true;
              }
          }
      }
  }
  return false;
}

function wouldPutInCheck(startRow, startCol, endRow, endCol) {
  // Make temporary move
  const originalStartPiece = board[startRow][startCol];
  const originalEndPiece = board[endRow][endCol];
  
  board[endRow][endCol] = originalStartPiece;
  board[startRow][startCol] = null;
  
  // Check if the move puts/leaves own king in check
  const inCheck = isInCheck(originalStartPiece.color);
  
  // Undo temporary move
  board[startRow][startCol] = originalStartPiece;
  board[endRow][endCol] = originalEndPiece;
  
  return inCheck;
}

// Modify the validMove function to include check validation
function validMove(startRow, startCol, endRow, endCol) {
  const piece = board[startRow][startCol];
  if (!piece) return false;
  
  let isValidPieceMove = false;
  switch(piece.type) {
      case "pawn":
          isValidPieceMove = validatePawnMove(startRow, startCol, endRow, endCol, piece.color);
          break;
      case "rook":
          isValidPieceMove = validateStraightMove(startRow, startCol, endRow, endCol);
          break;
      case "knight":
          isValidPieceMove = validateKnightMove(startRow, startCol, endRow, endCol);
          break;
      case "bishop":
          isValidPieceMove = validateDiagonalMove(startRow, startCol, endRow, endCol);
          break;
      case "queen":
          isValidPieceMove = validateQueenMove(startRow, startCol, endRow, endCol);
          break;
      case "king":
          isValidPieceMove = validateKingMove(startRow, startCol, endRow, endCol);
          break;
      default:
          return false;
  }

  if (!isValidPieceMove) return false;

  if (wouldPutInCheck(startRow, startCol, endRow, endCol)) {
      return false;
  }

  return true;
}

function checkGameState() {
  const currentColor = currentPlayer;
  const isCurrentPlayerInCheck = isInCheck(currentColor);
  
  for (let startRow = 0; startRow < 8; startRow++) {
      for (let startCol = 0; startCol < 8; startCol++) {
          const piece = board[startRow][startCol];
          if (piece && piece.color === currentColor) {
              for (let endRow = 0; endRow < 8; endRow++) {
                  for (let endCol = 0; endCol < 8; endCol++) {
                      if (validMove(startRow, startCol, endRow, endCol)) {
                          if (isCurrentPlayerInCheck) {
                              return 'check';
                          }
                          return 'ongoing';
                      }
                  }
              }
          }
      }
  }
  
  // No legal moves exist
  if (isCurrentPlayerInCheck) {
      return 'checkmate';
  }
  return 'stalemate';
}

function handleClick(event) {
  const square = event.target.closest('.square');
  if (!square) return;
  
  const clickedRow = parseInt(square.dataset.row);
  const clickedCol = parseInt(square.dataset.col);
  
  if (!selectedPiece) {
      const piece = board[clickedRow][clickedCol];
      if (piece && piece.color === currentPlayer) {
          selectedPiece = {
              row: clickedRow,
              col: clickedCol,
              element: square.querySelector('.piece')
          };
          square.classList.add('selected');
      }
      return;
  }
  
  if (selectedPiece) {
      if (selectedPiece.row === clickedRow && selectedPiece.col === clickedCol) {
          getSquare(selectedPiece.row, selectedPiece.col).classList.remove('selected');
          selectedPiece = null;
          return;
      }
      
      if (handleMove(selectedPiece.row, selectedPiece.col, clickedRow, clickedCol)) {
          getSquare(selectedPiece.row, selectedPiece.col).classList.remove('selected');
          selectedPiece = null;
      } else {
          const newPiece = board[clickedRow][clickedCol];
          if (newPiece && newPiece.color === currentPlayer) {
              getSquare(selectedPiece.row, selectedPiece.col).classList.remove('selected');
              selectedPiece = {
                  row: clickedRow,
                  col: clickedCol,
                  element: square.querySelector('.piece')
              };
              square.classList.add('selected');
          }
      }
  }
}

// Modify handleMove function to handle captures properly
function handleMove(startRow, startCol, endRow, endCol) {
    const piece = board[startRow][startCol];
    if (!validMove(startRow, startCol, endRow, endCol)) {
        return false;
    }

    const isCapture = board[endRow][endCol] !== null;
    const isCastling = piece.type === 'king' && Math.abs(endCol - startCol) === 2;

    // Handle captures
    // capturedPiece is already declared earlier in the function, no need to redeclare it
    if (capturedPiece) {
        handleCapture(capturedPiece);
    }

    // Track pawn double move for en passant
    if (piece.type === 'pawn' && Math.abs(endRow - startRow) === 2) {
        lastPawnDoubleMove = {
            row: endRow,
            col: endCol,
            color: piece.color
        };
    } else {
        lastPawnDoubleMove = null;
    }
    
    // Handle castling move
    if (piece.type === 'king' && Math.abs(endCol - startCol) === 2) {
        const isKingSide = endCol === 6;
        const rookStartCol = isKingSide ? 7 : 0;
        const rookEndCol = isKingSide ? 5 : 3;
        
        // Move rook
        const rookSquare = getSquare(startRow, rookStartCol);
        const rookDestination = getSquare(startRow, rookEndCol);
        const rookPiece = rookSquare.querySelector('.piece');
        rookSquare.removeChild(rookPiece);
        rookDestination.appendChild(rookPiece);
        
        // Update board array
        board[startRow][rookEndCol] = board[startRow][rookStartCol];
        board[startRow][rookStartCol] = null;
    }
    
    // Handle en passant capture
    if (piece.type === 'pawn' && 
        lastPawnDoubleMove && 
        endCol === lastPawnDoubleMove.col &&
        startRow === (piece.color === 'white' ? 3 : 4)) {
        const capturedPawn = board[lastPawnDoubleMove.row][lastPawnDoubleMove.col];
        handleCapture(capturedPawn);
        const capturedPawnSquare = getSquare(lastPawnDoubleMove.row, lastPawnDoubleMove.col);
        capturedPawnSquare.innerHTML = '';
        board[lastPawnDoubleMove.row][lastPawnDoubleMove.col] = null;
    }
    
    // Update castling rights
    if (piece.type === 'king') {
        castlingRights[piece.color].kingSide = false;
        castlingRights[piece.color].queenSide = false;
    } else if (piece.type === 'rook') {
        if (startCol === 0) castlingRights[piece.color].queenSide = false;
        if (startCol === 7) castlingRights[piece.color].kingSide = false;
    }
    
    const movingPiece = board[startRow][startCol];
    const capturedPiece = board[endRow][endCol];
    
    board[endRow][endCol] = movingPiece;
    board[startRow][startCol] = null;
    
    const startSquare = getSquare(startRow, startCol);
    const endSquare = getSquare(endRow, endCol);
    
    if (capturedPiece) {
        endSquare.innerHTML = '';
    }
    
    const pieceElement = startSquare.querySelector('.piece');
    startSquare.removeChild(pieceElement);
    endSquare.appendChild(pieceElement);
    
    const gameState = checkGameState();
    switch(gameState) {
        case 'check':
            alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} is in check!`);
            break;
        case 'checkmate':
            alert(`Checkmate! ${currentPlayer === 'white' ? 'Black' : 'White'} wins!`);
            endGame();
            return true;
        case 'stalemate':
            alert('Stalemate! The game is a draw.');
            endGame();
            return true;
    }
    
    // Switch players
    currentPlayer = currentPlayer === 'white' ? 'black' : 'white';

    // Check for check/checkmate
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    const isCheck = isInCheck(opponentColor);
    const isCheckmate = isCheck && checkGameState() === 'checkmate';

    // Add move to history
    addMoveToHistory(
        piece,
        {row: startRow, col: startCol},
        {row: endRow, col: endCol},
        isCapture,
        isCheck,
        isCheckmate,
        isCastling
    );
    
    return true;
}

// Add these new functions for capture handling
function handleCapture(capturedPiece) {
    const points = pieceValues[capturedPiece.type];
    if (capturedPiece.color === 'black') {
        player1Score += points;
        updateScore('player1-score', player1Score);
    } else {
        player2Score += points;
        updateScore('player2-score', player2Score);
    }
    
    // Add captured piece to the captured pieces display
    addToCapturedPieces(capturedPiece);
}

function updateScore(elementId, score) {
    const scoreElement = document.getElementById(elementId);
    if (scoreElement) {
        scoreElement.textContent = score;
    }
}

function addToCapturedPieces(piece) {
    const container = piece.color === 'black' ? 
        document.getElementById('white-captured') : 
        document.getElementById('black-captured');
    
    if (container) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('captured-piece', piece.color, piece.type);
        container.appendChild(pieceElement);
    }
}

function getSquare(row, col) {
  return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}

function endGame() {
  gameStarted = false;
  clearInterval(timerInterval);
  const squares = document.querySelectorAll('.square');
  squares.forEach(square => {
      square.removeEventListener('click', handleClick);
  });
}

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
  }, 1000)
}

// Helper function to format time in MM:SS
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`
}

// Add this function for converting board positions to chess notation
function toChessNotation(row, col) {
    const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
    return files[col] + ranks[row];
}

// Add this function to create move notation
function createMoveNotation(piece, startPos, endPos, isCapture, isCheck, isCheckmate, isCastling) {
    if (isCastling) {
        return endPos.col > startPos.col ? "O-O" : "O-O-O";
    }

    let notation = '';
    switch (piece.type) {
        case 'pawn':
            notation = isCapture ? `${toChessNotation(startPos.row, startPos.col)[0]}x` : '';
            notation += toChessNotation(endPos.row, endPos.col);
            break;
        default:
            notation = piece.type.charAt(0).toUpperCase();
            if (isCapture) notation += 'x';
            notation += toChessNotation(endPos.row, endPos.col);
    }

    if (isCheckmate) notation += '#';
    else if (isCheck) notation += '+';

    return notation;
}

// Add this function to add moves to the history
function addMoveToHistory(piece, startPos, endPos, isCapture, isCheck, isCheckmate, isCastling) {
    const notation = createMoveNotation(
        piece,
        startPos,
        endPos,
        isCapture,
        isCheck,
        isCheckmate,
        isCastling
    );

    const moveEntry = {
        number: moveNumber,
        color: piece.color,
        notation: notation,
        piece: piece.type,
        from: toChessNotation(startPos.row, startPos.col),
        to: toChessNotation(endPos.row, endPos.col)
    };

    moveHistory.push(moveEntry);
    updateMoveDisplay();

    if (piece.color === 'black') {
        moveNumber++;
    }
}

// Add this function to update the move history display
function updateMoveDisplay() {
    const moveList = document.getElementById('move-list');
    moveList.innerHTML = '';

    for (let i = 0; i < moveHistory.length; i += 2) {
        const moveRow = document.createElement('div');
        moveRow.classList.add('move-row');

        const moveNum = document.createElement('span');
        moveNum.classList.add('move-number');
        moveNum.textContent = `${Math.floor(i/2 + 1)}.`;

        const whiteMove = document.createElement('span');
        whiteMove.classList.add('move-white');
        whiteMove.textContent = moveHistory[i].notation;

        const blackMove = document.createElement('span');
        blackMove.classList.add('move-black');
        if (moveHistory[i + 1]) {
            blackMove.textContent = moveHistory[i + 1].notation;
        }

        moveRow.appendChild(moveNum);
        moveRow.appendChild(whiteMove);
        moveRow.appendChild(blackMove);
        moveList.appendChild(moveRow);
    }

    // Auto-scroll to bottom
    moveList.scrollTop = moveList.scrollHeight;
}

document.addEventListener("DOMContentLoaded", function () {
  setupBoard()
  startTimer()
})
