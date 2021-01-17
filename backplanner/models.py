from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class User(AbstractUser):
    visited = models.BooleanField(default=False)

class Item(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created = models.DateTimeField(auto_now_add=True)
    include = models.BooleanField(default=False)
    quantity = models.PositiveIntegerField(default=0)
    category = models.CharField(max_length=20)
    item = models.CharField(max_length=50)
    grams = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)
    ounces = models.DecimalField(max_digits=5, decimal_places=1, default=0.0)

    def __str__(self):
        return f"Include: {self.include} | QTY: {self.quantity} | {self.category} | {self.item} | g: {self.grams} / {self.ounces}"