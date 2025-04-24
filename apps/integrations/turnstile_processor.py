from apps.core.models import Student, TurnstileLog

def process_turnstile_event(card_id: str):
    try:
        student = Student.objects.get(card_id=card_id)
        TurnstileLog.objects.create(student=student)
        # Логируем событие (можно добавить в админку или файл)
    except Student.DoesNotExist:
        # Обработка неизвестных карт (например, отправка уведомления админу)
        pass