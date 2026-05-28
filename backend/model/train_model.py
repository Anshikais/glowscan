import os
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["OPENBLAS_NUM_THREADS"] = "1"
os.environ["MKL_NUM_THREADS"] = "1"
os.environ["NUMEXPR_NUM_THREADS"] = "1"
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
from torch.utils.data import DataLoader

# SETTINGS
BATCH_SIZE = 2
IMG_SIZE = 128
EPOCHS = 5

# IMAGE TRANSFORMS
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
])

# LOAD DATASETS
train_dataset = datasets.ImageFolder(
    r"D:\Desktop\Ai skin detect\dataset\train",
    transform=transform
)

test_dataset = datasets.ImageFolder(
     r"D:\Desktop\Ai skin detect\dataset\test",
    transform=transform
)

# DATALOADERS
train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

test_loader = DataLoader(
    test_dataset,
    batch_size=BATCH_SIZE,
    num_workers=0
)
# LOAD PRETRAINED MODEL
model = models.mobilenet_v2(pretrained=True)
# MODIFY OUTPUT LAYER
num_classes = len(train_dataset.classes)
model.classifier[1] = nn.Linear(
    model.last_channel,
    num_classes
)
# LOSS + OPTIMIZER
criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.001
)

# TRAIN MODEL
for epoch in range(EPOCHS):

    model.train()

    running_loss = 0.0

    for images, labels in train_loader:

        optimizer.zero_grad()

        outputs = model(images)

        loss = criterion(outputs, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

    print(
        f"Epoch [{epoch+1}/{EPOCHS}] Loss: {running_loss:.4f}"
    )

# SAVE MODEL
torch.save(
    model.state_dict(),
    "skin_model.pth"
)

print("Training complete! Model saved.")