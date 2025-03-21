
// script.js
const board = document.getElementById("board")

// Create the board
for (let i = 0; i < 64; i++) {
  const square = document.createElement("div")
  square.classList.add("square")
  square.classList.add((Math.floor(i / 8) + i) % 2 === 0 ? "light" : "dark")

  // Add a piece to the dark squares in the top 3 rows
  if (square.classList.contains("dark") && i < 24) {
    const piece = document.createElement("div")
    piece.classList.add("piece")
    piece.id = `piece-${i}` // Assign unique IDs to pieces
    piece.draggable = true

    piece.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text", e.target.id)
    })

    square.appendChild(piece)
  }

  // Add event listeners for dropping pieces
  square.addEventListener("dragover", (e) => e.preventDefault())
  square.addEventListener("drop", (e) => {
    const pieceId = e.dataTransfer.getData("text")
    const piece = document.getElementById(pieceId)

    // Ensure the target square is a valid dark square and is empty
    if (square.classList.contains("dark") && square.childNodes.length === 0) {
      square.appendChild(piece)

      // Check if the piece reached the opposite end to become a king
      const row = Math.floor(Array.from(board.children).indexOf(square) / 8)
      if (
        (piece.style.backgroundColor === "red" && row === 7) ||
        (piece.style.backgroundColor === "blue" && row === 0)
      ) {
        piece.classList.add("king") // Add king styling
      }
    }
  })

  board.appendChild(square)
}

// Add CSS for king pieces dynamically
const style = document.createElement("style")
style.innerHTML = `
    .king {
        box-shadow: 0 0 0 4px purple; /* Creates a purple ring around the piece */
    }
`
document.head.appendChild(style)
