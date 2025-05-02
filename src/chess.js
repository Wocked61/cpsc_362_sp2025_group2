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

// chess peice images. credit to wikimedia.
const pieceImages = {
    white: {
        pawn: "https://upload.wikimedia.org/wikipedia/commons/4/45/Chess_plt45.svg",
        rook: "https://upload.wikimedia.org/wikipedia/commons/7/72/Chess_rlt45.svg",
        knight: "https://upload.wikimedia.org/wikipedia/commons/7/70/Chess_nlt45.svg",
        bishop: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Chess_blt45.svg",
        queen: "https://upload.wikimedia.org/wikipedia/commons/1/15/Chess_qlt45.svg",
        king: "https://upload.wikimedia.org/wikipedia/commons/4/42/Chess_klt45.svg"
    },
    black: {
        pawn: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chess_pdt45.svg",
        rook: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Chess_rdt45.svg",
        knight: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Chess_ndt45.svg",
        bishop: "https://upload.wikimedia.org/wikipedia/commons/9/98/Chess_bdt45.svg",
        queen: "https://upload.wikimedia.org/wikipedia/commons/4/47/Chess_qdt45.svg",
        king: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Chess_kdt45.svg"
    }
};

const pieceValues = {
    pawn: 1,
    knight: 3,
    bishop: 3,
    rook: 5,
    queen: 9,
    king: 0 
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

function wouldBeInCheck(kingRow, kingCol, newRow, newCol, color) {
    const originalPiece = board[kingRow][kingCol];
    const targetPiece = board[newRow][newCol];
    
    board[newRow][newCol] = originalPiece;
    board[kingRow][kingCol] = null;
    
    const opponentColor = color === 'white' ? 'black' : 'white';
    let inCheck = false;
    
    outerLoop:
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === opponentColor) {
                if (canCaptureKing(row, col, newRow, newCol)) {
                    inCheck = true;
                    break outerLoop;
                }
            }
        }
    }
    
    board[kingRow][kingCol] = originalPiece;
    board[newRow][newCol] = targetPiece;
    
    return inCheck;
}

function canCaptureKing(startRow, startCol, kingRow, kingCol) {
    const piece = board[startRow][startCol];
    if (!piece) return false;
    
    switch(piece.type) {
        case "pawn":
            return canPawnCapture(startRow, startCol, kingRow, kingCol, piece.color);
        case "rook":
            return canStraightCapture(startRow, startCol, kingRow, kingCol);
        case "knight":
            return canKnightCapture(startRow, startCol, kingRow, kingCol);
        case "bishop":
            return canDiagonalCapture(startRow, startCol, kingRow, kingCol);
        case "queen":
            return canStraightCapture(startRow, startCol, kingRow, kingCol) || 
                   canDiagonalCapture(startRow, startCol, kingRow, kingCol);
        case "king":
            return canKingCapture(startRow, startCol, kingRow, kingCol);
        default:
            return false;
    }
}

function canPawnCapture(startRow, startCol, endRow, endCol, color) {
    const direction = color === 'white' ? -1 : 1;
    if (Math.abs(endCol - startCol) === 1 && endRow === startRow + direction) {
        return true;
    }
    return false;
}

function canStraightCapture(startRow, startCol, endRow, endCol) {
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
    
    return true;
}

function canKnightCapture(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    
    const isValidKnightMove = (rowDiff === 2 && colDiff === 1) || 
                             (rowDiff === 1 && colDiff === 2);
    
    return isValidKnightMove;
}

function canDiagonalCapture(startRow, startCol, endRow, endCol) {
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
    
    return true;
}

function canKingCapture(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    
    return rowDiff <= 1 && colDiff <= 1;
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
        if (targetPiece && targetPiece.color !== color) {
            return true;
        }
        
        if (lastPawnDoubleMove && 
            endCol === lastPawnDoubleMove.col && 
            startRow === lastPawnDoubleMove.row) {
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
    return validateStraightMove(startRow, startCol, endRow, endCol) || 
           validateDiagonalMove(startRow, startCol, endRow, endCol);
}

function validateKingMove(startRow, startCol, endRow, endCol) {
    const rowDiff = Math.abs(endRow - startRow);
    const colDiff = Math.abs(endCol - startCol);
    
    if (rowDiff <= 1 && colDiff <= 1) {
        const targetPiece = board[endRow][endCol];
        return !targetPiece || targetPiece.color !== board[startRow][startCol].color;
    }
    
    const color = board[startRow][startCol].color;
    if (rowDiff === 0 && colDiff === 2 && !isInCheck(color)) {
        if (endCol === 6 && castlingRights[color].kingSide) {
            return validateCastling(startRow, startCol, true);
        }
        if (endCol === 2 && castlingRights[color].queenSide) {
            return validateCastling(startRow, startCol, false);
        }
    }
    
    return false;
}

function validateCastling(row, startCol, isKingSide) {
    const color = board[row][startCol].color;
    const rookCol = isKingSide ? 7 : 0;
    
    const path = isKingSide ? [5, 6] : [1, 2, 3];
    for (const col of path) {
        if (board[row][col]) return false;
    }
    
    for (const col of isKingSide ? [4, 5, 6] : [2, 3, 4]) {
        if (wouldBeInCheck(row, startCol, row, col, color)) {
            return false;
        }
    }
    
    const rook = board[row][rookCol];
    return rook && rook.type === 'rook' && rook.color === color;
}

function isInCheck(color) {
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
        if (kingRow !== undefined) break;
    }

    const opponentColor = color === 'white' ? 'black' : 'white';
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const piece = board[row][col];
            if (piece && piece.color === opponentColor) {
                if (canCaptureKing(row, col, kingRow, kingCol)) {
                    return true;
                }
            }
        }
    }
    return false;
}

function wouldPutInCheck(startRow, startCol, endRow, endCol) {
    const originalStartPiece = board[startRow][startCol];
    const originalEndPiece = board[endRow][endCol];
    
    board[endRow][endCol] = originalStartPiece;
    board[startRow][startCol] = null;
    
    const inCheck = isInCheck(originalStartPiece.color);
    
    board[startRow][startCol] = originalStartPiece;
    board[endRow][endCol] = originalEndPiece;
    
    return inCheck;
}

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
    
    let hasLegalMoves = false;
    
    for (let startRow = 0; startRow < 8; startRow++) {
        for (let startCol = 0; startCol < 8; startCol++) {
            const piece = board[startRow][startCol];
            if (piece && piece.color === currentColor) {
                for (let endRow = 0; endRow < 8; endRow++) {
                    for (let endCol = 0; endCol < 8; endCol++) {
                        if (validMove(startRow, startCol, endRow, endCol)) {
                            hasLegalMoves = true;
                            break;
                        }
                    }
                    if (hasLegalMoves) break;
                }
                if (hasLegalMoves) break;
            }
            if (hasLegalMoves) break;
        }
        if (hasLegalMoves) break;
    }
    
    if (hasLegalMoves) {
        if (isCurrentPlayerInCheck) {
            return 'check';
        }
        return 'ongoing';
    } else {
        if (isCurrentPlayerInCheck) {
            return 'checkmate';
        }
        return 'stalemate';
    }
}


function handleClick(event) {
    const square = event.target.closest('.square');
    if (!square) return;
    
    const clickedRow = parseInt(square.dataset.row);
    const clickedCol = parseInt(square.dataset.col);
    
    clearValidMoves();
    
    if (!selectedPiece) {
        const piece = board[clickedRow][clickedCol];
        if (piece && piece.color === currentPlayer) {
            selectedPiece = {
                row: clickedRow,
                col: clickedCol,
                element: square.querySelector('.piece')
            };
            square.classList.add('selected');
            showValidMoves(clickedRow, clickedCol);
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
                showValidMoves(clickedRow, clickedCol);
            }
        }
    }
}

function handleMove(startRow, startCol, endRow, endCol) {
    const piece = board[startRow][startCol];
    if (!validMove(startRow, startCol, endRow, endCol)) {
        return false;
    }

    const capturedPiece = board[endRow][endCol];
    const isCapture = capturedPiece !== null;
    const isCastling = piece.type === 'king' && Math.abs(endCol - startCol) === 2;
    const isPawnDoubleMove = piece.type === 'pawn' && Math.abs(endRow - startRow) === 2;
    
    let isEnPassant = false;
    if (piece.type === 'pawn' && Math.abs(endCol - startCol) === 1 && !capturedPiece) {
        const enPassantRow = piece.color === 'white' ? endRow + 1 : endRow - 1;
        const enPassantPiece = board[enPassantRow][endCol];
        if (enPassantPiece && enPassantPiece.type === 'pawn' && 
            lastPawnDoubleMove && lastPawnDoubleMove.col === endCol && 
            lastPawnDoubleMove.row === enPassantRow) {
            handleCapture(enPassantPiece);
            const capturedPawnSquare = getSquare(enPassantRow, endCol);
            capturedPawnSquare.innerHTML = '';
            board[enPassantRow][endCol] = null;
            isEnPassant = true;
        }
    }

    if (capturedPiece) {
        handleCapture(capturedPiece);
    }

    if (isPawnDoubleMove) {
        lastPawnDoubleMove = {
            row: endRow,
            col: endCol,
            color: piece.color
        };
    } else {
        lastPawnDoubleMove = null;
    }
    
    if (isCastling) {
        const isKingSide = endCol === 6;
        const rookStartCol = isKingSide ? 7 : 0;
        const rookEndCol = isKingSide ? 5 : 3;
        
        const rookSquare = getSquare(startRow, rookStartCol);
        const rookDestination = getSquare(startRow, rookEndCol);
        const rookPiece = rookSquare.querySelector('.piece');
        if (rookPiece) {
            rookSquare.removeChild(rookPiece);
            rookDestination.appendChild(rookPiece);
            
            board[startRow][rookEndCol] = board[startRow][rookStartCol];
            board[startRow][rookStartCol] = null;
        }
    }
    
    if (piece.type === 'king') {
        castlingRights[piece.color].kingSide = false;
        castlingRights[piece.color].queenSide = false;
    } else if (piece.type === 'rook') {
        if (startCol === 0) castlingRights[piece.color].queenSide = false;
        if (startCol === 7) castlingRights[piece.color].kingSide = false;
    }
    
    board[endRow][endCol] = piece;
    board[startRow][startCol] = null;
    
    const startSquare = getSquare(startRow, startCol);
    const endSquare = getSquare(endRow, endCol);
    
    if (capturedPiece) {
        endSquare.innerHTML = '';
    }
    
    const pieceElement = startSquare.querySelector('.piece');
    startSquare.removeChild(pieceElement);
    endSquare.appendChild(pieceElement);
    
    if (piece.type === 'pawn' && (endRow === 0 || endRow === 7)) {
        promotePawn(endRow, endCol);
    }
    
    const opponentColor = piece.color === 'white' ? 'black' : 'white';
    currentPlayer = opponentColor;
    
    const gameState = checkGameState();
    const isCheck = gameState === 'check';
    const isCheckmate = gameState === 'checkmate';
    const isStalemate = gameState === 'stalemate';
    
    if (isCheck) {
        alert(`${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)} is in check!`);
    } else if (isCheckmate) {
        alert(`Checkmate! ${piece.color.charAt(0).toUpperCase() + piece.color.slice(1)} wins!`);
        updateWinCount(piece.color);
        endGame();
    } else if (isStalemate) {
        alert('Stalemate! The game is a draw.');
        endGame();
    }
    
    addMoveToHistory(
        piece,
        {row: startRow, col: startCol},
        {row: endRow, col: endCol},
        isCapture || isEnPassant,
        isCheck,
        isCheckmate,
        isCastling
    );
    
    if (gameStarted) {
        startTimer();
    }
    
    return true;
}

function promotePawn(row, col) {
    const piece = board[row][col];
    const promotion = prompt("Promote pawn to: (queen, rook, bishop, knight)", "queen");
    
    let newType;
    switch(promotion.toLowerCase()) {
        case "rook":
            newType = "rook";
            break;
        case "bishop":
            newType = "bishop";
            break;
        case "knight":
            newType = "knight";
            break;
        default:
            newType = "queen";
    }
    
    board[row][col] = {
        type: newType,
        color: piece.color
    };
    
    const square = getSquare(row, col);
    square.innerHTML = "";
    
    const pieceElement = document.createElement("div");
    pieceElement.classList.add("piece", piece.color, newType);
    pieceElement.dataset.type = newType;
    pieceElement.dataset.color = piece.color;
    square.appendChild(pieceElement);
}

function updateWinCount(color) {
    if (color === "white") {
        player1Wins++;
        document.getElementById("player1-wins").textContent = player1Wins;
    } else {
        player2Wins++;
        document.getElementById("player2-wins").textContent = player2Wins;
    }
}

function handleCapture(capturedPiece) {
    const points = pieceValues[capturedPiece.type];
    if (capturedPiece.color === 'black') {
        player1Score += points;
        updateScore('player1-score', player1Score);
    } else {
        player2Score += points;
        updateScore('player2-score', player2Score);
    }
    
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
    
    const newGameBtn = document.getElementById('new-game-btn') || createNewGameButton();
    newGameBtn.disabled = false;
  }
  
  function createNewGameButton() {
    const newGameBtn = document.createElement('button');
    newGameBtn.id = 'new-game-btn';
    newGameBtn.textContent = 'New Game';
    newGameBtn.classList.add('game-button');
    newGameBtn.addEventListener('click', resetGame);
    
    const controlsContainer = document.getElementById('game-controls') || document.body;
    controlsContainer.appendChild(newGameBtn);
    
    return newGameBtn;
  }
  
  function resetGame() {
    boardContainer.innerHTML = "";
    
    board = [];
    currentPlayer = "white";
    selectedPiece = null;
    whiteTime = 180; // 3 minutes per player
    blackTime = 180;
    gameStarted = true;
    player1Score = 0;
    player2Score = 0;
    
    castlingRights = {
      white: { kingSide: true, queenSide: true },
      black: { kingSide: true, queenSide: true }
    };
    
    lastPawnDoubleMove = null;
    moveHistory = [];
    moveNumber = 1;
    
    const whiteCaptured = document.getElementById('white-captured');
    const blackCaptured = document.getElementById('black-captured');
    if (whiteCaptured) whiteCaptured.innerHTML = '';
    if (blackCaptured) blackCaptured.innerHTML = '';
    
    updateScore('player1-score', 0);
    updateScore('player2-score', 0);
    
    updateTimerDisplay();
    
    setupBoard();
    
    const squares = document.querySelectorAll('.square');
    squares.forEach(square => {
      square.addEventListener('click', handleClick);
    });
    
    startTimer();
  }
  
  function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (timerElement) {
      timerElement.textContent = `White: ${formatTime(whiteTime)} | Black: ${formatTime(blackTime)}`;
    }
  }
  
  function startTimer() {
    clearInterval(timerInterval); // Clear the previous timer
    if (!gameStarted) return; // Don't start the timer if the game hasn't started yet
    
    updateTimerDisplay(); // Update the display immediately
    
    timerInterval = setInterval(() => {
      if (currentPlayer === "white") {
        whiteTime--; // Decrease white's timer
        if (whiteTime <= 0) {
          clearInterval(timerInterval);
          alert("White player ran out of time! Black wins.");
          updateWinCount("black");
          endGame();
          return;
        }
      } else if (currentPlayer === "black") {
        blackTime--; // Decrease black's timer
        if (blackTime <= 0) {
          clearInterval(timerInterval);
          alert("Black player ran out of time! White wins.");
          updateWinCount("white");
          endGame();
          return;
        }
      }
      
      updateTimerDisplay();
    }, 1000);
  }
  
  function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  }
  
  function createMoveNotation(piece, startPos, endPos, isCapture, isCheck, isCheckmate, isCastling) {
      if (isCastling) {
          return endPos.col > startPos.col ? "O-O" : "O-O-O";
      }
  
      let notation = '';
      
      if (piece.type !== 'pawn') {
          notation = piece.type === 'knight' ? 'N' : piece.type.charAt(0).toUpperCase();
          
          const ambiguousPieces = findAmbiguousPieces(piece.type, piece.color, startPos, endPos);
          if (ambiguousPieces.length > 0) {
              const sameFile = ambiguousPieces.some(p => p.col === startPos.col);
              const sameRank = ambiguousPieces.some(p => p.row === startPos.row);
              
              if (!sameFile) {
                  notation += toChessNotation(startPos.row, startPos.col)[0];
              } else if (!sameRank) {
                  notation += toChessNotation(startPos.row, startPos.col)[1];
              } else {
                  notation += toChessNotation(startPos.row, startPos.col);
              }
          }
      }
      
      if (isCapture) {
          if (piece.type === 'pawn') {
              notation += toChessNotation(startPos.row, startPos.col)[0];
          }
          notation += 'x';
      }
      
      notation += toChessNotation(endPos.row, endPos.col);
      
      if (piece.type === 'pawn' && (endPos.row === 0 || endPos.row === 7)) {
          notation += '=Q'; // Default to queen promotion
      }
      
      if (isCheckmate) {
          notation += '#';
      } else if (isCheck) {
          notation += '+';
      }
  
      return notation;
  }
  
  function findAmbiguousPieces(pieceType, pieceColor, startPos, endPos) {
      const ambiguousPieces = [];
      
      for (let row = 0; row < 8; row++) {
          for (let col = 0; col < 8; col++) {
              if (row === startPos.row && col === startPos.col) continue;
              
              const piece = board[row][col];
              if (piece && piece.type === pieceType && piece.color === pieceColor) {
                  if (validMove(row, col, endPos.row, endPos.col)) {
                      ambiguousPieces.push({row, col});
                  }
              }
          }
      }
      
      return ambiguousPieces;
  }
  
  function updateMoveDisplay() {
      const moveList = document.getElementById('move-list');
      if (!moveList) return;
      
      moveList.innerHTML = '';
  
      let currentMoveNumber = 0;
      let moveRow = null;
      
      moveHistory.forEach((move, index) => {
          const moveNumber = Math.floor(index / 2) + 1;
          
          if (moveNumber !== currentMoveNumber) {
              moveRow = document.createElement('div');
              moveRow.classList.add('move-row');
              
              const moveNum = document.createElement('span');
              moveNum.classList.add('move-number');
              moveNum.textContent = `${moveNumber}.`;
              moveRow.appendChild(moveNum);
              
              moveList.appendChild(moveRow);
              currentMoveNumber = moveNumber;
          }
          
          const moveSpan = document.createElement('span');
          moveSpan.classList.add(move.color === 'white' ? 'move-white' : 'move-black');
          moveSpan.textContent = move.notation;
          
          moveSpan.title = `${move.piece} from ${move.from} to ${move.to}`;
          
          moveSpan.addEventListener('click', () => {
              highlightMove(move.from, move.to);
          });
          
          moveRow.appendChild(moveSpan);
      });
  
      moveList.scrollTop = moveList.scrollHeight;
  }
  
  function highlightMove(from, to) {
      document.querySelectorAll('.square.highlight-from, .square.highlight-to')
          .forEach(sq => {
              sq.classList.remove('highlight-from', 'highlight-to');
          });
      
      const fromCoords = fromChessNotation(from);
      const toCoords = fromChessNotation(to);
      
      const fromSquare = getSquare(fromCoords.row, fromCoords.col);
      const toSquare = getSquare(toCoords.row, toCoords.col);
      
      if (fromSquare) fromSquare.classList.add('highlight-from');
      if (toSquare) toSquare.classList.add('highlight-to');
      
      setTimeout(() => {
          if (fromSquare) fromSquare.classList.remove('highlight-from');
          if (toSquare) toSquare.classList.remove('highlight-to');
      }, 2000);
  }
  
  function fromChessNotation(notation) {
      const files = {'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4, 'f': 5, 'g': 6, 'h': 7};
      const ranks = {'8': 0, '7': 1, '6': 2, '5': 3, '4': 4, '3': 5, '2': 6, '1': 7};
      
      return {
          row: ranks[notation[1]],
          col: files[notation[0]]
      };
  }
  
  function showValidMoves(startRow, startCol) {
    clearValidMoves();
    
    const piece = board[startRow][startCol];
    if (!piece || piece.color !== currentPlayer) return;
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (validMove(startRow, startCol, row, col)) {
                const square = getSquare(row, col);
                if (board[row][col] && board[row][col].color !== currentPlayer) {
                    square.classList.add('valid-capture');
                } else {
                    square.classList.add('valid-move');
                }
            }
        } 
    }
}

function clearValidMoves() {
    document.querySelectorAll('.valid-move, .valid-capture').forEach(square => {
        square.classList.remove('valid-move', 'valid-capture');
    });
}


  document.addEventListener("DOMContentLoaded", function() {
      setupBoard();
      
      if (!document.getElementById('timer')) {
          const timerDisplay = document.createElement('div');
          timerDisplay.id = 'timer';
          timerDisplay.classList.add('timer-display');
          
          const controlsContainer = document.getElementById('game-controls') || document.body;
          controlsContainer.appendChild(timerDisplay);
      }
      
      if (!document.getElementById('start-game-btn')) {
          const startBtn = document.createElement('button');
          startBtn.id = 'start-game-btn';
          startBtn.textContent = 'Start Game';
          startBtn.classList.add('game-button');
          startBtn.addEventListener('click', () => {
              if (!gameStarted) {
                  gameStarted = true;
                  startTimer();
                  startBtn.disabled = true;
              }
          });
          
          const controlsContainer = document.getElementById('game-controls') || document.body;
          controlsContainer.appendChild(startBtn);
      }
      
      updateTimerDisplay();
  });
