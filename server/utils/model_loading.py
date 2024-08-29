from ultralytics import YOLO
from segment_anything import sam_model_registry, SamPredictor
from transformers import AutoFeatureExtractor, AutoModelForImageClassification, pipeline

from .config import (
    device,
    pattern_model_config,
    segmentation_model_config,
    cabinet_classifier_config,
)
from diffusers import KandinskyV22PriorPipeline, KandinskyV22Pipeline
import torch

countertop_model = YOLO(segmentation_model_config["countertop"])
cabinet_model = YOLO(segmentation_model_config["cabinet"])
floor_model = YOLO(segmentation_model_config["floor"])

cabinet_classifier = pipeline(
    "image-classification",
    model=cabinet_classifier_config["model"],
    feature_extractor=cabinet_classifier_config["model"],
)

sam = sam_model_registry[segmentation_model_config["sam"]["MODEL_NAME"]](
    segmentation_model_config["sam"]["MODEL_CKPT"]
)
sam.to(device)
predictor = SamPredictor(sam)

model = AutoModelForImageClassification.from_pretrained(
    pattern_model_config["MODEL_CKPT"]
)
processor = AutoFeatureExtractor.from_pretrained(pattern_model_config["MODEL_CKPT"])
labels = pattern_model_config["LABELS"]


slab_generation_pipe_prior = KandinskyV22PriorPipeline.from_pretrained(
    "kandinsky-community/kandinsky-2-2-prior", torch_dtype=torch.float16
)
slab_generation_pipe_prior.to("cuda")
slab_generation_pipe = KandinskyV22Pipeline.from_pretrained(
    "kandinsky-community/kandinsky-2-2-decoder", torch_dtype=torch.float16
)
slab_generation_pipe.to("cuda")
