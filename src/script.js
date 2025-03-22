var boardContainer = document.getElementById("boardContainer");
const rows = 8, cols = 8;
let board = [];
let currentPlayer = "black";
let selectedPiece = null;  
//can add more cords in jumps to hop over 3 or more peices
const moveSet = [
    {piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0]}, //right
    {piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0]}, //left
    {piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0]}, //right
    {piece: "black", enemy: "red", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]} //left  
];
const kingMoveSet = [
    //add jump down then up for left and right
    {piece: "red", enemy: "black", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0]}, //right
    {piece: "red", enemy: "black", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0]}, //left
    {piece: "red", enemy: "black", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0]}, //right
    {piece: "red", enemy: "black", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]}, //left  
    {piece: "black", enemy: "red", jumps: [1, 1, 2, 2, 3, 3, 4, 4, 4, 0]}, //right
    {piece: "black", enemy: "red", jumps: [1, -1, 2, -2, 3, -3, 4, -4, 4, 0]}, //left
    {piece: "black", enemy: "red", jumps: [-1, 1, -2, 2, -3, 3, -4, 4, -4, 0]}, //right
    {piece: "black", enemy: "red", jumps: [-1, -1, -2, -2, -3, -3, -4, -4, -4, 0]} //left  
];
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
    
    if (selectedPiece) { //if selectedPiece is not empty
        let valid = validMove(selectedPiece.row, selectedPiece.col, row, col);
        
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
    
    //chek if in bounds of board
    for(let x of moveSet){
        if(getSquare(fromRow,fromCol).firstChild.dataset.king == "false"){
            if(hops(fromRow,fromCol,toRow,toCol,x)){return true;}
        }
    }

    //if king
    if(getSquare(fromRow,fromCol).firstChild.dataset.king == "true"){
        if(fromRow+1 == toRow && fromCol +1 == toCol|| fromRow+1==toRow && fromCol-1 == toCol|| fromRow-1 == toRow && fromCol+1 == toCol|| fromRow-1== toRow&& fromCol-1==toCol){
            return true;
        }
        for(let x of kingMoveSet){
            if(hops(fromRow,fromCol,toRow,toCol,x)){return true;}
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


//take piece
function removePiece(row,col){
    const removeSquare = getSquare(row,col);
    removeSquare.innerHTML = "";
    board[row][col] = null;
}


//converts piece
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

//move over 1 or move peice
function hops(fromRow,fromCol,toRow,toCol,moves){
    let {piece, enemy, jumps} = moves;
    let i=0;j=1;
    for(;j<jumps.length;){
        if(fromRow+jumps[i]==toRow && fromCol+jumps[j]==toCol){
            if(board[fromRow][fromCol] == piece && board[fromRow+jumps[0]][fromCol+jumps[1]] == enemy && board[fromRow+jumps[2]][fromCol+jumps[3]] == null){
                //single
                if(toRow == fromRow+jumps[2] && toCol == fromCol+jumps[3]){
                    removePiece(fromRow+jumps[0],fromCol+jumps[1]);
                    return true;
                }
                //double same (r-r or l-l)
                if(board[fromRow+jumps[4]][fromCol+jumps[5]] == enemy && fromRow+jumps[6] == toRow && fromCol+jumps[7] == toCol){
                    removePiece(fromRow+jumps[4],fromCol+jumps[5]);
                    removePiece(fromRow+jumps[0],fromCol+jumps[1]);
                    return true;          
                }
                //double diff (r-l or l-r)
                if(board[fromRow+jumps[4]][fromCol+jumps[1]] == enemy && fromRow+jumps[8] == toRow && fromCol+jumps[9] == toCol){
                    removePiece(fromRow+jumps[4],fromCol+jumps[1]);
                    removePiece(fromRow+jumps[0],fromCol+jumps[1]);
                    return true;
                }
            }
        }else i = i + 2; j = j + 2;
    }
    
}

//gets the square div
function getSquare(row,col){
    //in class square with where .dataset.row and .col = row,col
    return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}


setupBoard();