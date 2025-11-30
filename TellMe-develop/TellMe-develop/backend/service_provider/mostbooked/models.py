from django.db import models

class MostBooked(models.Model):
    title = models.CharField(max_length=100)
    image = models.ImageField(upload_to='most_booked_images/')

    def __str__(self):
        return self.title