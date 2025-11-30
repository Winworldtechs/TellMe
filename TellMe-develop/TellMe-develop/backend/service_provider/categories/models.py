from django.db import models

class Category(models.Model):
    slug = models.SlugField(max_length=100, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "categories_category"   # PostgreSQL table name fix
        verbose_name_plural = "Categories"


    def __str__(self):
        return self.title