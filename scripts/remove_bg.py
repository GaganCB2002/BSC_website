from rembg import remove
from PIL import Image

input_path = 'd:\\workspace-01a09e59-de88-7f49-8021-63a6aedf33ff\\bsc-website\\WhatsApp Image 2026-09-14 at 4.23.59 PM.jpeg'
output_path = 'd:\\workspace-01a09e59-de88-7f49-8021-63a6aedf33ff\\bsc-website\\frontend\\assets\\img\\leader-ved.png'

inp = Image.open(input_path)
out = remove(inp)
out.save(output_path)
print("Background removed and saved!")
