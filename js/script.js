// ========== НАВИГАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен!');
    
    // Инициализируем навигацию
    initHeaderNavigation();
    
    // Инициализируем персонажей только на главной странице
    const currentPage = window.location.pathname;
    const isHomePage = currentPage === '/' || 
                      currentPage.endsWith('index.html') || 
                      currentPage.endsWith('/');
    
    if (isHomePage && typeof initCharacters === 'function') {
        console.log('Это главная страница, инициализируем персонажей...');
        // Даем время отрисоваться
        setTimeout(initCharacters, 200);
    }
});

function initHeaderNavigation() {
    const header = document.querySelector('.header');
    const logo = document.querySelector('.header-logo img');
    
    if (!header || !logo) {
        console.log('Элементы навигации не найдены (возможно не на главной)');
        return;
    }
    
    // Поиск секции превью - пробуем разные селекторы
    const previewSection = document.querySelector('.preview') || 
                          document.querySelector('#preview-character') ||
                          document.querySelector('.preview-character') ||
                          document.querySelector('.preview-section') ||
                          document.querySelector('section:first-of-type');
    
    if (!previewSection) {
        console.error('Не найдена секция превью');
        return;
    }
    
    console.log('Найдена секция превью:', previewSection);

    // ссылка для логотипа (если еще не создана)
    if (!logo.parentNode.matches('a')) {
        const logoLink = document.createElement('a');
        logoLink.href = '#';
        logoLink.style.display = 'block';
        logoLink.style.cursor = 'pointer';
        
        // Сохраняем родительский элемент
        const parent = logo.parentNode;
        parent.insertBefore(logoLink, logo);
        logoLink.appendChild(logo);
        
        logoLink.addEventListener('click', function(e) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // изменение хедера при скролле
    function updateHeader() {
        const scrollPosition = window.scrollY || window.pageYOffset;
        const sectionHeight = previewSection.offsetHeight;
        
        if (scrollPosition > sectionHeight / 2) {
            logo.style.transform = 'scale(0.7)';
            logo.style.transition = 'transform 0.3s ease';
            header.style.padding = '3px 139px';
            header.style.transition = 'padding 0.3s ease';
        } else {
            logo.style.transform = 'scale(1.0)';
            logo.style.transition = 'transform 0.3s ease';
            header.style.padding = '23px 139px';
            header.style.transition = 'padding 0.3s ease';
        }
    }
    
    // Инициализируем при загрузке
    updateHeader();
    
    // Обновляем при скролле
    window.addEventListener('scroll', updateHeader);
    
    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateHeader);
}

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
const CARDS_PER_ROW = 3;
let charCurrentRow = 1;
let charTotalRows = 1;
let charIsLoading = false; 
let charCurrentFilter = null;
let allCharacters = [];
let filteredCharacters = [];


function createCharacterCard(character) {
    return `
        <div class="card-item" data-category="${character.category}">
            <img src="${character.image}" alt="${character.name}" />
            
            <div class="card-text">
                <h3>${character.name}</h3>
                <small>Создатель: ${character.author}</small>
                <p>${character.description ? character.description.substring(0, 100) + (character.description.length > 100 ? '...' : '') : 'Нет описания'}</p>
                
                <div class="character-link">
                    <a href="character-page.html?id=${character.id}">Подробнее</a>
                    <svg width="21" height="15" viewBox="0 0 21 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20.7071 8.07106C21.0976 7.68054 21.0976 7.04737 20.7071 6.65685L14.3431 0.292885C13.9526 -0.0976396 13.3195 -0.0976396 12.9289 0.292885C12.5384 0.683409 12.5384 1.31657 12.9289 1.7071L18.5858 7.36395L12.9289 13.0208C12.5384 13.4113 12.5384 14.0445 12.9289 14.435C13.3195 14.8255 13.9526 14.8255 14.3431 14.435L20.7071 8.07106ZM0 7.36395V8.36395H20V7.36395V6.36395H0V7.36395Z" 
                              fill="#3F9AAE"/>
                    </svg>
                </div>
            </div>
        </div>
    `;
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

async function loadAllCharacters() {
    try {
        console.log('=== НАЧИНАЕМ ЗАГРУЗКУ ПЕРСОНАЖЕЙ ===');
        
        // Пробуем загрузить файл
        const response = await fetch('data/characters.json');
        console.log('Статус ответа:', response.status, response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const text = await response.text();
        console.log('Получен текст, длина:', text.length, 'символов');
        console.log('Первые 200 символов:', text.substring(0, 200));
        
        // Парсим JSON
        const data = JSON.parse(text);
        console.log('JSON успешно распарсен');
        console.log('Ключи в данных:', Object.keys(data));
        
        // Извлекаем персонажей
        allCharacters = data.characters || [];
        console.log('Загружено персонажей:', allCharacters.length);
        
        // Проверяем первого персонажа
        if (allCharacters.length > 0) {
            console.log('Первый персонаж:', allCharacters[0].name);
            console.log('Его image URL:', allCharacters[0].image);
        }
        
        filteredCharacters = [...allCharacters];
        
        return allCharacters;
    } catch (error) {
        console.error('ОШИБКА загрузки персонажей:', error);
        console.error('Стек ошибки:', error.stack);
        
        allCharacters = [];
        filteredCharacters = [];
        return [];
    }
}

function displayCharacters(resetPagination = true) {
    console.log('=== ОТОБРАЖЕНИЕ ПЕРСОНАЖЕЙ ===');
    console.log('filteredCharacters.length:', filteredCharacters.length);
    
    const container = document.getElementById('characters-container');
    if (!container) {
        console.error('Контейнер персонажей не найден!');
        return;
    }
    
    container.innerHTML = '';
    
    if (resetPagination) {
        charCurrentRow = 1;
    }
    
    if (filteredCharacters.length === 0) {
        container.innerHTML = `
            <div class="character-row" id="row-1">
                <div style="width: 100%; text-align: center; padding: 50px; color: #666;">
                    ❌ Персонажи не загружены или пустые
                </div>
            </div>
        `;
        document.getElementById('more-btn').style.display = 'none';
        return;
    }
    
    const rows = [];
    for (let i = 0; i < filteredCharacters.length; i += CARDS_PER_ROW) {
        rows.push(filteredCharacters.slice(i, i + CARDS_PER_ROW));
    }
    
    charTotalRows = rows.length;
    console.log('Создано рядов:', charTotalRows);
    
    for (let i = 0; i < Math.min(charCurrentRow, rows.length); i++) {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'character-row';
        rowContainer.id = `row-${i + 1}`;
        
        const rowCharacters = rows[i];
        console.log(`Ряд ${i + 1}: ${rowCharacters.length} персонажей`);
        
        rowContainer.innerHTML = rowCharacters.map(createCharacterCard).join('');
        container.appendChild(rowContainer);
    }
    
    const moreBtn = document.getElementById('more-btn');
    if (moreBtn) {
        moreBtn.style.display = charCurrentRow < charTotalRows ? 'block' : 'none';
        console.log('Кнопка "Показать ещё":', moreBtn.style.display);
    }
    
    console.log('=== ОТОБРАЖЕНИЕ ЗАВЕРШЕНО ===');
}

function showNextRow() {
    if (charCurrentRow >= charTotalRows || charIsLoading) return;
    
    charIsLoading = true;
    const container = document.getElementById('characters-container');
    const startIndex = charCurrentRow * CARDS_PER_ROW;
    const endIndex = Math.min(startIndex + CARDS_PER_ROW, filteredCharacters.length);
    const rowCharacters = filteredCharacters.slice(startIndex, endIndex);
    
    const rowContainer = document.createElement('div');
    rowContainer.className = 'character-row';
    rowContainer.id = `row-${charCurrentRow + 1}`;
    rowContainer.style.opacity = '0';
    rowContainer.style.transform = 'translateY(20px)';
    rowContainer.innerHTML = rowCharacters.map(createCharacterCard).join('');
    container.appendChild(rowContainer);
    
    charCurrentRow++;
    
    setTimeout(() => {
        rowContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        rowContainer.style.opacity = '1';
        rowContainer.style.transform = 'translateY(0)';
        
        setTimeout(() => {
            rowContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
        
        const moreBtn = document.getElementById('more-btn');
        if (moreBtn && charCurrentRow >= charTotalRows) {
            moreBtn.style.display = 'none';
        }
        
        charIsLoading = false;
    }, 50);
}

function filterCharacters(category) {
    if (!category) return allCharacters;
    return allCharacters.filter(char => char.category?.toLowerCase() === category.toLowerCase());
}

function handleCategoryClick(category) {
    const categoryItem = document.querySelector(`.categories__item[data-category="${category}"]`);
    
    if (!categoryItem) return;
    
    if (charCurrentFilter === category) {
        charCurrentFilter = null;
        categoryItem.classList.remove('active');
        filteredCharacters = [...allCharacters];
    } else {
        charCurrentFilter = category;
        document.querySelectorAll('.categories__item').forEach(item => item.classList.remove('active'));
        categoryItem.classList.add('active');
        filteredCharacters = filterCharacters(category);
    }
    
    displayCharacters(true);
    
    setTimeout(() => {
        const charactersSection = document.getElementById('characters');
        if (charactersSection) charactersSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
}

async function initCharacters() {
    console.log('=== НАЧИНАЕМ ИНИЦИАЛИЗАЦИЮ ПЕРСОНАЖЕЙ ===');
    
    const container = document.getElementById('characters-container');
    if (!container) {
        console.error('Контейнер персонажей не найден!');
        return;
    }
    
    // Показываем сообщение о загрузке
    container.innerHTML = `
        <div class="character-row" id="row-1">
            <div style="width: 100%; text-align: center; padding: 50px;">
                ⏳ Загрузка персонажей...
            </div>
        </div>
    `;
    
    await loadAllCharacters();
    displayCharacters();
    
    const moreBtn = document.getElementById('more-btn');
    if (moreBtn) {
        moreBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showNextRow();
        });
    }
    
    document.querySelectorAll('.categories__item a').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.closest('.categories__item').dataset.category;
            handleCategoryClick(category);
        });
    });
    
    console.log('=== ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===');
}