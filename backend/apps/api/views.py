from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .serializers import TurnstileEventSerializer, AICameraDataSerializer, UserSerializer
from datetime import date
from django.db.models import Avg
from apps.core.models import Group, Student, TurnstileLog, User, AICameraData, Schedule
from apps.integrations.turnstile_processor import process_turnstile_event

class GroupStatisticsView(APIView):
    def get(self, request, group_name):
        try:
            # Находим группу
            group = Group.objects.get(name=group_name)
            
            # Общее количество студентов в группе
            total_students = Student.objects.filter(group=group).count()
            
            # Количество студентов, которые пришли сегодня
            today = date.today()
            present_students = TurnstileLog.objects.filter(
                student__group=group,
                timestamp__date=today
            ).values('student').distinct().count()  # Уникальные студенты
            
            # Процент пришедших
            attendance_percentage = (present_students / total_students) * 100 if total_students > 0 else 0
            
            # Количество пропустивших
            absent_students = total_students - present_students
            
            # Данные от ИИ
            ai_data = AICameraData.objects.filter(
                room=group.current_room,  # Используем аудиторию группы
                timestamp__date=today
            ).aggregate(avg_people=Avg('people_count'))
            ai_count = ai_data['avg_people'] or 0
            
            return Response({
                "group": group.name,
                "total_students": total_students,
                "present_students": present_students,
                "absent_students": absent_students,
                "attendance_percentage": round(attendance_percentage, 2),
                "ai_people_count": round(ai_count, 2),
            })
        
        except Group.DoesNotExist:
            return Response({"error": "Группа не найдена"}, status=404)

class ResetCountersView(APIView):
    def post(self, request):
        for group in Group.objects.all():
            group.student_count_today = 0
            group.save()
        return Response({"message": "Счётчики групп успешно сброшены"})

class TurnstileEventView(APIView):
    def post(self, request):
        serializer = TurnstileEventSerializer(data=request.data)
        if serializer.is_valid():
            process_turnstile_event(serializer.validated_data['card_id'])
            return Response(status=200)
        return Response(serializer.errors, status=400)

class AICameraDataView(APIView):
    def post(self, request):
        serializer = AICameraDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Данные успешно сохранены"}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        login_id = request.data.get('loginId')
        is_student = request.data.get('isStudent', False)
        try:
            user = User.objects.get(username=login_id)
            if is_student and not user.is_student:
                return Response({'message': 'Вы не являетесь студентом'}, status=status.HTTP_403_FORBIDDEN)
            if not is_student and not user.is_admin:
                return Response({'message': 'Вы не являетесь администратором'}, status=status.HTTP_403_FORBIDDEN)
            serializer = UserSerializer(user)
            return Response(serializer.data)
        except User.DoesNotExist:
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

class ImportScheduleView(APIView):
    permission_classes = []

    def post(self, request):
        data = request.data
        created = 0

        for group_name, schedule_data in data.items():
            # Находим или создаём группу
            group, _ = Group.objects.get_or_create(name=group_name)
            
            # Создаём или обновляем расписание для группы
            schedule, created_schedule = Schedule.objects.get_or_create(group=group)
            schedule.schedule_data = schedule_data
            schedule.save()
            created += 1

        return Response({"message": f"Добавлено расписаний: {created}"}, status=status.HTTP_201_CREATED)

class ImportStudentsView(APIView):
    def post(self, request):
        data = request.data
        created = 0
        
        for group_name, students in data.items():
            group, _ = Group.objects.get_or_create(name=group_name)
            for student in students:
                for full_name, card_id in student.items():
                    first_name = full_name.split()[0]
                    last_name = ' '.join(full_name.split()[1:])
                    username = f"{first_name.lower()}_{card_id}"
                    
                    user, created_user = User.objects.get_or_create(
                        username=username,
                        defaults={
                            "first_name": first_name,
                            "last_name": last_name,
                            "is_student": True
                        }
                    )
                    
                    Student.objects.get_or_create(
                        user=user,
                        defaults={"group": group, "card_id": card_id}
                    )
                    created += 1
        
        return Response({"message": f"Добавлено студентов: {created}"}, status=201)