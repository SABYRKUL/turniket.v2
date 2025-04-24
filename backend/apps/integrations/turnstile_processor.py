from datetime import date
from apps.core.models import Student, TurnstileLog

def process_turnstile_event(card_id: str):
    try:
        student = Student.objects.get(card_id=card_id)
        
        # Проверяем, не был ли студент уже зарегистрирован сегодня
        today = date.today()
        if TurnstileLog.objects.filter(student=student, timestamp__date=today).exists():
            raise ValueError("Студент уже зарегистрирован сегодня")
        
        # Регистрируем вход
        TurnstileLog.objects.create(student=student)
        
        # Увеличиваем счётчик группы
        group = student.group
        if group:
            group.student_count_today = (group.student_count_today or 0) + 1
            group.save()
        
    except Student.DoesNotExist:
        # Обработка неизвестных карт (например, отправка уведомления админу)
        raise ValueError("Студент не найден")