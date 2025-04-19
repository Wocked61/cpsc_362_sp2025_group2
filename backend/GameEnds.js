// Utility function to append messages to the console area.
function log(message) {
  const consoleElement = document.getElementById('console');
  consoleElement.textContent += message + "\n";
  consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Utility function to create an array of piece objects.
function createPieces(total) {
  const pieces = [];
  for (let i = 0; i < total; i++) {
    pieces.push({ alive: true });
  }
  return pieces;
}

// CheckersGame class encapsulates the game logic.
class CheckersGame {
  /**
   * @param {Array} redPieces - Array representing red player's pieces.
   * @param {Array} blackPieces - Array representing black player's pieces.
   * @param {number} redTime - Time allotted for the red player (in seconds).
   * @param {number} blackTime - Time allotted for the black player (in seconds).
   */
  constructor(redPieces, blackPieces, redTime, blackTime) {
    this.redPieces = redPieces;
    this.blackPieces = blackPieces;
    this.redTime = redTime; // Time remaining for the red player.
    this.blackTime = blackTime; // Time remaining for the black player.
    this.gameOver = false;
    this.intervalId = null;
  }

  // Start the game timer and check game-ending conditions each second.
  startGame() {
    log("Game started!");
    this.intervalId = setInterval(() => {
      this.redTime--;
      this.blackTime--;

      log(`Red Time: ${this.redTime} seconds | Black Time: ${this.blackTime} seconds`);

      if (this.checkGameOver()) {
        clearInterval(this.intervalId);
        this.endGame();
      }
    }, 1000);
  }

  // Check if the game has ended based on the three conditions.
  checkGameOver() {
    // Condition 1: Time runs out for either side.
    if (this.redTime <= 0) {
      log("Red player's time has run out! Black wins!");
      this.gameOver = true;
      return true;
    }

    if (this.blackTime <= 0) {
      log("Black player's time has run out! Red wins!");
      this.gameOver = true;
      return true;
    }

    // Condition 2: Check if all black pieces are captured.
    const blackAlive = this.blackPieces.filter(piece => piece.alive).length;
    if (blackAlive === 0) {
      log("All black pieces have been captured! Red wins!");
      this.gameOver = true;
      return true;
    }

    // Condition 3: Check if all red pieces are captured.
    const redAlive = this.redPieces.filter(piece => piece.alive).length;
    if (redAlive === 0) {
      log("All red pieces have been captured! Black wins!");
      this.gameOver = true;
      return true;
    }

    return false; // Game continues if no conditions are met.
  }

  // Handle end-of-game activities.
  endGame() {
    log("Game Over!");
  }
}

// Global variable to hold the game instance.
let game;

// Set up the Start Game button listener.
document.getElementById('startBtn').addEventListener('click', () => {
  // Clear the console area before starting a new game.
  document.getElementById('console').textContent = "";

  // Create 12 pieces for each side, typical for a checkers game.
  const redPieces = createPieces(12);
  const blackPieces = createPieces(12);

  // Set the time for each player in seconds.
  const redTime = 30; // Example: Red has 30 seconds.
  const blackTime = 30; // Example: Black has 30 seconds.

  // Initialize and start the game.
  game = new CheckersGame(redPieces, blackPieces, redTime, blackTime);
  game.startGame();

  // Simulated example: Capture all black pieces after 10 seconds.
  setTimeout(() => {
    blackPieces.forEach(piece => piece.alive = false);
    log("Simulated capturing all black pieces.");
  }, 10000);
});
