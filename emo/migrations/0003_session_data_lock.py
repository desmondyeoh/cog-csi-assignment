# Generated by Django 2.0.5 on 2018-05-07 17:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('emo', '0002_remove_session_data_lock'),
    ]

    operations = [
        migrations.AddField(
            model_name='session_data',
            name='lock',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]