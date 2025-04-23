from django.urls import path
from . import views

urlpatterns = [
  path("", views.home, name="home"),
  path("checkers/", views.checkers, name="checkers"),
  path("chess/", views.chess, name="chess"),
]