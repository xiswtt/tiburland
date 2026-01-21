// ========== ДИНАМИЧЕСКАЯ ЗАГРУЗКА ПЕРСОНАЖА ==========

document.addEventListener('DOMContentLoaded', function() {
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
        
        // Загружаем данные персонажа
        const response = await fetch(`/api/characters/${characterId}`);
        const character = await response.json();
        
        if (!character) {
            showErrorMessage('Персонаж не найден');
            return;
        }
        
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
    // 1. Обновляем title
    document.title = `${character.name} - Тибурляндия`;
    
    // 2. Обновляем превью
    const previewSection = document.getElementById('character-preview');
    previewSection.innerHTML = `
        <div class="blur-overlay-char">
            <h1 class="main-title">${character.name}</h1>
            <p class="preview-text">${character.description}</p>
            <button class="link-to-section">
                <a href="#desc">К описанию</a>
            </button>
        </div>
    `;
    
    // 3. Обновляем референс
    const refImg = document.getElementById('character-ref-img');
    refImg.src = character.reference;
    refImg.alt = character.name;
    // if (!refImg) {
    //     refImg.style.display = "none";
    //     const noRef = document.getElementById('no-ref');
    //     noRef.style.display = "block";
    // };
    
    // 4. Обновляем категорию
    const categoryDiv = document.getElementById('character-category');
    const iconFile = getIconForCategory(character.category);
    categoryDiv.innerHTML = `<img src="img/${iconFile}" alt="${character.category}" />`;
    
    // 5. Обновляем данные персонажа
    const dataList = document.querySelector('#character-data ul');
    dataList.innerHTML = `
        <li>Пол: ${character.gender || 'не указан'}</li>
        <li>Возраст: ${character.age || 'не указан'}</li>
        <li>Автор: ${character.author}</li>
        <li>Категория: ${character.category}</li>
        <li>Создан: ${character.created || 'не указано'}</li>
    `;
    
    // 6. Обновляем лор
    const loreSection = document.getElementById('character-lore');
    loreSection.innerHTML = `
        <h2>Лор</h2>
        <p>${character.lore || character.description}</p>
    `;
}

function getIconForCategory(category) {
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
    
    // Используем специальное превью если есть, иначе обычное фото
    const previewImage = character.preview || character.image;
    
    previewSection.style.backgroundImage = `url(${previewImage})`;
    previewSection.style.backgroundSize = 'cover';
    previewSection.style.backgroundPosition = 'center';
    previewSection.style.backgroundRepeat = 'no-repeat';
}

async function loadCharacterGallery(character) {
    const galleryContainer = document.getElementById('gallery-container');
    
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
    
    // Отображаем галерею
    galleryContainer.innerHTML = character.gallery.map(imgUrl => `
        <div class="gallery-item" data-src="${imgUrl}">
            <img 
                src="${imgUrl}" 
                alt="${character.name}" 
                loading="lazy"
                onerror="this.style.display='none'; console.log('Ошибка загрузки: ${imgUrl}')"
            />
        </div>
    `).join('');
    
    // Добавляем обработчики кликов для увеличения
    addGalleryZoom();
}

// Сообщение если галереи нет
function showNoGalleryMessage() {
    const galleryContainer = document.getElementById('gallery-container');
    galleryContainer.innerHTML = `
        <div class="no-gallery-message">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="#79C9C5">
                <path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4.86 8.86l-3 3.87L9 13.14 6 17h12l-3.86-5.14z"/>
            </svg>
            <h3>Галерея в разработке</h3>
            <p>Для этого персонажа пока нет дополнительных изображений</p>
        </div>
    `;
}

// Обработчик ошибок загрузки изображений
function handleImageError(imgElement) {
    console.log('Ошибка загрузки изображения:', imgElement.src);
    imgElement.style.display = 'none';
    
    // Показываем заглушку
    const container = imgElement.parentElement;
    if (!container.querySelector('.image-error')) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'image-error';
        errorDiv.innerHTML = `
            <svg width="48" height="48" viewBox="0 0 24 24" fill="#E5513D">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>Изображение не найдено</p>
        `;
        errorDiv.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #E5513D;
            text-align: center;
            padding: 20px;
        `;
        container.appendChild(errorDiv);
    }
}

// Функция для увеличения изображений галереи
function addGalleryZoom(galleryItems = null) {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    
    // Создаем модальное окно
    const modal = document.createElement('div');
    modal.className = 'gallery-modal';
    modal.innerHTML = `
        <span class="gallery-modal-close">&times;</span>
        <div class="gallery-modal-nav">
            <button class="gallery-prev">‹</button>
            <button class="gallery-next">›</button>
        </div>
        <div class="gallery-modal-content">
            <img src="" alt="">
            <div class="gallery-modal-info">
                <h3></h3>
                <p></p>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    const modalImg = modal.querySelector('img');
    const modalTitle = modal.querySelector('h3');
    const modalDesc = modal.querySelector('p');
    const closeBtn = modal.querySelector('.gallery-modal-close');
    const prevBtn = modal.querySelector('.gallery-prev');
    const nextBtn = modal.querySelector('.gallery-next');
    
    let currentIndex = 0;
    const imagesArray = Array.from(galleryImages);
    
    // Открытие модального окна
    galleryImages.forEach((img, index) => {
        img.addEventListener('click', function() {
            currentIndex = index;
            updateModal();
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Обновление модального окна
    function updateModal() {
        const currentImg = imagesArray[currentIndex];
        modalImg.src = currentImg.src;
        modalImg.alt = currentImg.alt;
        
        // Если есть информация о галерее
        if (galleryItems && galleryItems[currentIndex]) {
            const item = galleryItems[currentIndex];
            modalTitle.textContent = item.title || '';
            modalDesc.textContent = item.description || '';
        } else {
            modalTitle.textContent = '';
            modalDesc.textContent = '';
        }
        
        // Обновляем состояние кнопок навигации
        prevBtn.style.display = currentIndex > 0 ? 'block' : 'none';
        nextBtn.style.display = currentIndex < imagesArray.length - 1 ? 'block' : 'none';
    }
    
    // Навигация
    prevBtn.addEventListener('click', function() {
        if (currentIndex > 0) {
            currentIndex--;
            updateModal();
        }
    });
    
    nextBtn.addEventListener('click', function() {
        if (currentIndex < imagesArray.length - 1) {
            currentIndex++;
            updateModal();
        }
    });
    
    // Закрытие
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Навигация клавишами
    document.addEventListener('keydown', function(e) {
        if (modal.style.display !== 'flex') return;
        
        switch(e.key) {
            case 'Escape':
                closeModal();
                break;
            case 'ArrowLeft':
                if (currentIndex > 0) {
                    currentIndex--;
                    updateModal();
                }
                break;
            case 'ArrowRight':
                if (currentIndex < imagesArray.length - 1) {
                    currentIndex++;
                    updateModal();
                }
                break;
        }
    });
    
    function closeModal() {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}


function showErrorMessage(message) {
    const mainContent = document.querySelector('main');
    mainContent.innerHTML = `
        <section class="error-section" style="min-height: 80vh; display: flex; justify-content: center; align-items: center;">
            <div style="text-align: center;">
                <h2>Ошибка</h2>
                <p>${message}</p>
                <button class="link-to-section" onclick="window.location.href='index.html'">
                    <a href="index.html">На главную</a>
                </button>
            </div>
        </section>
    `;
}