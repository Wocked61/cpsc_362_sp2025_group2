var boardContainer = document.getElementById("boardContainer");
const rows = 8, cols = 8;
let board = [];
let currentPlayer = "red";
let selectedPiece = null;  

//makes board
function setupBoard(){
    boardContainer.innerHTML = "";
    for(let row = 0; row < rows; row++){
        board[row]=[]; //make 2d
        for(let col = 0; col < cols; col++){
            const square = document.createElement("div");
            square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark");//adds square light or quare dark class
            square.dataset.row = row;   //stores row
            square.dataset.col = col;   //stores col
            square.addEventListener("click", handleClick);
            if ((row + col) % 2 === 1) { // Only on dark squares
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

    console.log(board);
}

//creates and adds appends the piece to the square
function addPiece(square, color) {
    const piece = document.createElement("div");
    piece.classList.add("piece", color);
    square.appendChild(piece);
}

//click on square
function handleClick(event) {
    const square = event.target.closest(".square"); //current clicked
    const row = parseInt(square.dataset.row);   
    const col = parseInt(square.dataset.col);  
    if (selectedPiece) { //if selectedPiece is not empty

        //checker
        //console.log("slected",selectedPiece.element);
        //console.log("square",square);
        //console.log(validMove(selectedPiece.row, selectedPiece.col, row, col));
        //-----

        if(square == selectedPiece.element){ //unselect
            square.style.border = "none";
            selectedPiece="";
        }
        else if(!validMove(selectedPiece.row, selectedPiece.col, row, col)){//if trys to move where antoher is
            console.log("NON VALID MOVE");
        }
        else{ 
            movePiece(selectedPiece.row, selectedPiece.col, row, col);
            selectedPiece="";
            }
    }else if (board[row][col] === currentPlayer) {
        selectedPiece = { row, col, element: square };
        square.style.border = "3px solid yellow"; // Highlight selected piece
    }
    
}

//move piece
function movePiece(fromRow,fromCol,toRow,toCol){
    //check if valid move
    if(!validMove(fromRow,fromCol,toRow,toCol)) return;
    

    //update visuals
    const fromSquare = getSquare(fromRow,fromCol);
    const toSquare = getSquare(toRow,toCol);
    toSquare.append(fromSquare.firstChild);

    //change the array
    board[toRow][toCol]=board[fromRow][fromCol];
    board[fromRow][fromCol]=null;

    //switch player
    currentPlayer = currentPlayer == "red" ? "black" : "red";

    //clear the border
    fromSquare.style.border = "none";
}

//this is where it checks if the move is ok
//also it will be where you check if you can take
function validMove(fromRow,fromCol,toRow,toCol){
    if (board[toRow][toCol] != null) return false; //must move to an empty square

    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    //console.log("ROWS: ",rowDiff,toRow,fromRow);
    console.log("COLS: ",colDiff,toCol,fromCol);
    //console.log("from: ",fromRow,fromCol);
    //console.log("to: ",toRow,toCol);
    //

    //widh colDiff
    //with rowDiff it checks if if trying to move back
    if(colDiff != 1 || colDiff != -1 || (currentPlayer == "red" && rowDiff != 1) || (currentPlayer == "black" &&  rowDiff != -1)){
        console.log("non valid");
        return false;
    }
    console.log("valid");
    return true;
}











//gets the square div
function getSquare(row,col){
    //in class square with where .dataset.row and .col = row,col
    return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}


setupBoard();