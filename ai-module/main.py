from time import sleep
from datetime import datetime

import requests

import conf
from cam_info import extract_key_frames


def send_people_count_to_backend(room_name, avg_people):
    print(f"Отправляю данные: room={room_name}, people_count={avg_people}")
    response = requests.post(
"http://10.10.47.98:8000/api/ai/people-count/",
        data={
            "room": room_name,
            "people_count": avg_people
        }
    )
    print(response.status_code, response.text)


if __name__ == "__main__":
    videos = [
        './media_temp/TS-5.mp4',
      # './media_temp/TS-7.mp4',
      # './media_temp/205.mp4',
      # './media_temp/TS-4.mp4',
      # './media_temp/202.mp4',
      # ...,
      # './media_temp/XXXX.mp4',
    ]

    while conf.TURN_ON:
        for video_path in videos:
            sleep(conf.SLEEP_TIME)
            room_name = video_path[13:-4]
            avg_people = extract_key_frames(video_path)
            send_people_count_to_backend(room_name, avg_people)