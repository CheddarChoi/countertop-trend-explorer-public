import os, cv2, torch
import numpy as np
from PIL import Image

def find_min_dimensions(folder_path):
    min_width = float('inf')
    min_height = float('inf')

    for filename in os.listdir(folder_path):
        file_path = os.path.join(folder_path, filename)
        if os.path.isfile(file_path):
            img = cv2.imread(file_path, cv2.IMREAD_UNCHANGED)
            if img is not None:
                height, width = img.shape[:2]
                if width < min_width:
                    min_width = width
                if height < min_height:
                    min_height = height

    return min_width, min_height

def add_candidate_hists(tile_dir):
    tile_images = []
    candidate_hists = []

    for color_folder in os.listdir(tile_dir):
        if color_folder != ".DS_Store":
            color_folder_path = os.path.join(tile_dir, color_folder)
            folder_images = []
            folder_hists = []
            for filename in os.listdir(color_folder_path):
                if filename != ".DS_Store":
                    file_path = os.path.join(color_folder_path, filename)
                    img = cv2.imread(file_path, cv2.IMREAD_COLOR)
                    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
                    hist = cv2.calcHist([hsv], [0, 1, 2], None, [180, 256, 256], [0, 180, 0, 256, 0, 256])
                    cv2.normalize(hist, hist, 0, 1, cv2.NORM_MINMAX)
                    folder_hists.append(hist)
                    folder_images.append(img)

            mean_hist = np.mean(folder_hists, axis=0)

            min_width, min_height = find_min_dimensions(color_folder_path)
            resized_images = [cv2.resize(img, (min_width, min_height)) for img in folder_images]
            mean_image = np.mean(resized_images, axis=0).astype(np.uint8)
            
            candidate_hists.append(mean_hist)
            tile_images.append({
                "name": color_folder,
                "image_rgb": Image.fromarray(cv2.cvtColor(mean_image, cv2.COLOR_BGR2RGB))
            })

    return tile_images, candidate_hists

def color_similarity(image, mask, tile_images, candidate_hists):
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    query_hist = cv2.calcHist([hsv], [0, 1, 2], mask, [180, 256, 256], [0, 180, 0, 256, 0, 256])
    cv2.normalize(query_hist, query_hist, 0, 1, cv2.NORM_MINMAX)
    
    similarity = []

    for histogram in candidate_hists:
        ret = cv2.compareHist(query_hist, histogram, 3)  # 3: BHATTACHARYYA
        similarity.append(ret)

    sim_idx = np.argsort(np.array(similarity))
    similarity = (1 - (similarity[sim_idx[0]])) * 100

    return tile_images[sim_idx[0]]['name'], similarity

def crop_to_mask(image, mask):
    unique_values = np.unique(mask)
    if 255 not in unique_values:
        print("Mask does not contain any non-zero values.")
        return image.convert("RGB") if not isinstance(image, Image.Image) else image

    coords = cv2.findNonZero(mask)
    x, y, w, h = cv2.boundingRect(coords)

    if isinstance(image, Image.Image):
        width, height = image.size
    else:
        height, width = image.shape[:2]

    x = max(x, 0)
    y = max(y, 0)
    w = min(w, width - x)
    h = min(h, height - y)

    if not isinstance(image, Image.Image):
        image = Image.fromarray(image)

    cropped_image = image.crop((x, y, x + w, y + h))
    
    return cropped_image.convert("RGB")

def predict_image_class(image, mask, model, processor, labels):
    cropped_image = crop_to_mask(image, mask)

    inputs = processor(images=cropped_image, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
    
    logits = outputs.logits
    predicted_class_idx = logits.argmax(-1).item()
    
    predicted_class_label = labels[predicted_class_idx]
    certainty = torch.softmax(logits, dim=1).max().item() * 100
    
    return predicted_class_label, certainty
