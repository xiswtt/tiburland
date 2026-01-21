const express = require('express'); //импорт фреймворка
const path = require('path'); //импорт пути
const fs = require('fs'); //импорт файловой системы
const app = express(); 

// Для Vercel порт берется из окружения
const PORT = process.env.PORT || 3000;

// Раздаем статические файлы
app.use(express.static(__dirname));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));
app.use('/favicon', express.static('favicon'));

// Раздаем HTML файлы
app.use(express.static(__dirname, {
    extensions: ['html', 'htm']
}));

// чтения персонажей
function getCharacters() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'characters.json'), 'utf8');
        return JSON.parse(data).characters;
    } catch (error) {
        console.error('Ошибка чтения файла персонажей:', error);
        return [];
    }
}

// Функция для чтения статей
function getArticles() {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'data', 'articles.json'), 'utf8');
        return JSON.parse(data).articles;
    } catch (error) {
        console.error('Ошибка чтения файла статей:', error);
        return [];
    }
}

// ========== ПРОСТЫЕ API ==========

// 1. Все персонажи
app.get('/api/characters', (req, res) => {
    const characters = getCharacters();
    res.json(characters);
});

// 2. Конкретный персонаж по ID
app.get('/api/characters/:id', (req, res) => {
    const characters = getCharacters();
    const character = characters.find(char => char.id === parseInt(req.params.id));
    
    if (character) {
        res.json(character);
    } else {
        res.status(404).json({ error: 'Персонаж не найден' });
    }
});

// 3. Персонажи по категории
app.get('/api/characters/category/:category', (req, res) => {
    const characters = getCharacters();
    const filtered = characters.filter(char => 
        char.category.toLowerCase() === req.params.category.toLowerCase()
    );
    res.json(filtered);
});

// ========== API ДЛЯ СТАТЕЙ ==========

// 1. Все статьи
app.get('/api/articles', (req, res) => {
    const articles = getArticles();
    res.json(articles);
});

// 2. Конкретная статья по ID
app.get('/api/articles/:id', (req, res) => {
    const articles = getArticles();
    const article = articles.find(art => art.id === parseInt(req.params.id));
    
    if (article) {
        res.json(article);
    } else {
        res.status(404).json({ error: 'Статья не найдена' });
    }
});

// 3. Статьи по категории
app.get('/api/articles/category/:category', (req, res) => {
    const articles = getArticles();
    const filtered = articles.filter(art => 
        art.category.toLowerCase() === req.params.category.toLowerCase()
    );
    res.json(filtered);
});

// 4. Страница статьи
app.get('/article/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'article-page.html')); // Создайте позже
});

// 5. Страница со всеми статьями
app.get('/articles', (req, res) => {
    res.sendFile(path.join(__dirname, 'articles.html'));
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ========== ЗАПУСК ==========

// Для локальной разработки
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`
        ╔═══════════════════════════════════════╗
        ║        TIBURLAND API                  ║
        ╠═══════════════════════════════════════╣
        ║  🌐 Локально: http://localhost:${PORT}      ║
        ║  📡 API: http://localhost:${PORT}/api/characters ║
        ╚═══════════════════════════════════════╝
        `);
    });
}

// Экспорт для Vercel/Netlify
module.exports = app;