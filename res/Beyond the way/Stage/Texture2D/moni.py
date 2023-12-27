import subprocess
import os
from PIL import Image
import argparse

# コマンドライン引数のパーシング
parser = argparse.ArgumentParser(description='Create an APNG from tile image.')
parser.add_argument('input_image', help='Input image file path')
parser.add_argument('output_apng', help='Output APNG file path')
parser.add_argument('-f', '--fps', type=int, default=30, help='Frames per second for the APNG')
args = parser.parse_args()

# 分割する元の画像ファイル名
input_image_path = args.input_image

# 保存先APNGファイル名
output_apng_path = args.output_apng

# フレームレート
fps = args.fps

# 画像を読み込む
input_image = Image.open(input_image_path)

# 画像を指定したサイズにリサイズ
resize = 1020
input_image = input_image.resize((resize, resize))

# リサイズ後の画像の幅と高さを取得
width, height = input_image.size

# 1つの小さな画像の幅と高さを計算
small_width = width // 5
small_height = height // 5

# 25枚の小さな画像を保持するリストを作成
small_images = []

# 画像を分割し、小さな画像をリストに追加
for i, (y, x) in enumerate(((y, x) for y in range(0, height, small_height) for x in range(0, width, small_width))):
    box = (x, y, x + small_width, y + small_height)
    small_image = input_image.crop(box)
    small_images.append(small_image)

    # ファイル名を生成してPNGファイルとして保存
    temp_path = f"temp_{i:03d}.png"
    small_image.save(temp_path, "PNG")

# 最初の一枚を保存
if small_images:
    first_frame_path = f"{output_apng_path}_frame.png"
    small_images[0].save(first_frame_path, "PNG")

# ffmpegを使用してAPNGを作成
ffmpeg_command = ["ffmpeg", "-r", f"{fps}", "-i", "temp_%03d.png", "-plays", "0", "-f", "apng", output_apng_path]
subprocess.run(ffmpeg_command)

# 一時ファイルを削除
for i in range(len(small_images)):
    temp_path = f"temp_{i:03d}.png"
    os.remove(temp_path)  # ファイルを削除する

print("APNGの作成が完了しました。")
