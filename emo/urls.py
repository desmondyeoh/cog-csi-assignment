from django.urls import path
from . import views

urlpatterns = [
	path('acme-challenge/PVvfKwSeozsLTafSnIYC2U6RSsWGBcikZUBgZBfoUIQ', views.ssl, name='ssl'),
	path('index', views.index, name="index"),
	path('upload', views.upload_img, name="upload"),
	path('init', views.init_sess, name="init"),
	path('result', views.get_res, name="result"),
]