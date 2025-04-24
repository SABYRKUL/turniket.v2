from django.urls import path
from .views import AICameraDataView, ImportStudentsView, LoginView, ResetCountersView, GroupStatisticsView, ImportScheduleView


urlpatterns = [
    path('ai/people-count/', AICameraDataView.as_view(), name='ai-camera-data'),
    path('login/', LoginView.as_view(), name='login'),
    path('import-students/', ImportStudentsView.as_view(), name='import-students'),
    path('import-schedule/', ImportScheduleView.as_view(), name='import-schedule'),
    path('reset-counters/', ResetCountersView.as_view(), name='reset-counters'),
    path('group-statistics/<str:group_name>/', GroupStatisticsView.as_view(), name='group-statistics'),
]