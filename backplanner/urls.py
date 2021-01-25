from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('new_item', views.new_item, name="new_item"),
    path('total_weight', views.total_weight, name="total_weight"),
    path('return_visitor', views.return_visitor, name="return_visitor")
]