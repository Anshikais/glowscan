import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image
import os

# CLASSES YOUR MODEL WAS TRAINED ON
classes = ['dry', 'oily']

# LOAD DEVICE
device = torch.device("cpu")

# LOAD MODEL ARCHITECTURE
model = models.mobilenet_v2(weights=None)

# MODIFY FINAL LAYER
model.classifier[1] = nn.Linear(
    model.last_channel,
    len(classes)
)

# MODEL PATH
model_path = os.path.join(
    os.path.dirname(__file__),
    "skin_model.pth"
)

# LOAD TRAINED WEIGHTS
if os.path.exists(model_path):

    model.load_state_dict(
        torch.load(
            model_path,
            map_location=device
        )
    )

    model.to(device)

    model.eval()

    print("AI skin model loaded successfully!")

else:

    print("skin_model.pth not found!")

# IMAGE PREPROCESSING
preprocess = transforms.Compose([
    transforms.Resize((96, 96)),
    transforms.ToTensor(),
])

# RECOMMENDATIONS
def get_recommendations(prediction: str):

    recommendations = {

        "dry":
            "Use a hydrating cleanser, ceramide moisturizer, and Hyaluronic Acid serum.",

        "oily":
            "Use oil-free moisturizer, salicylic acid cleanser, and lightweight gel skincare.",
    }

    return recommendations.get(
        prediction.lower(),
        "Maintain a balanced skincare routine."
    )

# DETAILED SKINCARE DATA
def get_detailed_skincare_data(prediction: str):

    data = {

        "dry": {

            "tips":
                "Focus on hydration and repairing the skin barrier.",

            "home_remedies": [

                {
                    "title":
                        "Honey Mask",

                    "description":
                        "Apply raw honey for 10 minutes to lock moisture."
                },

                {
                    "title":
                        "Aloe Vera",

                    "description":
                        "Use pure aloe vera gel for soothing hydration."
                }
            ]
        },

        "oily": {

            "tips":
                "Control excess sebum while maintaining hydration.",

            "home_remedies": [

                {
                    "title":
                        "Clay Mask",

                    "description":
                        "Use bentonite clay once a week to absorb oil."
                },

                {
                    "title":
                        "Green Tea Toner",

                    "description":
                        "Apply chilled green tea to reduce oiliness."
                }
            ]
        }
    }

    return data.get(
        prediction.lower(),
        {}
    )

# REAL AI PREDICTION
def analyze_skin_image(image_path: str):

    try:

        # LOAD IMAGE
        image = Image.open(
            image_path
        ).convert("RGB")

        # PREPROCESS
        image_tensor = preprocess(image)

        image_tensor = image_tensor.unsqueeze(0)

        image_tensor = image_tensor.to(device)

        # PREDICT
        with torch.no_grad():
            outputs = model(image_tensor)

            probabilities = torch.softmax(
                outputs,
                dim=1
            )

            confidence, predicted = torch.max(
                probabilities,
                1
            )

        prediction = classes[
            predicted.item()
        ]

        confidence_score = round(
            confidence.item(),
            2
        )

        return (
            prediction.capitalize(),
            confidence_score
        )

    except Exception as e:
        print(
            f"Error analyzing image: {e}"
        )
        return (
            "Dry",
            0.50
        )