// Telegram Bot API конфигурация
const BOT_TOKEN = '8462290537:AAENLyTdB_juV82jqWbyMh_anyLXf5ksXtM';
const CHAT_ID = '1195065009'; // Ваш chat_id

// Типы обращений для отображения
const requestTypes = {
    'feedback': '📝 Отзыв',
    'question': '❓ Вопрос',
    'reservation': '🪑 Бронирование столика',
    'complaint': '⚠️ Жалоба',
    'suggestion': '💡 Предложение'
};

// Проверка бота при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Проверяем доступность бота...');
    checkBot();
});

// Функция проверки бота
async function checkBot() {
    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
        const data = await response.json();
        
        if (data.ok) {
            console.log('✅ Бот доступен:', data.result.username);
        } else {
            console.error('❌ Бот недоступен:', data.description);
            showMessage('Бот недоступен. Проверьте токен.', 'error');
        }
    } catch (error) {
        console.error('❌ Ошибка проверки бота:', error);
    }
}

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
    
    console.log('Данные формы:', formData);
    
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
        
        console.log('Сообщение для Telegram:', telegramMessage);
        
        // Отправляем данные в Telegram бот
        const response = await sendToTelegram(telegramMessage);
        
        console.log('Ответ от Telegram API:', response);
        
        if (response.ok) {
            showMessage('✅ Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.', 'success');
            // Очищаем форму
            document.getElementById('feedbackForm').reset();
        } else {
            console.error('Ошибка Telegram API:', response);
            throw new Error(`Telegram API error: ${response.description}`);
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
    console.log('Отправляем сообщение в Telegram...');
    console.log('CHAT_ID:', CHAT_ID);
    
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    
    try {
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
        
        const data = await response.json();
        console.log('Ответ от Telegram:', data);
        
        return data;
    } catch (error) {
        console.error('Ошибка при отправке в Telegram:', error);
        throw error;
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
