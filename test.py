import os
import random
import shutil

base = ""
for directory in os.listdir(base):
    moved = 0
    while moved < 200:
        for file in os.listdir(base + directory):
            if random.random() < 0.1:
                moved += 1
                shutil.move(f"{base}{directory}/{file}",  f"{base}test")
            if moved >= 200:
                break