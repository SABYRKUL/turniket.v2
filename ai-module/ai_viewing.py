import os

from ultralytics import YOLO


model = YOLO("yolov8n.pt")


def count_people(image_path, i):
    results = model(image_path)
    count = 0
    for result in results:
        for box in result.boxes:
            if int(box.cls[0]) == 0:
                count += 1


    if os.path.exists(image_path):
        os.remove(image_path)

    return count
