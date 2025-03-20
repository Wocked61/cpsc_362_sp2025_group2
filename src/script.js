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
            square.classList.add("square", (row + col) % 2 === 0 ? "light" : "dark");//adds square light or square dark class
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
    piece.dataset.king = "false";
    piece.classList.add("piece", color);
    square.appendChild(piece);
}

//click on square
function handleClick(event) {
    const square = event.target.closest(".square"); //current clicked
    const row = parseInt(square.dataset.row);   
    const col = parseInt(square.dataset.col);  
    //console.log(row,col);
    
    if (selectedPiece) { //if selectedPiece is not empty
        let valid = validMove(selectedPiece.row, selectedPiece.col, row, col);
        //checker
        //console.log("slected",selectedPiece.element);
        //console.log("square",square);
        //console.log(validMove(selectedPiece.row, selectedPiece.col, row, col));
        //-----

        //change selected square
        if (board[row][col]==currentPlayer && board[selectedPiece.row][selectedPiece.col]== currentPlayer){
            selectedPiece.element.style.border= "none";
            selectedPiece = {row,col,element: square};
            square.style.border = "3px solid yellow";
        }
        else if(!valid){//if trys to move where antoher is
            console.log("NON VALID MOVE");
        }
        else{ 
            movePiece(selectedPiece.row, selectedPiece.col, row, col,valid);
            selectedPiece="";
            }
    }else if (board[row][col] === currentPlayer) {
        selectedPiece = { row, col, element: square };
        square.style.border = "3px solid yellow"; // Highlight selected piece
    }
}

//move piece
function movePiece(fromRow,fromCol,toRow,toCol,valid){
    //check if valid move
    if(!valid) return;
    

    //update visuals
    const fromSquare = getSquare(fromRow,fromCol);
    const toSquare = getSquare(toRow,toCol);
    toSquare.append(fromSquare.firstChild);

    //change the array
    board[toRow][toCol]=board[fromRow][fromCol];
    board[fromRow][fromCol]=null;

    //check if should be king
    checkIfKing(toRow,toCol);

    //switch player
    currentPlayer = currentPlayer == "red" ? "black" : "red";

    //clear the border
    fromSquare.style.border = "none";
}

//this is where it checks if the move is ok
//also it will be where you check if you can take
//prob dont need toRow cuz it should just return the 
function validMove(fromRow,fromCol,toRow,toCol){
    if (board[toRow][toCol] != null) return false; //must move to an empty square

    const rowDiff = toRow - fromRow;
    const colDiff = Math.abs(toCol - fromCol);
    console.log("ROWS: ",rowDiff,toRow,fromRow);
    console.log("COLS: ",colDiff,toCol,fromCol);
    //console.log("from: ",fromRow,fromCol);
    //console.log("to: ",toRow,toCol);
    
    //make valid move to take a single peice

    //take one peice
    if(colDiff==2){
        if(currentPlayer == "red" && board[(toRow+fromRow)/2][(toCol+fromCol)/2]=="black" && (currentPlayer == "red" && rowDiff > 0)){
            removePiece((toRow+fromRow)/2,(toCol+fromCol)/2);
            return true;
        }
        //checks if can take a red piece
        if(currentPlayer == "black" && board[(toRow+fromRow)/2][(toCol+fromCol)/2]=="red" && (currentPlayer == "black" && rowDiff < 0)){
            removePiece((toRow+fromRow)/2,(toCol+fromCol)/2);
            return true;
        }
    }
 
    //if trying to make a move more than 2 squares away witch would only be double or more hop
    //this is only for double hop not trippple or more
    //down only bc red
    

        //red
        //right right
        if(board[fromRow][fromCol]=="red" && board[fromRow+1][fromCol+1]=="black" && board[fromRow+2][fromCol+2]==null && board[fromRow+3][fromCol+3]=="black"){
            if(fromRow+4==toRow && fromCol+4== toCol){
                removePiece(fromRow+3,fromCol+3);
                removePiece(fromRow+1,fromCol+1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //right left
        if(board[fromRow][fromCol]=="red" && board[fromRow+1][fromCol+1]=="black" && board[fromRow+2][fromCol+2]==null && board[fromRow+3][fromCol+1]=="black"){
            if(fromRow+4==toRow && fromCol == toCol){
                removePiece(fromRow+3,fromCol+1);
                removePiece(fromRow+1,fromCol+1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //left left
        if(board[fromRow][fromCol]=="red" && board[fromRow+1][fromCol-1]=="black" && board[fromRow+2][fromCol-2]==null && board[fromRow+3][fromCol-3]=="black"){
            if(fromRow+4==toRow && fromCol-4 == toCol){
                removePiece(fromRow+3,fromCol-3);
                removePiece(fromRow+1,fromCol-1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //left right
        if(board[fromRow][fromCol]=="red" && board[fromRow+1][fromCol-1]=="black" && board[fromRow+2][fromCol-2]==null && board[fromRow+3][fromCol-1]=="black"){
            if(fromRow-4==toRow && fromCol-4 == toCol){
                removePiece(fromRow+3,fromCol-1);
                removePiece(fromRow+1,fromCol-1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //black
        //right right
        if(board[fromRow][fromCol]=="black" && board[fromRow-1][fromCol-1]=="red" && board[fromRow-2][fromCol-2]==null && board[fromRow-3][fromCol-3]=="red"){
            if(fromRow-4==toRow && fromCol-4== toCol){
                removePiece(fromRow-3,fromCol-3);
                removePiece(fromRow-1,fromCol-1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //right left
        if(board[fromRow][fromCol]=="black" && board[fromRow-1][fromCol-1]=="red" && board[fromRow-2][fromCol-2]==null && board[fromRow-3][fromCol-1]=="red"){
            if(fromRow+4==toRow && fromCol == toCol){
                removePiece(fromRow-3,fromCol-1);
                removePiece(fromRow-1,fromCol-1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //left left
        if(board[fromRow][fromCol]=="black" && board[fromRow-1][fromCol+1]=="red" && board[fromRow-2][fromCol+2]==null && board[fromRow-3][fromCol+3]=="red"){
            if(fromRow-4==toRow && fromCol+4 == toCol){
                removePiece(fromRow-3,fromCol+3);
                removePiece(fromRow-1,fromCol+1);
                console.log("valid double hop!!!")
                return true;
            }
        }
        //left right
        if(board[fromRow][fromCol]=="black" && board[fromRow-1][fromCol+1]=="red" && board[fromRow-2][fromCol+2]==null && board[fromRow-3][fromCol+1]=="red"){
            if(fromRow+4==toRow && fromCol+4 == toCol){
                removePiece(fromRow-3,fromCol+1);
                removePiece(fromRow-1,fromCol+1);
                console.log("valid double hop!!!")
                return true;
            }
        }

    //if king
    if(getSquare(fromRow,fromCol).firstChild.dataset.king == "true"){
        if(colDiff==2){
            if(currentPlayer == "red" && board[(toRow+fromRow)/2][(toCol+fromCol)/2]=="black" && (currentPlayer == "red")){
                removePiece((toRow+fromRow)/2,(toCol+fromCol)/2);
                return true;
            }
            //checks if can take a red piece
            if(currentPlayer == "black" && board[(toRow+fromRow)/2][(toCol+fromCol)/2]=="red" && (currentPlayer == "black")){
                removePiece((toRow+fromRow)/2,(toCol+fromCol)/2);
                return true;
            }
        }
    
        if(fromRow+1 == toRow && fromCol +1 == toCol|| fromRow+1==toRow && fromCol-1 == toCol|| fromRow-1 == toRow && fromCol+1 == toCol|| fromRow-1== toRow&& fromCol-1==toCol){
            return true;
        }
        return false;
    }


    //checks if single square move is valid
    //with colDiff check if trying to move to far to right or left
    //with rowDiff it checks if trying to move back

    if(colDiff != 1 || (currentPlayer == "red" && rowDiff != 1) || (currentPlayer == "black" &&  rowDiff != -1)){
        console.log("non valid");
        return false;
    }
    

    


    return true;

}
//a way to check for double hop is to use a valid hop and check if there are any more hops that can be made


//take piece
function removePiece(row,col){
    //instead of removeing it outright, we could show it on the side to show how many pieces a player has taken
    const removeSquare = getSquare(row,col);
    removeSquare.innerHTML = "";
    board[row][col] = null;
}
/*
function possibleMoves(row,col){
    let moves = [];
    if(currentPlayer == "red"){
        if(board[row+1][col+1]=="null"){
            moves.push([row+1,col+1]);
        }
        if(board[row+1][col-1]==null){
            moves.push([row+1,col-1]);
        }
        if(board[row+1][col+1]=="black" && board[row+2][col+2]==null){
            moves.push([row+2,col+2]);
            removePiece(row+1,col+1);
            if(board[row+3][col+3]=="black" && board[row+4][col+4]=="null"){
                moves.push([row+4,col+4]);
                removePiece(row+3,col+3);
            } 
        }
        if(board[row+1][col-1]=="black" && board[row+2][col-2]==null){
            moves.push([row+2,col-2]);
            removePiece(row+1,col-1);
        }
    }
    if(currentPlayer=="black"){
        if(board[row-1][col+1]==null){
            moves.push([row-1,col+1]);
        }
        if(board[row-1][col-1]==null){
            moves.push([row-1,col-1]);
        }
        if(board[row-1][col+1]=="red" && board[row-2][col+2]==null){
            moves.push([row-2,col+2]);
            removePiece(row-1,col+1);

        }
        if(board[row-1][col-1]=="red" && board[row-2][col-2]==null){
            moves.push([row-2,col-2]);
            removePiece(row-1,col-1);
        }
    }
    return moves;
}
*/


function checkIfKing(row,col){
    if(currentPlayer=="red" && row == 7){
        toKing = getSquare(row,col);
        toKing.firstChild.classList.add("king");
        toKing.firstChild.dataset.king = "true";
    }
    if(currentPlayer == "black" && row==0){
        toKing = getSquare(row,col);
        toKing.firstChild.classList.add("king");
        toKing.firstChild.dataset.king = "true";
    }
}








//gets the square div
function getSquare(row,col){
    //in class square with where .dataset.row and .col = row,col
    return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}


setupBoard();