import uuid
from django.db import models

# Create your models here.
# class: game state
# attributes: player, score, turn, board state, game state, timer, move
class GameState(models.Model):
    #const list to display game state
    STATUS_CHOICES = [
      ('active', 'Active'),
      ('win', 'Win'),
      ('lose', 'Lose'),
      ('draw', 'Draw'),
    ]
