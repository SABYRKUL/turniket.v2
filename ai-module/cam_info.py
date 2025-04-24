import cv2
import os

from ai_viewing import count_people


def extract_key_frames(video_path, output_folder='./captures'):

    room_name = video_path[13:-4]
    os.makedirs(output_folder, exist_ok=True)

    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Не удалось открыть видеофайл: {video_path}")
        return

    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    if total_frames <= 0:
        print(f"Не удалось определить количество кадров в видео: {video_path}")
        cap.release()
        return

    frame_indices = [0, total_frames // 2, total_frames - 1]

    for idx, frame_num in enumerate(frame_indices):
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_num)
        ret, frame = cap.read()
        if ret:
            filename = f"{room_name}_frame{idx+1}.png"
            filepath = os.path.join(output_folder, filename)

            cv2.imwrite(filepath, frame)
            print(f"Сохранено изображение: {filepath}")
        else:
            print(f"Не удалось прочитать кадр номер {frame_num}")

    cap.release()
    
    avg_people = 0
    for i in range(1, len(frame_indices)+1):
        image_path = f"./captures/{room_name}_frame{i}.png"

        avg_people += count_people(image_path, i)
    return avg_people//3
