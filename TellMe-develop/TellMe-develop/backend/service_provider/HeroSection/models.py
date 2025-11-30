from django.db import models

class Hero(models.Model):
    title = models.CharField(max_length=100)
    subtitle = models.TextField(blank=True, null=True)

    # 🔹 4 separate image fields
    image1 = models.ImageField(upload_to='hero/', blank=True, null=True)
    image2 = models.ImageField(upload_to='hero/', blank=True, null=True)
    image3 = models.ImageField(upload_to='hero/', blank=True, null=True)
    image4 = models.ImageField(upload_to='hero/', blank=True, null=True)

    button_text = models.CharField(max_length=50, default='Explore Now')
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
