from django.shortcuts import render

# Create your views here.

def home(request):
    return render(request, "home.html")

def checkers(request):
    return render(request, "index.html")

def chess(request):
    return render(request, "chess.html")