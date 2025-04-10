from django.db import models

# Create your models here.
# class: game state
# attributes: player, score, turn, board state, game state, timer, move
class GameState(models.Model):
  player = models.TextField()
  score = models.TextField()
  turn = models.TextField()
  board_state = models.TextField()
  game_state = models.TextField()
  timer = models.TextField()
  move = models.TextField()

  