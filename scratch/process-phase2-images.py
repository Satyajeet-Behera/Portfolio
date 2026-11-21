import os
from PIL import Image
from rembg import remove, new_session

def process_images():
    raw_dir = os.path.abspath('assets/raw')
    public_img_dir = os.path.abspath('public/images')
    os.makedirs(public_img_dir, exist_ok=True)

    tony_raw = os.path.join(raw_dir, 'tony-stark-original.jpg')
    satya_raw = os.path.join(raw_dir, 'satyajeet-suit-original.jpg')

    # 1. Process Tony Stark Image with rembg (U2Net model)
    print("Opening Tony Stark raw image:", tony_raw)
    tony_img = Image.open(tony_raw).convert('RGBA')

    # Save original PNG copy in public/images
    tony_original_png = os.path.join(public_img_dir, 'tony-stark-original.png')
    tony_img.save(tony_original_png, format='PNG')
    print("Saved original Tony Stark PNG:", tony_original_png)

    print("Removing background from Tony Stark image using rembg (isnet-general-use or u2net)...")
    # Using default u2net session with alpha matting for clean hair/edge separation
    session = new_session('u2net')
    cutout = remove(
        tony_img,
        session=session,
        alpha_matting=True,
        alpha_matting_foreground_threshold=240,
        alpha_matting_background_threshold=10,
        alpha_matting_erode_size=5
    )

    cutout_png = os.path.join(public_img_dir, 'tony-stark-cutout.png')
    cutout_webp = os.path.join(public_img_dir, 'tony-stark-cutout.webp')

    cutout.save(cutout_png, format='PNG')
    print(f"Saved transparent PNG: {cutout_png} ({os.path.getsize(cutout_png)} bytes)")

    cutout.save(cutout_webp, format='WEBP', quality=95, method=6)
    print(f"Saved transparent WebP: {cutout_webp} ({os.path.getsize(cutout_webp)} bytes)")

    # 2. Process Satyajeet Suit Image for web optimization
    print("Processing Satyajeet Suit image:", satya_raw)
    satya_img = Image.open(satya_raw).convert('RGB')
    
    satya_webp = os.path.join(public_img_dir, 'satyajeet-suit.webp')
    satya_jpg = os.path.join(public_img_dir, 'satyajeet-suit.jpg')
    
    satya_img.save(satya_webp, format='WEBP', quality=92, method=6)
    satya_img.save(satya_jpg, format='JPEG', quality=92)
    print(f"Saved Satyajeet Suit WebP: {satya_webp} ({os.path.getsize(satya_webp)} bytes)")
    print(f"Saved Satyajeet Suit JPEG: {satya_jpg} ({os.path.getsize(satya_jpg)} bytes)")

    print("Image processing complete!")

if __name__ == '__main__':
    process_images()
