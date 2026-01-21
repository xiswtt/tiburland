// ========== НАВИГАЦИЯ ==========
document.addEventListener('DOMContentLoaded', function() {
    // Ждем немного, чтобы все элементы точно загрузились
    setTimeout(initHeaderNavigation, 100);
});

function initHeaderNavigation() {
    const header = document.querySelector('.header');
    const logo = document.querySelector('.header-logo img');
    
    if (!header || !logo) {
        console.error('Не найдены элементы header или logo');
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
    
    // ========== ИНИЦИАЛИЗАЦИЯ ==========
    if (typeof initCharacters === 'function') {
        initCharacters();
    }
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
                <p>${character.description.substring(0, 100)}${character.description.length > 100 ? '...' : ''}</p>
                
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

// загружаем всех персонажей с сервера
async function loadAllCharacters() {
    try {
        const response = await fetch('/api/characters');
        allCharacters = await response.json();
        filteredCharacters = [...allCharacters]; // Изначально показываем всех
        console.log('Загружены все персонажи:', allCharacters.length);
        return allCharacters;
    } catch (error) {
        console.error('Ошибка загрузки персонажей:', error);
        return [];
    }
}

// Показываем персонажей на странице (только видимые ряды)
function displayCharacters(resetPagination = true) {
    const container = document.getElementById('characters-container');
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    if (resetPagination) {
        currentRow = 1;
    }
    
    // Разбиваем на ряды по 3 карточки
    const rows = [];
    for (let i = 0; i < filteredCharacters.length; i += CARDS_PER_ROW) {
        rows.push(filteredCharacters.slice(i, i + CARDS_PER_ROW));
    }
    
    totalRows = rows.length;
    
    // создаем видимые ряды
    for (let i = 0; i < Math.min(currentRow, rows.length); i++) {
        const rowId = `row-${i + 1}`;
        const rowContainer = document.createElement('div');
        rowContainer.className = 'character-row';
        rowContainer.id = rowId;
        rowContainer.innerHTML = rows[i].map(createCharacterCard).join('');
        container.appendChild(rowContainer);
    }
    
    //  "Показать ещё"
    const moreBtn = document.getElementById('more-btn');
    if (currentRow < totalRows) {
        moreBtn.style.display = 'block';
    } else {
        moreBtn.style.display = 'none';
    }
    
    console.log(`Показано ${Math.min(currentRow * CARDS_PER_ROW, filteredCharacters.length)} из ${filteredCharacters.length} персонажей, рядов: ${totalRows}, текущий ряд: ${currentRow}`);
}

// Показываем следующий ряд
function showNextRow() {
    if (currentRow >= totalRows || charIsLoading) return;
    
    charIsLoading = true;
    
    // создаем новый ряд
    const container = document.getElementById('characters-container');
    const rowId = `row-${currentRow + 1}`;
    const rowContainer = document.createElement('div');
    rowContainer.className = 'character-row';
    rowContainer.id = rowId;
    rowContainer.style.opacity = '0';
    rowContainer.style.transform = 'translateY(20px)';
    
    // Вычисляем какие карточки показывать
    const startIndex = currentRow * CARDS_PER_ROW;
    const endIndex = Math.min(startIndex + CARDS_PER_ROW, filteredCharacters.length);
    const rowCharacters = filteredCharacters.slice(startIndex, endIndex);
    
    rowContainer.innerHTML = rowCharacters.map(createCharacterCard).join('');
    container.appendChild(rowContainer);
    
    currentRow++;
    
    // Анимация появления
    setTimeout(() => {
        rowContainer.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        rowContainer.style.opacity = '1';
        rowContainer.style.transform = 'translateY(0)';
    }, 50);
    
    // Прокрутка
    setTimeout(() => {
        rowContainer.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 100);
    
    // Скрываем кнопку если это последний ряд
    if (currentRow >= totalRows) {
        document.getElementById('more-btn').style.display = 'none';
    }
    
    charIsLoading = false;
}

// фильтруем персонажей
function filterCharacters(category) {
    if (!category) {
        return allCharacters;
    }
    
    return allCharacters.filter(character => 
        character.category.toLowerCase() === category.toLowerCase()
    );
}

// обработчик клика по категории
function handleCategoryClick(category) {
    const categoryItem = document.querySelector(`.categories__item[data-category="${category}"]`);
    
    // Проверяем: если уже активна эта категория - сбрасываем фильтр
    if (currentFilter === category) {
        // Сбрасываем фильтр
        currentFilter = null;
        categoryItem.classList.remove('active');
        filteredCharacters = [...allCharacters];
        console.log('Фильтр сброшен, показываем всех');
    } else {
        // Устанавливаем новый фильтр
        currentFilter = category;
        
        // Снимаем активный класс со всех
        document.querySelectorAll('.categories__item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Добавляем активный класс текущей
        categoryItem.classList.add('active');
        
        // Фильтруем
        filteredCharacters = filterCharacters(category);
        console.log(`Фильтр: ${category}, персонажей: ${filteredCharacters.length}`);
    }
    
    // Перерисовываем
    displayCharacters(true);
    
    // Прокручиваем к персонажам
    setTimeout(() => {
        document.getElementById('characters').scrollIntoView({ 
            behavior: 'smooth' 
        });
    }, 300);
}

// ========== ИНИЦИАЛИЗАЦИЯ ==========

async function initCharacters() {
    // Загружаем всех персонажей
    await loadAllCharacters();
    
    // Показываем всех персонажей
    displayCharacters();
    
    // Настраиваем кнопку "Показать ещё"
    const moreBtn = document.getElementById('more-btn');
    moreBtn.addEventListener('click', function(e) {
        e.preventDefault();
        showNextRow();
    });
    
    // Настраиваем фильтры категорий
    const categoryButtons = document.querySelectorAll('.categories__item a');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const category = this.closest('.categories__item').dataset.category;
            handleCategoryClick(category);
        });
    });
}