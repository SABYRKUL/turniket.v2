from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import TurnstileEventSerializer, AICameraDataSerializer
from apps.integrations.turnstile_processor import process_turnstile_event
from apps.core.models import Group, User, Student
from rest_framework import status



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
            serializer.save()  # timestamp добавляется автоматически
            return Response({"message": "Данные успешно сохранены"}, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    def post(self, request):
        login_id = request.data.get('loginId')
        password = request.data.get('password')
        is_student = request.data.get('isStudent', False)

        try:
            user = User.objects.get(username=login_id)

            if not user.check_password(password):
                return Response({'message': 'Неверный логин или пароль'}, status=status.HTTP_401_UNAUTHORIZED)

            if is_student and not user.is_student:
                return Response({'message': 'Вы не являетесь студентом'}, status=status.HTTP_403_FORBIDDEN)

            if not is_student and not user.is_admin:
                return Response({'message': 'Вы не являетесь администратором'}, status=status.HTTP_403_FORBIDDEN)

            serializer = UserSerializer(user)
            return Response(serializer.data)

        except User.DoesNotExist:
            return Response({'message': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)

from rest_framework.permissions import IsAdminUser

class ImportStudentsView(APIView):
    permission_classes = []

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

                    if created_user:
                        user.set_password("default1234")
                        user.save()

                    Student.objects.get_or_create(
                        user=user,
                        defaults={"group": group, "card_id": card_id}
                    )
                    created += 1
        return Response({"message": f"Добавлено студентов: {created}"}, status=201)