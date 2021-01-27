from django.urls import path

from . import views

urlpatterns = [
    path('', views.splash, name="splash"),
    path('index', views.index, name='index'),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path('new_item', views.new_item, name="new_item"),
    path('total_weight', views.total_weight, name="total_weight"),
    path('return_visitor', views.return_visitor, name="return_visitor"),
    path('update_item', views.update_item, name="update_item"),
    path('delete_item', views.delete_item, name="delete_item"),
    path('delete_category', views.delete_category, name="delete_category"),
    path('include', views.include, name="include")
]