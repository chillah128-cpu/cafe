// Telegram Bot API конфигурация
const BOT_TOKEN = '8462290537:AAENLyTdB_juV82jqWbyMh_anyLXf5ksXtM';
const CHAT_ID = '1195065009';

// Типы обращений
const requestTypes = {
    'feedback': '📝 Отзыв',
    'question': '❓ Вопрос',
    'reservation': '🪑 Бронирование столика',
    'complaint': '⚠️ Жалоба',
    'suggestion': '💡 Предложение'
};

// Проверка при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== НАЧАЛО РАБОТЫ ===');
    console.log('Бот: @ninorinnie_bot');
    console.log('CHAT_ID:', CHAT_ID);
    console.log('Токен:', BOT_TOKEN.substring(0, 15) + '...');
});

// Обработчик формы
document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    console.log('=== ОТПРАВКА ФОРМЫ ===');
    
    // Получаем данные
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
        type: document.getElementById('type').value
    };
    
    console.log('Данные формы:', formData);
    
    // Проверка
    if (!formData.name || !formData.phone || !formData.message) {
        showMessage('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Блокируем кнопку
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    btnText.textContent = 'Отправка...';
    spinner.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        // Формируем сообщение
        const telegramMessage = `
🔔 НОВОЕ ОБРАЩЕНИЕ С САЙТА

📋 Тип: ${requestTypes[formData.type] || formData.type}
👤 Имя: ${formData.name}
📞 Телефон: ${formData.phone}
📧 Email: ${formData.email || 'Не указан'}

💬 Сообщение:
${formData.message}

⏰ Время: ${new Date().toLocaleString('ru-RU')}
        `;
        
        console.log('Сообщение для Telegram:', telegramMessage);
        
        // Отправляем
        const response = await sendToTelegram(telegramMessage);
        
        console.log('Ответ API:', response);
        
        if (response.ok) {
            showMessage('✅ Сообщение отправлено в Telegram! Проверьте чат с @ninorinnie_bot', 'success');
            document.getElementById('feedbackForm').reset();
        } else {
            console.error('Ошибка API:', response);
            showMessage(`❌ Ошибка: ${response.description || 'Неизвестная ошибка'}`, 'error');
        }
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
        showMessage(`❌ Ошибка: ${error.message}`, 'error');
    } finally {
        btnText.textContent = 'Отправить в Telegram';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// Функция отправки (исправленная)
async function sendToTelegram(message) {
    console.log('Вызываем sendToTelegram...');
    
    // Используем GET запрос как в успешном тесте
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(message)}`;
    
    console.log('URL запроса:', url.substring(0, 100) + '...');
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка fetch:', error);
        throw error;
    }
}

// Альтернативный метод отправки (более надежный)
async function sendToTelegramPOST(message) {
    console.log('Отправка POST запросом...');
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('text', message);
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        return await response.json();
    } catch (error) {
        console.error('Ошибка POST запроса:', error);
        throw error;
    }
}

// Функция показа сообщений
function showMessage(text, type) {
    console.log('Показываем сообщение:', text);
    
    const container = document.getElementById('messageContainer');
    if (!container) {
        console.error('Элемент messageContainer не найден!');
        alert(text); // Показываем через alert если нет контейнера
        return;
    }
    
    container.textContent = text;
    container.className = type;
    container.style.display = 'block';
    
    if (type === 'success') {
        setTimeout(() => container.style.display = 'none', 5000);
    }
}

// Валидация
document.getElementById('phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9+()-]/g, '');
});

document.getElementById('name').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s]/g, '');
});

// Тестовая функция для проверки
window.testBotConnection = async function() {
    console.log('=== ТЕСТ БОТА ===');
    
    try {
        // Проверка бота
        const botInfo = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        const botData = await botInfo.json();
        console.log('Информация о боте:', botData);
        
        // Тестовая отправка
        const testMessage = `🛠️ Тестовое сообщение из сайта\nВремя: ${new Date().toLocaleTimeString()}`;
        const testUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${CHAT_ID}&text=${encodeURIComponent(testMessage)}`;
        
        console.log('Тестовый URL:', testUrl);
        
        const response = await fetch(testUrl);
        const result = await response.json();
        console.log('Результат теста:', result);
        
        if (result.ok) {
            alert('✅ Тест успешен! Сообщение отправлено в Telegram');
        } else {
            alert(`❌ Ошибка: ${result.description}`);
        }
        
    } catch (error) {
        console.error('Ошибка теста:', error);
        alert(`❌ Ошибка теста: ${error.message}`);
    }
};
