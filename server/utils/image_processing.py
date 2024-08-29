import cv2, math
import numpy as np
import random

def scale_points_by_ratio(bbox_area, mask_area):
    mask_ratio = mask_area / bbox_area if bbox_area != 0 else 0
    num_points = 7 - math.floor(5 * mask_ratio)
    return max(num_points, 0) if bbox_area != 0 else 0

def image_to_masks(image_rgb, countertop_model, predictor):
    countertop_objects = countertop_model.predict(image_rgb, conf=0.6)
    predictor.set_image(image_rgb)

    main_countertop_masks = []
    sub_countertop_masks = []

    for cti, ct in enumerate(countertop_objects[0]):
        class_name = ct.names[ct.boxes.cls.tolist().pop()]
        input_box = np.array(ct.boxes.xyxy.tolist())
    
        b_mask = np.zeros(image_rgb.shape[:2], np.uint8)
        contour = ct.masks.xy.pop().astype(np.int32).reshape(-1,1,2)

        if contour is None or contour.shape[0] == 0:
            continue 

        cv2.drawContours(b_mask, [contour], -1, (255,255,255), cv2.FILLED)
        mask_area = np.count_nonzero(b_mask)
    
        x1, y1, x2, y2 = ct.boxes.xyxy.cpu().numpy().squeeze().astype(np.int32)
        bbox_mask = np.zeros_like(b_mask)
        bbox_mask[y1:y2, x1:x2] = 1
    
        non_segmented_mask = bbox_mask & (b_mask == 0)
        non_segmented_points = np.column_stack(np.where(non_segmented_mask))
        num_points = min(scale_points_by_ratio((x2 - x1) * (y2 - y1), mask_area), len(non_segmented_points))
        selected_points = non_segmented_points[random.sample(range(len(non_segmented_points)), num_points)]
        exclusion_labels = np.zeros(num_points, dtype=int)

        masks, _, _ = predictor.predict(
            point_coords=selected_points[:, [1, 0]],
            point_labels=exclusion_labels,
            box=input_box[None, :],
            multimask_output=False
        ) 

        mask = masks[0].astype(np.uint8) * 255

        if class_name == 'main-countertop':
            main_countertop_masks.append(mask)
        else:
            sub_countertop_masks.append(mask)
    
    return main_countertop_masks, sub_countertop_masks
