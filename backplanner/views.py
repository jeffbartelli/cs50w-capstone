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

def splash(request):
    if request.user.is_authenticated:
        return HttpResponseRedirect('/index')
    else:
        return render(request, "splash.html")

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
    data = json.loads(request.body)
    item = Item()
    item.user = request.user
    item.quantity = data['quantity']
    item.category = data['category']
    item.item = data['item']
    item.grams = data['grams']
    item.ounces = data['ounces']
    item.include = data['include']
    item.save()
    return JsonResponse({
        "success": "new item added",
    }, status=201)

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

@csrf_exempt
@login_required
def update_item(request):
    user = request.user
    data = json.loads(request.body)
    category = data['category']
    item = data['oldItem']
    item = Item.objects.get(user = user, category = category, item = item)
    item.user = request.user
    item.item = data['item']
    item.quantity = data['quantity']
    item.grams = data['grams']
    item.ounces = data['ounces']
    item.include = data['include']
    item.save()
    return JsonResponse({
        "success": "item updated successfully.",
    }, status=201)

@csrf_exempt
@login_required
def delete_item(request):
    user = request.user
    data = json.loads(request.body)
    cat = data['category']
    it = data['item']
    item = Item.objects.filter(category = cat, item = it, user = user).delete()
    return JsonResponse({
        "success": "success"
    }, status=201)

@csrf_exempt
@login_required
def delete_category(request):
    user = request.user
    data = json.loads(request.body)
    deleter = data['category']
    category = Item.objects.filter(category = deleter, user = user).delete()
    return JsonResponse({
        "success": "category deleted",
    }, status=201)

@csrf_exempt
@login_required
def include(request):
    user = request.user
    data = json.loads(request.body)
    include = data['include']
    if data['item']:
        record = Item.objects.filter(user = user, category = data['category'], item = data['item']).update(include = data['include'])
    else: 
        record = Item.objects.filter(user = user, category = data['category']).update(include = data['include'])
    return JsonResponse({
        "success": "inclusion updated.",
    }, status=201)