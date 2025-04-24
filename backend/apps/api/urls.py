from django.urls import path
from .views import AICameraDataView

from .views import ImportStudentsView, LoginView

urlpatterns = [
    path('ai/people-count/', AICameraDataView.as_view(), name='ai-camera-data'),
    path('login/', LoginView.as_view(), name='login'),
    path('import-students/', ImportStudentsView.as_view(), name='import-students'),
]