from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser, Group, Permission
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    is_student = models.BooleanField(default=False)
    is_admin = models.BooleanField(default=False)
    groups = models.ManyToManyField(
        Group,
        verbose_name=_('groups'),
        blank=True,
        help_text=_('The groups this user belongs to.'),
        related_name='core_users_groups'
    )
    user_permissions = models.ManyToManyField(
        Permission,
        verbose_name=_('user permissions'),
        blank=True,
        help_text=_('Specific permissions for this user.'),
        related_name='core_users_permissions'
    )

class Student(models.Model):
    user = models.OneToOneField('User', on_delete=models.CASCADE)
    group = models.ForeignKey('Group', on_delete=models.SET_NULL, null=True)
    card_id = models.CharField(max_length=20, unique=True)

    class Meta:
        indexes = [models.Index(fields=['card_id'])]

class Group(models.Model):
    name = models.CharField(max_length=50)
    student_count_today = models.IntegerField(default=0)
    def reset_student_count(self):
        self.student_count_today = 0
        self.save()
    
class Schedule(models.Model):
    group = models.OneToOneField('Group', on_delete=models.CASCADE, related_name='schedule')
    schedule_data = models.JSONField()

    def __str__(self):
        return f"Расписание для {self.group.name}"

class TurnstileLog(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE)
    timestamp = models.DateTimeField(auto_now_add=True)

class AICameraData(models.Model):
    room = models.CharField(max_length=50)
    people_count = models.IntegerField(null=True, blank=True)
    timestamp = models.DateTimeField(default = timezone.now)

    def __str__(self):
        return f"{self.room} - {self.people_count} people at {self.timestamp}"