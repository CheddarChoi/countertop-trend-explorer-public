import torch
from firebase_admin import credentials

BASE_PATH = "/hdd/lx"
OPENAI_SETTINGS = {
    "organization": "org_xx",
    "project": "proj_xx",
    "api_key": "sk-proj-xx",
}

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODE_PATH = BASE_PATH + "/models"

segmentation_model_config = {
    "sam": {"MODEL_NAME": "vit_h", "MODEL_CKPT": f"{MODE_PATH}/sam_vit_h_4b8939.pth"},
    "countertop": f"{MODE_PATH}/countertop_model.pt",
    "cabinet": f"{MODE_PATH}/cabinet_model.pt",
    "floor": f"{MODE_PATH}/floor_model.pt",
}

pattern_model_config = {
    "MODEL_CKPT": f"{MODE_PATH}/segment_pattern_detection_model_0522",
    "LABELS": [
        "Calacatta",
        "Concrete",
        "Granular",
        "LargeMovement",
        "LongVein",
        "Quartzite",
        "ShortVein",
        "Solid",
        "Wave",
    ],
}

cred = credentials.Certificate(
    BASE_PATH + "/countertop-trend-explorer-firebase-adminsdk-omvop-9f8d32aa99.json"
)

cabinet_classifier_config = {"model": f"{MODE_PATH}/vit_cabinet"}
