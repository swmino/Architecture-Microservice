import os
import requests
from bs4 import BeautifulSoup

def extract_image_urls_from_html(html_file):
    with open(html_file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    soup = BeautifulSoup(html_content, 'html.parser')

    # Trouver tous les liens d'images dans le fichier HTML
    image_links = []
    for img_tag in soup.find_all('img'):
        src = img_tag.get('src')
        if src:
            image_links.append(src)

    return image_links

def download_images(image_urls, output_dir, num_images=10):
    # Créer le dossier pour stocker les images s'il n'existe pas
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Télécharger et enregistrer chaque image
    for i, url in enumerate(image_urls[:num_images], start=1):
        response = requests.get(url)
        if response.status_code == 200:
            with open(os.path.join(output_dir, f"image_{i}.jpg"), 'wb') as f:
                f.write(response.content)
            print(f"Image {i}/{min(num_images, len(image_urls))} téléchargée avec succès.")

# Chemin vers le fichier HTML contenant les liens des images
html_file_path = 'output_exo5.html'

# Extraire les URLs des images du fichier HTML
image_urls = extract_image_urls_from_html(html_file_path)

# Dossier où les images seront enregistrées
output_directory = 'images'

# Télécharger les 10 premières images dans le dossier spécifié
download_images(image_urls, output_directory, num_images=10)
