from datetime import datetime, date
from django.db.models import Avg
from apps.core.models import Student, Group, TurnstileLog, AICameraData


def get_student_attendance(student: Student, target_date: date) -> dict:
    logs = TurnstileLog.objects.filter(
        student=student,
        timestamp__date=target_date
    ).order_by('timestamp')
    
    return {
        'present': logs.exists(),
        'first_entry': logs.first().timestamp if logs.exists() else None,
        'last_exit': logs.last().timestamp if logs.exists() else None
    }

def analyze_class_attendance(group: Group, schedule_entry: dict) -> bool:
    start_time = datetime.strptime(schedule_entry['start'], "%H:%M").time()
    end_time = datetime.strptime(schedule_entry['end'], "%H:%M").time()
    room = schedule_entry['room']
    
    # Фильтрация данных ИИ по времени занятия
    ai_data = AICameraData.objects.filter(
        room=room,
        timestamp__time__range=(start_time, end_time)
    ).aggregate(avg_people=Avg('people_count'))
    
    expected = group.students.count()
    actual = ai_data['avg_people'] or 0
    return actual >= 0.8 * expected  # 80% присутствия