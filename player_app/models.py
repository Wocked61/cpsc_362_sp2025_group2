from django.db import models
from django.contrib.auth.models import User


class Player(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

def __str__(self):
  player = self.user.username if self.user else 'Deleted User'
  return f"Player: {player}"