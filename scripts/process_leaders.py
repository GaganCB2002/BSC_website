import sys
from PIL import Image
from rembg import remove

def process():
    input_path = r'C:\Users\gagan\.gemini\antigravity-ide\brain\ac13420a-01de-47ed-900e-779439ae3c24\.user_uploaded\media_1789390034942.jpg'
    
    print("Loading image...")
    inp = Image.open(input_path)
    
    print("Removing background...")
    out = remove(inp)
    
    width, height = out.size
    print(f"Image size: {width}x{height}")
    
    # Left person (Chandrashekar)
    # Estimate: x from 50 to 350
    left_box = (40, 200, 360, height-20)
    chandrashekar = out.crop(left_box)
    chandrashekar.save(r'd:\workspace-01a09e59-de88-7f49-8021-63a6aedf33ff\bsc-website\frontend\assets\img\leader-chandrashekar.png')
    
    # Middle person (Umapathy)
    # Estimate: x from 260 to 520
    middle_box = (250, 200, 530, height-20)
    umapathy = out.crop(middle_box)
    umapathy.save(r'd:\workspace-01a09e59-de88-7f49-8021-63a6aedf33ff\bsc-website\frontend\assets\img\leader-umapathy.png')
    
    print("Saved cropped images successfully.")

if __name__ == '__main__':
    process()
