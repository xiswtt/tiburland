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
    
    // ... остальной код навигации без изменений ...
    // (оставьте ваш код навигации как был)
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
    // ... оставьте вашу функцию без изменений ...
}

// ========== ОСНОВНЫЕ ФУНКЦИИ ==========

async function loadAllCharacters() {
    try {
        const response = await fetch('data/characters.json');
        const data = await response.json();
        allCharacters = data.characters || [];
        filteredCharacters = [...allCharacters];
        console.log('Загружено персонажей:', allCharacters.length);
        return allCharacters;
    } catch (error) {
        console.error('Ошибка загрузки:', error);
        allCharacters = [];
        filteredCharacters = [];
        return [];
    }
}

function displayCharacters(resetPagination = true) {
    const container = document.getElementById('characters-container');
    
    if (!container) {
        console.log('Контейнер персонажей не найден');
        return;
    }
    
    container.innerHTML = '';
    
    if (resetPagination) {
        charCurrentRow = 1;
    }
    
    if (filteredCharacters.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 50px;">Нет персонажей для отображения</div>';
        document.getElementById('more-btn').style.display = 'none';
        return;
    }
    
    const rows = [];
    for (let i = 0; i < filteredCharacters.length; i += CARDS_PER_ROW) {
        rows.push(filteredCharacters.slice(i, i + CARDS_PER_ROW));
    }
    
    charTotalRows = rows.length;
    
    for (let i = 0; i < Math.min(charCurrentRow, rows.length); i++) {
        const rowContainer = document.createElement('div');
        rowContainer.className = 'character-row';
        rowContainer.id = `row-${i + 1}`;
        rowContainer.innerHTML = rows[i].map(createCharacterCard).join('');
        container.appendChild(rowContainer);
    }
    
    const moreBtn = document.getElementById('more-btn');
    if (moreBtn) {
        moreBtn.style.display = charCurrentRow < charTotalRows ? 'block' : 'none';
    }
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
    console.log('Начинаем инициализацию персонажей...');
    
    const container = document.getElementById('characters-container');
    if (!container) {
        console.log('Контейнер персонажей не найден (возможно не та страница)');
        return;
    }
    
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
    
    console.log('Персонажи инициализированы успешно!');
}