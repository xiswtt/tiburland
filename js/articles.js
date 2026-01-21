// articles.js - с аккордеоном для статей
(function() {
    'use strict';
    
    // ========== ПЕРЕМЕННЫЕ ДЛЯ СТАТЕЙ ==========
    const ARTICLES_PER_LOAD = 3;
    let articlesCurrentPage = 1;
    let articlesAllData = [];
    let articlesIsLoading = false;
    let expandedArticleId = null; // ID развернутой статьи
    
    // ========== ОСНОВНЫЕ ФУНКЦИИ ==========
    
    // Инициализация
    document.addEventListener('DOMContentLoaded', function() {
        console.log('📚 Статьи: инициализация...');
        loadArticlesData();
        setupArticlesEventListeners();
    });
    
    // Загрузка статей из JSON файла
    async function loadArticlesData() {
        try {
            console.log('📥 Загрузка данных статей из data/articles.json...');
            
            // Загружаем из JSON файла
            const response = await fetch('data/articles.json');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            articlesAllData = data.articles || [];
            
            console.log(`✅ Загружено ${articlesAllData.length} статей`);
            
            // Если статей нет, используем тестовые данные
            if (articlesAllData.length === 0) {
                console.log('Использую тестовые данные');
                articlesAllData = getTestArticles();
            }
            
            displayArticlesList();
            
        } catch (error) {
            console.error('❌ Ошибка загрузки статей:', error);
            console.log('Использую тестовые данные');
            articlesAllData = getTestArticles();
            displayArticlesList();
        }
    }
    
    // Тестовые статьи для демонстрации
    function getTestArticles() {
        return [
            {
                id: 1,
                title: "Введение в мир Тибурляндии",
                characters: "Альтибурон, Маккюи",
                image: "https://via.placeholder.com/523x453/79C9C5/ffffff?text=Тибурляндия",
                content: "Добро пожаловать в удивительный мир Тибурляндии! Это место, где акулы-антропоморфы живут своей уникальной жизнью.",
                fullContent: "Добро пожаловать в удивительный мир Тибурляндии! Это место, где акулы-антропоморфы живут своей уникальной жизнью. Здесь каждый персонаж имеет свою историю, характер и особенности. Мир Тибурляндии постоянно расширяется и развивается.",
                author: "Xiswtt",
                date: "2024-01-15",
                category: "Лор",
                tags: ["введение", "мир", "тибурляндия"]
            },
            {
                id: 2,
                title: "Анатомия тибурлянских акул",
                characters: "Ривер, Этан",
                image: "https://via.placeholder.com/523x453/3F9AAE/ffffff?text=Анатомия",
                content: "Особенности строения тела тибурлянских акул и их отличия от обычных морских обитателей.",
                fullContent: "Особенности строения тела тибурлянских акул и их отличия от обычных морских обитателей. Тибурлянские акулы обладают уникальной анатомией, позволяющей им жить как в воде, так и на суше. Их мышечная система, дыхательная система и другие особенности делают их особенными существами.",
                author: "Ksesh Trash",
                date: "2024-01-10",
                category: "Наука",
                tags: ["анатомия", "биология", "особенности"]
            },
            {
                id: 3,
                title: "История создания персонажей",
                characters: "Все персонажи",
                image: "https://via.placeholder.com/523x453/FF6B6B/ffffff?text=История",
                content: "Как создавались первые персонажи Тибурляндии и как развивался их дизайн.",
                fullContent: "Как создавались первые персонажи Тибурляндии и как развивался их дизайн. Каждый персонаж проходит долгий путь от идеи до финального воплощения. Мы расскажем о процессе создания, вдохновении и развитии дизайна главных героев нашего мира.",
                author: "Xiswtt",
                date: "2024-01-05",
                category: "Творчество",
                tags: ["дизайн", "создание", "история"]
            }
        ];
    }
    
    // Отображение статей с возможностью разворачивания
    function displayArticlesList() {
        const container = document.querySelector('.articles-container');
        
        if (!container) {
            console.error('❌ Контейнер статей не найден!');
            return;
        }
        
        // Очищаем контейнер
        container.innerHTML = '';
        
        // Вычисляем какие статьи показывать
        const startIndex = (articlesCurrentPage - 1) * ARTICLES_PER_LOAD;
        const endIndex = startIndex + ARTICLES_PER_LOAD;
        const articlesToShow = articlesAllData.slice(startIndex, endIndex);
        
        // Проверяем, есть ли статьи для показа
        if (articlesToShow.length === 0) {
            container.innerHTML = `
                <div class="no-articles-message">
                    <h3>Статьи не найдены</h3>
                    <p>Попробуйте зайти позже</p>
                </div>
            `;
            return;
        }
        
        // Создаем HTML для статей с аккордеоном
        articlesToShow.forEach(article => {
            const articleHTML = createArticleCardWithAccordion(article);
            container.innerHTML += articleHTML;
        });
        
        // Обновляем кнопку "Показать ещё"
        updateShowMoreButton();
        
        // Добавляем обработчики для аккордеона
        setupAccordionHandlers();
    }
    
    // Создание карточки статьи с аккордеоном
    function createArticleCardWithAccordion(article) {
        const isExpanded = expandedArticleId === article.id;
        
        return `
            <div class="article-accordion ${isExpanded ? 'expanded' : ''}" 
                 data-article-id="${article.id}">
                
                <!-- ЗАГОЛОВОК (всегда видим) -->
                <div class="article-accordion-header">
                    <div class="article-header-content">
                        <div class="article-header-image">
                            <img src="${article.image}" 
                                 alt="${article.title}" 
                                 class="article-cover" 
                                 loading="lazy"
                                 onerror="this.onerror=null; this.src='https://via.placeholder.com/523x453/79C9C5/ffffff?text=Нет+фото'">
                        </div>
                        <div class="article-header-text">
                            <p class="article-chars">${article.characters}</p>
                            <h4 class="article-name">${article.title}</h4>
                            
                            <!-- Краткое описание (видно всегда) -->
                            <div class="article-preview">
                                <p class="article-text">${article.content}</p>
                            </div>
                            
                            <!-- Мета-информация -->
                            <div class="article-meta">
                                <span class="article-author">${article.author}</span>
                                <span class="article-date">${formatArticleDate(article.date)}</span>
                                <span class="article-category">${article.category}</span>
                            </div>
                            
                            <!-- Кнопка разворачивания -->
                            <button class="article-toggle-btn" type="button">
                                <span class="toggle-text">
                                    ${isExpanded ? 'Свернуть' : 'Читать полностью'}
                                </span>
                                <svg class="toggle-icon ${isExpanded ? 'expanded' : ''}" 
                                     width="20" height="20" viewBox="0 0 24 24">
                                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z" 
                                          fill="currentColor"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- СОДЕРЖИМОЕ (скрыто/показано) -->
                <div class="article-accordion-content" 
                     style="${isExpanded ? 'display: block;' : 'display: none;'}">
                    
                    <div class="article-full-content">
                        <!-- Полный текст статьи -->
                        <div class="article-body">
                            ${article.fullContent || article.content}
                        </div>
                        
                        <!-- Теги -->
                        ${article.tags && article.tags.length > 0 ? `
                            <div class="article-tags">
                                <h5>Теги:</h5>
                                <div class="tags-list">
                                    ${article.tags.map(tag => `
                                        <span class="article-tag">${tag}</span>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                        
                        <!-- Дополнительные действия -->
                        <div class="article-actions">
                            <button class="share-article-btn" data-id="${article.id}">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
                                </svg>
                                Поделиться
                            </button>
                            
                            <button class="close-article-btn" data-id="${article.id}">
                                <svg width="18" height="18" viewBox="0 0 24 24">
                                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                                </svg>
                                Свернуть
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Форматирование даты
    function formatArticleDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
        } catch (error) {
            return dateString || 'Дата не указана';
        }
    }
    
    // Обработчики для аккордеона
    function setupAccordionHandlers() {
        // Кнопки разворачивания
        document.querySelectorAll('.article-toggle-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const accordion = this.closest('.article-accordion');
                toggleAccordion(accordion);
            });
        });
        
        // Кнопка "Свернуть" внутри контента
        document.querySelectorAll('.close-article-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const accordion = this.closest('.article-accordion');
                toggleAccordion(accordion, false);
            });
        });
        
        // Клик по всему заголовку (опционально)
        document.querySelectorAll('.article-accordion-header').forEach(header => {
            header.addEventListener('click', function(e) {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    const accordion = this.closest('.article-accordion');
                    toggleAccordion(accordion);
                }
            });
        });
        
        // Кнопка "Поделиться"
        document.querySelectorAll('.share-article-btn').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const articleId = this.dataset.id;
                shareArticle(articleId);
            });
        });
    }
    
    // Переключение состояния аккордеона
    function toggleAccordion(accordion, forceState = null) {
        const articleId = parseInt(accordion.dataset.articleId);
        const content = accordion.querySelector('.article-accordion-content');
        const toggleBtn = accordion.querySelector('.article-toggle-btn');
        const toggleIcon = accordion.querySelector('.toggle-icon');
        const toggleText = accordion.querySelector('.toggle-text');
        
        // Определяем новое состояние
        let shouldExpand;
        if (forceState !== null) {
            shouldExpand = forceState;
        } else {
            shouldExpand = !accordion.classList.contains('expanded');
        }
        
        // Закрываем другие открытые статьи (опционально)
        if (shouldExpand) {
            // Можно оставить только одну открытой
            document.querySelectorAll('.article-accordion.expanded').forEach(item => {
                if (item !== accordion) {
                    closeAccordion(item);
                }
            });
            
            expandedArticleId = articleId;
        } else {
            expandedArticleId = null;
        }
        
        // Анимация открытия/закрытия
        if (shouldExpand) {
            // Открываем
            accordion.classList.add('expanded');
            toggleIcon.classList.add('expanded');
            toggleText.textContent = 'Свернуть';
            
            // Плавное раскрытие
            content.style.display = 'block';
            const height = content.scrollHeight;
            content.style.height = '0';
            content.style.overflow = 'hidden';
            
            requestAnimationFrame(() => {
                content.style.transition = 'height 0.4s ease';
                content.style.height = height + 'px';
                
                // После анимации
                setTimeout(() => {
                    content.style.height = '';
                    content.style.overflow = '';
                }, 400);
            });
            
        } else {
            // Закрываем
            closeAccordion(accordion);
        }
        
        // Прокрутка к статье если она открылась
        if (shouldExpand) {
            setTimeout(() => {
                accordion.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    }
    
    // Закрытие аккордеона
    function closeAccordion(accordion) {
        const content = accordion.querySelector('.article-accordion-content');
        const toggleBtn = accordion.querySelector('.article-toggle-btn');
        const toggleIcon = accordion.querySelector('.toggle-icon');
        const toggleText = accordion.querySelector('.toggle-text');
        
        accordion.classList.remove('expanded');
        toggleIcon.classList.remove('expanded');
        toggleText.textContent = 'Читать полностью';
        
        // Плавное закрытие
        const height = content.scrollHeight;
        content.style.height = height + 'px';
        content.style.overflow = 'hidden';
        
        requestAnimationFrame(() => {
            content.style.transition = 'height 0.3s ease';
            content.style.height = '0';
            
            // После анимации
            setTimeout(() => {
                content.style.display = 'none';
                content.style.height = '';
                content.style.overflow = '';
                content.style.transition = '';
            }, 300);
        });
    }
    
    // Функция "Поделиться"
    function shareArticle(articleId) {
        const article = articlesAllData.find(a => a.id === parseInt(articleId));
        if (!article) return;
        
        const shareUrl = window.location.origin + `/article.html?id=${articleId}`;
        const shareText = `${article.title} - Тибурляндия`;
        
        if (navigator.share) {
            // Нативные шеринг API
            navigator.share({
                title: shareText,
                text: article.content.substring(0, 100) + '...',
                url: shareUrl
            });
        } else {
            // Копирование в буфер
            navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
                .then(() => {
                    alert('Ссылка скопирована в буфер обмена!');
                })
                .catch(err => {
                    console.error('Ошибка копирования:', err);
                });
        }
    }
    
    // Остальные функции (без изменений)
    function updateShowMoreButton() {
        const showMoreBtn = document.querySelector('.article-btn');
        const totalPages = Math.ceil(articlesAllData.length / ARTICLES_PER_LOAD);
        
        if (articlesCurrentPage >= totalPages) {
            showMoreBtn.style.display = 'none';
        } else {
            showMoreBtn.style.display = 'flex';
        }
    }
    
    function loadNextArticlesPage() {
        if (articlesIsLoading) return;
        
        articlesIsLoading = true;
        articlesCurrentPage++;
        
        const container = document.querySelector('.articles-container');
        
        // Анимация загрузки
        const loader = document.createElement('div');
        loader.className = 'articles-loader';
        loader.innerHTML = `<div>Загрузка статей...</div>`;
        container.appendChild(loader);
        
        setTimeout(() => {
            loader.remove();
            
            const startIndex = (articlesCurrentPage - 1) * ARTICLES_PER_LOAD;
            const endIndex = startIndex + ARTICLES_PER_LOAD;
            const articlesToAdd = articlesAllData.slice(startIndex, endIndex);
            
            articlesToAdd.forEach(article => {
                const articleHTML = createArticleCardWithAccordion(article);
                container.innerHTML += articleHTML;
            });
            
            updateShowMoreButton();
            setupAccordionHandlers();
            articlesIsLoading = false;
            
            // Прокрутка к новой статье
            const newArticles = container.querySelectorAll('.article-accordion');
            if (newArticles.length > 0) {
                newArticles[0].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 300);
    }
    
    function setupArticlesEventListeners() {
        const showMoreBtn = document.querySelector('.article-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loadNextArticlesPage();
            });
        }
    }
    
    function showArticlesErrorMessage() {
        const container = document.querySelector('.articles-container');
        if (!container) return;
        
        container.innerHTML = `
            <div class="articles-error">
                <h3>Ошибка загрузки</h3>
                <p>Не удалось загрузить статьи</p>
                <button onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
    }
})();