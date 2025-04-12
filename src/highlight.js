document.querySelectorAll('.piece').forEach(piece => {
    piece.addEventListener('click', () => {
        // Remove 'highlight' class from all pieces
        document.querySelectorAll('.piece').forEach(p => p.classList.remove('highlight'));
        
        // Add 'highlight' class to the clicked piece
        piece.classList.add('highlight');
    });
});
