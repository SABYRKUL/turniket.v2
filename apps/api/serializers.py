from rest_framework import serializers
from apps.core.models import AICameraData, User



class TurnstileEventSerializer(serializers.Serializer):
    card_id = serializers.CharField()

class AICameraDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AICameraData
        fields = ['room', 'people_count']


class UserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['is_student', 'is_admin']