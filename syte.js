// Telegram Bot API конфигурация
const BOT_TOKEN = '8462290537:AAENLyTdB_juV82jqWbyMh_anyLXf5ksXtM';
// Ваш chat_id (ID чата, куда бот будет отправлять сообщения)
// Вам нужно заменить этот ID на свой. Получить его можно отправив сообщение боту @userinfobot
const CHAT_ID = '1195065009'; // Замените на свой chat_id

// Типы обращений для отображения
const requestTypes = {
    'feedback': '📝 Отзыв',
    'question': '❓ Вопрос',
    'reservation': '🪑 Бронирование столика',
    'complaint': '⚠️ Жалоба',
    'suggestion': '💡 Предложение'
};

document.getElementById('feedbackForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
        name: document.getElementById('name').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        email: document.getElementById('email').value.trim(),
        message: document.getElementById('message').value.trim(),
        type: document.getElementById('type').value
    };
    
    // Проверка заполнения обязательных полей
    if (!formData.name || !formData.phone || !formData.message) {
        showMessage('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }
    
    // Показываем спиннер и меняем текст кнопки
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const spinner = document.getElementById('spinner');
    
    btnText.textContent = 'Отправка...';
    spinner.style.display = 'block';
    submitBtn.disabled = true;
    
    try {
        // Формируем текст сообщения для Telegram
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
        
        // Отправляем данные в Telegram бот
        const response = await sendToTelegram(telegramMessage);
        
        if (response.ok) {
            showMessage('✅ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            // Очищаем форму
            document.getElementById('feedbackForm').reset();
        } else {
            throw new Error('Ошибка при отправке в Telegram');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        showMessage('❌ Произошла ошибка при отправке. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.', 'error');
    } finally {
        // Восстанавливаем кнопку
        btnText.textContent = 'Отправить сообщение в Telegram';
        spinner.style.display = 'none';
        submitBtn.disabled = false;
    }
});

// Функция отправки сообщения в Telegram
async function sendToTelegram(message) {
    // Если CHAT_ID не установлен, используем метод getUpdates для получения chat_id
    if (CHAT_ID === '1195065009') {
        return await getChatId();
    }
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        })
    });
    
    return response.json();
}

// Функция для получения chat_id (только для настройки)
async function getChatId() {
    const updatesUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`;
    
    try {
        const response = await fetch(updatesUrl);
        const data = await response.json();
        
        if (data.ok && data.result.length > 0) {
            const chatId = data.result[0].message.chat.id;
            showMessage(`Настройка: Ваш chat_id: ${chatId}. Замените "YOUR_CHAT_ID" на это значение в коде.`, 'success');
            return { ok: true };
        } else {
            showMessage('Настройка: Отправьте любое сообщение вашему боту в Telegram, затем обновите страницу.', 'error');
            return { ok: false };
        }
    } catch (error) {
        showMessage('Ошибка при получении chat_id. Проверьте токен бота.', 'error');
        return { ok: false };
    }
}

// Функция для показа сообщений
function showMessage(text, type) {
    const container = document.getElementById('messageContainer');
    container.textContent = text;
    container.className = type;
    container.style.display = 'block';
    
    // Автоматически скрываем успешное сообщение через 5 секунд
    if (type === 'success') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

// Валидация телефона
document.getElementById('phone').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9+()-]/g, '');
});

// Валидация имени (только буквы и пробелы)
document.getElementById('name').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^a-zA-Zа-яА-ЯёЁ\s]/g, '');
});