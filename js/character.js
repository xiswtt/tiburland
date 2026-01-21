// ========== ДИНАМИЧЕСКАЯ ЗАГРУЗКА ПЕРСОНАЖА ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('character.js загружен');
    loadCharacterData();
});

async function loadCharacterData() {
    try {
        // Получаем ID персонажа из URL
        const urlParams = new URLSearchParams(window.location.search);
        const characterId = urlParams.get('id');
        
        if (!characterId) {
            console.error('ID персонажа не указан в URL');
            showErrorMessage('Персонаж не найден');
            return;
        }
        
        console.log('Ищем персонажа с ID:', characterId);
        
        // Загружаем ВСЕХ персонажей из JSON
        const response = await fetch('data/characters.json');
        
        if (!response.ok) {
            throw new Error(`Ошибка загрузки файла: ${response.status}`);
        }
        
        const data = await response.json();
        const allCharacters = data.characters || [];
        
        console.log('Всего персонажей загружено:', allCharacters.length);
        
        // Ищем нужного персонажа
        const character = allCharacters.find(char => char.id === parseInt(characterId));
        
        if (!character) {
            console.error('Персонаж с ID', characterId, 'не найден');
            showErrorMessage('Персонаж не найден');
            return;
        }
        
        console.log('Найден персонаж:', character.name);
        console.log('Данные персонажа:', character);
        
        // Обновляем страницу с данными персонажа
        updatePageWithCharacterData(character);
        
        // Загружаем галерею (если есть дополнительные изображения)
        loadCharacterGallery(character);
        
        // Устанавливаем фон для превью
        updatePreviewBackground(character);
        
    } catch (error) {
        console.error('Ошибка загрузки данных персонажа:', error);
        showErrorMessage('Произошла ошибка при загрузке данных');
    }
}

function updatePageWithCharacterData(character) {
    console.log('Обновляем страницу для персонажа:', character.name);
    
    // 1. Обновляем title
    document.title = `${character.name} - Тибурляндия`;
    
    // 2. Обновляем превью
    const previewSection = document.getElementById('character-preview');
    if (previewSection) {
        previewSection.innerHTML = `
            <div class="blur-overlay-char">
                <h1 class="main-title">${character.name}</h1>
                <p class="preview-text">${character.description || 'Нет описания'}</p>
                <button class="link-to-section">
                    <a href="#desc">К описанию</a>
                </button>
            </div>
        `;
    }
    
    // 3. Обновляем референс
    const refImg = document.getElementById('character-ref-img');
    if (refImg && character.reference) {
        refImg.src = character.reference;
        refImg.alt = character.name;
        refImg.onerror = function() {
            console.log('Ошибка загрузки референса:', this.src);
            this.style.display = 'none';
        };
    }
    
    // 4. Обновляем категорию
    const categoryDiv = document.getElementById('character-category');
    if (categoryDiv) {
        const iconFile = getIconForCategory(character.category);
        categoryDiv.innerHTML = `<img src="img/${iconFile}" alt="${character.category}" />`;
    }
    
    // 5. Обновляем данные персонажа
    const dataList = document.querySelector('#character-data ul');
    if (dataList) {
        dataList.innerHTML = `
            <li>Пол: ${character.gender || 'не указан'}</li>
            <li>Возраст: ${character.age || 'не указан'}</li>
            <li>Автор: ${character.author || 'не указан'}</li>
            <li>Категория: ${character.category || 'не указана'}</li>
            <li>Создан: ${character.created || 'не указано'}</li>
        `;
    }
    
    // 6. Обновляем лор
    const loreSection = document.getElementById('character-lore');
    if (loreSection) {
        loreSection.innerHTML = `
            <h2>Лор</h2>
            <p>${character.lore || character.description || 'Лор не добавлен'}</p>
        `;
    }
    
    // 7. Обновляем изображение персонажа
    const charImage = document.getElementById('character-image');
    if (charImage && character.image) {
        charImage.src = character.image;
        charImage.alt = character.name;
        charImage.onerror = function() {
            console.log('Ошибка загрузки основного изображения:', this.src);
            this.src = 'https://via.placeholder.com/400x500/3F9AAE/FFFFFF?text=Изображение+не+найдено';
        };
    }
}

function getIconForCategory(category) {
    if (!category) return 'shark-icon.svg';
    
    const icons = {
        'shark': 'shark-icon.svg',
        'axolotl': 'axolotl-icon.svg',
        'seacat': 'seaCat-icon.svg',
        'fish': 'fish-icon.svg'
    };
    return icons[category.toLowerCase()] || 'shark-icon.svg';
}

function updatePreviewBackground(character) {
    const previewSection = document.querySelector('.preview-character');
    
    if (!previewSection) return;
    
    // Используем специальное превью если есть, иначе обычное фото
    const previewImage = character.preview || character.image;
    
    if (previewImage) {
        previewSection.style.backgroundImage = `url(${previewImage})`;
        previewSection.style.backgroundSize = 'cover';
        previewSection.style.backgroundPosition = 'center';
        previewSection.style.backgroundRepeat = 'no-repeat';
        
        // Проверяем загрузку фона
        const testImg = new Image();
        testImg.onload = function() {
            console.log('Фон успешно загружен:', previewImage);
        };
        testImg.onerror = function() {
            console.log('Ошибка загрузки фона:', previewImage);
            previewSection.style.backgroundImage = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        };
        testImg.src = previewImage;
    }
}

async function loadCharacterGallery(character) {
    const galleryContainer = document.getElementById('gallery-container');
    
    if (!galleryContainer) {
        console.log('Контейнер галереи не найден');
        return;
    }
    
    // Проверяем, есть ли галерея
    if (!character.gallery || character.gallery.length === 0) {
        galleryContainer.innerHTML = `
            <div class="no-gallery">
                <p style="font: var(--regular-text);">Галерея для этого персонажа пока пуста</p>
                <p style="font: var(--regular-text); color: #666; margin-top: 10px;">
                    Следите за обновлениями!
                </p>
            </div>
        `;
        return;
    }
    
    console.log('Загружаем галерею из', character.gallery.length, 'изображений');
    
    // Отображаем галерею
    galleryContainer.innerHTML = character.gallery.map((imgUrl, index) => `
        <div class="gallery-item" data-index="${index}">
            <img 
                src="${imgUrl}" 
                alt="${character.name} - изображение ${index + 1}" 
                loading="lazy"
                onerror="console.log('Ошибка загрузки галереи: ${imgUrl}'); this.parentElement.innerHTML = '<div style=\'padding:20px;text-align:center;color:#999;\'>Ошибка загрузки</div>'"
            />
        </div>
    `).join('');
    
    // Добавляем обработчики кликов для увеличения
    addGalleryZoom();
}

// Функция для увеличения изображений галереи
function addGalleryZoom() {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    if (galleryImages.length === 0) return;
    
    console.log('Добавляем зум для', galleryImages.length, 'изображений');
    
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            console.log('Клик по изображению', index);
            // Здесь можно добавить модальное окно для увеличения
            // Пока просто открываем в новой вкладке
            window.open(this.src, '_blank');
        });
    });
}

function showErrorMessage(message) {
    console.error('Показываем ошибку:', message);
    
    const mainContent = document.querySelector('main');
    if (!mainContent) return;
    
    mainContent.innerHTML = `
        <section class="error-section" style="min-height: 80vh; display: flex; justify-content: center; align-items: center;">
            <div style="text-align: center; padding: 40px; max-width: 600px;">
                <h2 style="color: #E5513D; margin-bottom: 20px;">Ошибка</h2>
                <p style="font-size: 18px; margin-bottom: 30px;">${message}</p>
                <button class="link-to-section" onclick="window.location.href='index.html'" 
                        style="background: #3F9AAE; color: white; border: none; padding: 12px 24px; 
                               border-radius: 8px; cursor: pointer; font-size: 16px;">
                    <a href="index.html" style="color: white; text-decoration: none;">На главную</a>
                </button>
            </div>
        </section>
    `;
}