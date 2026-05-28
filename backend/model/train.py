import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
import os

def train_model(data_dir='../dataset/train', num_epochs=10, batch_size=32):
    """
    Placement Project Stub for training the CNN Model.
    Requires an image dataset directory structured generically like:
    dataset/
        train/
            Acne/
            Dry/
            Normal/
            Oily/
    """
    if not os.path.exists(data_dir):
        print(f"Directory {data_dir} not found. Please place dataset in '{data_dir}' to train.")
        return

    # Data Augmentation & Normalization
    data_transforms = transforms.Compose([
        transforms.RandomResizedCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    image_dataset = datasets.ImageFolder(data_dir, data_transforms)
    dataloader = torch.utils.data.DataLoader(image_dataset, batch_size=batch_size, shuffle=True)
    class_names = image_dataset.classes
    print(f"Classes found: {class_names}")

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    print(f"Training on device: {device}")

    # Transfer Learning with MobileNetV2
    model = models.mobilenet_v2(pretrained=True)
    # Freeze lower layers for fast training
    for param in model.parameters():
        param.requires_grad = False
    
    # Replace classifier
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.classifier[1].parameters(), lr=0.001)

    # Simple training loop for showcase
    for epoch in range(num_epochs):
        print(f'Epoch {epoch}/{num_epochs - 1}')
        print('-' * 10)
        
        model.train()
        running_loss = 0.0
        running_corrects = 0

        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()
            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(image_dataset)
        epoch_acc = running_corrects.double() / len(image_dataset)
        print(f'Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # Save model
    save_path = os.path.join(os.path.dirname(__file__), 'skin_model.pth')
    torch.save(model, save_path)
    print(f"Training complete. Model saved to {save_path}")

if __name__ == '__main__':
    # Uncomment next line to run training if dataset is available
    # train_model()
    print("Training script ready. Prepare standard ImageFolder dataset to run.")
