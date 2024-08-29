import sys, os, random
from utils.config import BASE_PATH, OPENAI_SETTINGS

os.environ["HF_HOME"] = BASE_PATH + "/cache"
sys.path.append(BASE_PATH + "/paint_by_example")

from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from utils.model_loading import (
    countertop_model,
    predictor,
    model,
    processor,
    labels,
    cabinet_model,
    floor_model,
    cabinet_classifier,
    slab_generation_pipe_prior,
    slab_generation_pipe,
)
from utils.image_processing import image_to_masks
from utils.color_similarity import (
    color_similarity,
    add_candidate_hists,
    predict_image_class,
)
from inference import pbe
from utils.get_trenddata import (
    trendingCountsOne,
    trendingCountsThree,
    trendingCountsTotal,
    find_trending_color_pattern,
)
from PIL import Image, ImageChops
import cv2, base64
from datetime import datetime
import numpy as np
from openai import OpenAI
import pandas as pd

IMAGE_DIR = "images"
app = Flask(__name__, static_folder=IMAGE_DIR)
CORS(app)  # Enable CORS for all routes

# Settings
COUNTERTOP_TILE_DIR = BASE_PATH + "/color_data/countertop"
CABINET_TILE_DIR = BASE_PATH + "/color_data/cabinet"
FLOOR_TILE_DIR = BASE_PATH + "/color_data/floor"
COUNTERTOP_SLAB_TAGED = BASE_PATH + "/tagged_by_color_pattern"

countertop_tile_images, countertop_candidate_hists = add_candidate_hists(
    COUNTERTOP_TILE_DIR
)
cabinet_tile_images, cabinet_candidate_hists = add_candidate_hists(CABINET_TILE_DIR)
floor_tile_images, floor_candidate_hists = add_candidate_hists(FLOOR_TILE_DIR)

client = OpenAI(
    organization=OPENAI_SETTINGS["organization"],
    project=OPENAI_SETTINGS["project"],
    api_key=OPENAI_SETTINGS["api_key"],
)
tileinfo = pd.read_csv(BASE_PATH + "/tileinfo.csv")


@app.route("/")
def test():
    return render_template("index.html")


def extract_features(filename):
    if not os.path.exists(IMAGE_DIR + "/" + filename):
        return {"cabinet": {"type": None, "color": None}, "floor": {"color": None}}

    image_bgr = cv2.imread(IMAGE_DIR + "/" + filename)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_pil = Image.fromarray(image_rgb)

    cabinet_type, cabinet_color, floor_color = None, None, None

    # Cabinet ######################################

    cabinet_objects = cabinet_model.predict(image_rgb, conf=0.6)
    cabinet_all_masks = []

    for c in cabinet_objects[0]:
        b_mask = np.zeros(image_rgb.shape[:2], np.uint8)
        contour = c.masks.xy.pop().astype(np.int32).reshape(-1, 1, 2)

        if contour is None or contour.shape[0] == 0:
            continue

        cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
        cabinet_all_masks.append(b_mask)

    if len(cabinet_all_masks) != 0:
        combined_mask = np.zeros_like(cabinet_all_masks[0])

        for mask in cabinet_all_masks:
            combined_mask |= mask

        cabinet_color, _ = color_similarity(
            image_bgr, combined_mask, cabinet_tile_images, cabinet_candidate_hists
        )

        cabinet_mask_pil = Image.fromarray(combined_mask)
        cabinet_masked_image = ImageChops.multiply(
            image_pil, cabinet_mask_pil.convert("RGB")
        )
        pred = cabinet_classifier(cabinet_masked_image)
        pred_label = pred[0]["label"]

        if pred_label == "LABEL_0":
            cabinet_type = "Flat Panel"
        else:
            cabinet_type = "Non-Flat Panel"

    # Floor  #######################################

    floor_objects = floor_model.predict(image_rgb, conf=0.6)
    floor_all_masks = []

    for f in floor_objects[0]:
        b_mask = np.zeros(image_rgb.shape[:2], np.uint8)
        contour = f.masks.xy.pop().astype(np.int32).reshape(-1, 1, 2)

        if contour is None or contour.shape[0] == 0:
            continue

        cv2.drawContours(b_mask, [contour], -1, (255, 255, 255), cv2.FILLED)
        floor_all_masks.append(b_mask)

    if len(floor_all_masks) != 0:
        combined_mask = np.zeros_like(floor_all_masks[0])

        for mask in floor_all_masks:
            combined_mask |= mask

        floor_color, _ = color_similarity(
            image_bgr, combined_mask, floor_tile_images, floor_candidate_hists
        )

    return {
        "cabinet": {"type": cabinet_type, "color": cabinet_color},
        "floor": {"color": floor_color},
    }


def is_countertop_exist(filename):
    if not os.path.exists(IMAGE_DIR + "/" + filename):
        return {"cabinet": {"type": None, "color": None}, "floor": {"color": None}}

    image_bgr = cv2.imread(IMAGE_DIR + "/" + filename)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    main_countertop_masks, sub_countertop_masks = image_to_masks(
        image_rgb, countertop_model, predictor
    )

    combined_mask1, combined_mask2 = None, None

    if main_countertop_masks:
        combined_mask1 = np.zeros_like(main_countertop_masks[0])
        for mask in main_countertop_masks:
            combined_mask1 |= mask

    if sub_countertop_masks:
        combined_mask2 = np.zeros_like(sub_countertop_masks[0])
        for mask in sub_countertop_masks:
            combined_mask2 |= mask

    mask_to_save = combined_mask1
    if combined_mask1 is not None and combined_mask2 is not None:
        mask_to_save |= combined_mask2
    elif combined_mask2 is not None:
        mask_to_save = combined_mask2

    return mask_to_save is not None


@app.route("/generate_image", methods=["POST"])
def generate_image():
    prompt = request.json.get("prompt")
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    try:
        while True:
            response = client.images.generate(
                model="dall-e-3",
                prompt="A high-angle realistic photo of a kitchen, showing kitchen countertop, cabinets, and floor. Ensure that the floor and countertop is clearly visible. The kitchen should feature "
                + prompt,
                n=1,
                size="1024x1024",
                response_format="b64_json",
            )
            images = response.data
            b64 = images[0].b64_json
            filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}.jpg"
            image_path = f"{IMAGE_DIR}/{filename}"
            with open(image_path, "wb") as f:
                f.write(base64.b64decode(b64))

            features = extract_features(image_path.split("/")[-1])
            is_countertop_exist = is_countertop_exist(image_path.split("/")[-1])
            if (
                features["cabinet"]["color"]
                and features["floor"]["color"]
                and features["cabinet"]["type"]
                and is_countertop_exist
            ):
                break
            else:
                os.remove(image_path)

        return jsonify({"filename": filename, "features": features})

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500


@app.route("/upload_image", methods=["POST"])
def upload_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]
    extension = file.filename.split(".")[-1]
    filename = f"{datetime.now().strftime('%Y%m%d%H%M%S')}.{extension}"
    image_path = f"{IMAGE_DIR}/{filename}"
    file.save(image_path)

    features = extract_features(image_path.split("/")[-1])
    if (
        features["cabinet"]["color"]
        and features["floor"]["color"]
        and features["cabinet"]["type"]
    ):
        return jsonify({"filename": filename, "features": features})
    else:
        os.remove(image_path)
        return (
            jsonify({"error": "No countertop or cabinet is detected in this image."}),
            400,
        )


@app.route("/recommendation", methods=["POST"])
def recommendation():
    features = request.json.get("features")
    filename = request.json.get("filename")
    image_path = f"./images/{filename}"
    print(image_path)

    if not os.path.exists(image_path):
        return jsonify({"error": "Image not found"}), 400

    cabinet_color = features["cabinet"]["color"]
    cabinet_type = features["cabinet"]["type"]
    floor_color = features["floor"]["color"]
    image_bgr = cv2.imread(image_path)
    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)

    # TODO: 원하는 추천 방식에 따라 아래 코드를 수정 (top_n 값 변경, 원치 않는 추천 방식 제거)
    trendDict = {}
    trendDict["1year"] = find_trending_color_pattern(
        trendingCountsOne, cabinet_type, cabinet_color, floor_color, top_n=1
    )
    trendDict["3year"] = find_trending_color_pattern(
        trendingCountsThree, cabinet_type, cabinet_color, floor_color, top_n=1
    )
    trendDict["Total"] = find_trending_color_pattern(
        trendingCountsTotal, cabinet_type, cabinet_color, floor_color, top_n=1
    )

    genereated_slab = 0

    # TODO: generate tiles
    for i, (period, trendList) in enumerate(trendDict.items()):
        for j, (color_pattern, _) in enumerate(trendList):
            color, pattern = color_pattern.split("-")[0], color_pattern.split("-")[1]

            if not os.path.exists(f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}"):
                color_matching_dirs = os.listdir(COUNTERTOP_SLAB_TAGED)
                color_matching_dirs = [d for d in color_matching_dirs if color in d]
                pattern_matching_dirs = os.listdir(COUNTERTOP_SLAB_TAGED)
                pattern_matching_dirs = [
                    d for d in pattern_matching_dirs if pattern in d
                ]
                tile1_dir = random.choice(color_matching_dirs)
                tile2_dir = random.choice(pattern_matching_dirs)
                tile1_path = random.choice(
                    os.listdir(f"{COUNTERTOP_SLAB_TAGED}/{tile1_dir}")
                )
                tile1_path = f"{COUNTERTOP_SLAB_TAGED}/{tile1_dir}/" + tile1_path
                tile2_path = random.choice(
                    os.listdir(f"{COUNTERTOP_SLAB_TAGED}/{tile2_dir}")
                )
                tile2_path = f"{COUNTERTOP_SLAB_TAGED}/{tile2_dir}/" + tile2_path
            else:
                matching_tiles = os.listdir(
                    f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}"
                )
                if len(matching_tiles) == 1:
                    tile1_path = matching_tiles[0]
                    tile1_path = (
                        f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}/" + tile1_path
                    )
                    color_matching_dirs = os.listdir(COUNTERTOP_SLAB_TAGED)
                    color_matching_dirs = [d for d in color_matching_dirs if color in d]
                    tile2_dir = random.choice(color_matching_dirs)
                    tile2_path = (
                        f"{COUNTERTOP_SLAB_TAGED}/{tile2_dir}/"
                        + random.choice(
                            os.listdir(f"{COUNTERTOP_SLAB_TAGED}/{tile2_dir}")
                        )
                    )
                else:
                    tile1_path, tile2_path = random.choices(matching_tiles, k=2)
                    tile1_path = (
                        f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}/" + tile1_path
                    )
                    tile2_path = (
                        f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}/" + tile2_path
                    )

            print(f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}/{tile1_path}")
            print(f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}/{tile2_path}")

            tile_img1 = (
                Image.open(
                    os.path.join(
                        f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}", tile1_path
                    )
                )
                .convert("RGB")
                .resize((768, 512))
            )
            tile_img2 = (
                Image.open(
                    os.path.join(
                        f"{COUNTERTOP_SLAB_TAGED}/{color}-{pattern}", tile2_path
                    )
                )
                .convert("RGB")
                .resize((768, 512))
            )

            images_texts = ["", tile_img1, tile_img2]
            random_weight = random.randint(0, 1)
            weights = [0, random_weight, 1 - random_weight]

            prior_out = slab_generation_pipe_prior.interpolate(images_texts, weights)

            slab_image = slab_generation_pipe(
                **prior_out, height=768, width=768
            ).images[0]
            slab_image.save(f"images/generated_slabs/{filename}_{i+j}.jpg")

            genereated_slab = i + j + 1
    #####

    # TODO: apply generated tile to kichen images

    main_countertop_masks, sub_countertop_masks = image_to_masks(
        image_rgb, countertop_model, predictor
    )

    combined_mask1, combined_mask2 = None, None

    if main_countertop_masks:
        combined_mask1 = np.zeros_like(main_countertop_masks[0])
        for mask in main_countertop_masks:
            combined_mask1 |= mask

    if sub_countertop_masks:
        combined_mask2 = np.zeros_like(sub_countertop_masks[0])
        for mask in sub_countertop_masks:
            combined_mask2 |= mask

    mask_to_save = combined_mask1
    if combined_mask1 is not None and combined_mask2 is not None:
        mask_to_save |= combined_mask2
    elif combined_mask2 is not None:
        mask_to_save = combined_mask2

    if mask_to_save is not None:
        image_path = IMAGE_DIR + "/" + filename
        mask_path = (
            IMAGE_DIR + "/generated_kitchen/mask_images/" + filename + "_masks.png"
        )

        cv2.imwrite(mask_path, mask_to_save)

        for i in range(genereated_slab):
            reference_path = IMAGE_DIR + f"/generated_slabs/{filename}_{i}.jpg"
            result_path = f"images/generated_kitchen/{filename}_{i}.png"
            pbe(image_path, mask_path, reference_path, result_path)

    else:
        return {"error": "No countertop is detected in this image."}, 400

    slabs = []
    for i, (period, trendList) in enumerate(trendDict.items()):
        for j, (color_pattern, _) in enumerate(trendList):
            color, pattern = color_pattern.split("-")[0], color_pattern.split("-")[1]

            slab = {}
            slab["color"] = color
            slab["pattern"] = pattern

            if period == "1year":
                slab["type"] = "최근 1년 트렌드 기반 추천"
            elif period == "3year":
                slab["type"] = "최근 3년 트렌드 기반 추천"
            else:
                slab["type"] = "전체 트렌드 기반 추천"

            slab["url"] = (IMAGE_DIR + f"/generated_slabs/{filename}_{i+j}.jpg",)
            slab["generated_kitchen_url"] = (
                IMAGE_DIR + f"/generated_kitchen/{filename}_{i+j}.png",
            )
            slabs.append(slab)

    return jsonify({"features": features, "filename": filename, "slabs": slabs})


@app.route("/analyze_image", methods=["POST"])
def analyze_image():
    if "file" not in request.files:
        return jsonify({"error": "No file part in the request"}), 400

    file = request.files["file"]

    if file.filename == "":
        return jsonify({"error": "No file selected for uploading"}), 400

    file_bytes = np.frombuffer(file.read(), np.uint8)
    image_bgr = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)

    if image_bgr is None:
        return jsonify({"error": "Invalid image format"}), 400

    image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
    image_pil = Image.fromarray(image_rgb)

    main_countertop_masks, sub_countertop_masks = image_to_masks(
        image_rgb, countertop_model, predictor
    )

    response_data = {}

    main = False
    sub = False

    if main_countertop_masks:
        combined_mask1 = np.zeros_like(main_countertop_masks[0])
        for mask in main_countertop_masks:
            combined_mask1 |= mask

        main_color, main_color_certainty = color_similarity(
            image_bgr,
            combined_mask1,
            countertop_tile_images,
            countertop_candidate_hists,
        )

        mask_pil = Image.fromarray(combined_mask1)
        masked_image = ImageChops.multiply(image_pil, mask_pil.convert("RGB"))
        main_pattern, main_pattern_certainty = predict_image_class(
            masked_image, combined_mask1, model, processor, labels
        )

        response_data["main_countertop"] = {
            "color": main_color,
            "pattern": main_pattern,
            "color_certainty": main_color_certainty,
            "pattern_certainty": main_pattern_certainty,
        }
        main = True

    if sub_countertop_masks:
        combined_mask2 = np.zeros_like(sub_countertop_masks[0])
        for mask in sub_countertop_masks:
            combined_mask2 |= mask

        sub_color, sub_color_certainty = color_similarity(
            image_bgr,
            combined_mask2,
            countertop_tile_images,
            countertop_candidate_hists,
        )

        mask_pil = Image.fromarray(combined_mask2)
        masked_image = ImageChops.multiply(image_pil, mask_pil.convert("RGB"))
        sub_pattern, sub_pattern_certainty = predict_image_class(
            masked_image, combined_mask2, model, processor, labels
        )

        response_data["sub_countertop"] = {
            "color": sub_color,
            "pattern": sub_pattern,
            "color_certainty": sub_color_certainty,
            "pattern_certainty": sub_pattern_certainty,
        }
        sub = True

    response = {
        "message": main
        and sub
        and "both"
        or main
        and "main"
        or sub
        and "sub"
        or "neither",
        "result": response_data,
    }

    return jsonify(response)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=7777, ssl_context=("cert.pem", "key.pem"))
