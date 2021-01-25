import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.db.models import Sum, Count
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from datetime import datetime
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User, Item

def index(request):
    categories = Item.objects.filter(user=request.user.id).values_list('category', flat=True).distinct()
    items = Item.objects.filter(user=request.user.id)
    categorySubG = Item.objects.filter(user=request.user.id).values('category').annotate(total_g=Sum('grams'))
    categorySubOz = Item.objects.filter(user=request.user.id).values('category').annotate(total_oz=Sum('ounces'))
    categorySubCt = Item.objects.filter(user=request.user.id).values('category').annotate(total_ct=Sum('quantity'))
    
    return render(request, "index.html", {
        "categories": categories,
        "items": items,
        "grams": categorySubG,
        "ounces": categorySubOz,
        "counts": categorySubCt
    })

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "register.html")

@csrf_exempt
@login_required
def new_item(request):
    pass

@csrf_exempt
@login_required
def total_weight(request):
    user = User.objects.get(username = request.user)
    data = json.loads(request.body)
    user.weight = data["weight"]
    user.units = data["units"]
    user.save()
    return HttpResponse(status=204)

@csrf_exempt
@login_required
def return_visitor(request):
    user = User.objects.get(username = request.user)
    data = json.loads(request.body)
    user.visited = data["visited"]
    user.save()
    return HttpResponse(status=204)