from django.db import models

# Create your models here.
class Session_data(models.Model):
	session_id = models.CharField(max_length=200, primary_key=True)
	usr_data = models.TextField()
	total_img = models.IntegerField()
	spp = models.IntegerField()
	lock = models.IntegerField()