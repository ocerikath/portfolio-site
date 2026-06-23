document.addEventListener('DOMContentLoaded', () => {
    
    // --- AI Chat Widget Logic ---
    const chatToggleBtn = document.getElementById('chat-toggle-btn');
    const chatCloseBtn = document.getElementById('chat-close-btn');
    const chatWidget = document.getElementById('chat-widget');
    
    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');
    const chatMessages = document.getElementById('chat-messages');

    // Open/Close Widget functionality
    const toggleChat = () => {
        const isHidden = chatWidget.classList.contains('opacity-0');
        if (isHidden) {
            chatWidget.classList.remove('translate-y-8', 'opacity-0', 'pointer-events-none');
            chatWidget.classList.add('translate-y-0', 'opacity-100', 'pointer-events-auto');
            setTimeout(() => chatInput.focus(), 300);
        } else {
            chatWidget.classList.add('translate-y-8', 'opacity-0', 'pointer-events-none');
            chatWidget.classList.remove('translate-y-0', 'opacity-100', 'pointer-events-auto');
        }
    };

    chatToggleBtn.addEventListener('click', toggleChat);
    chatCloseBtn.addEventListener('click', toggleChat);

    // Message creation logic
    const addMessage = (text, isUser = false) => {
        const msgDiv = document.createElement('div');
        msgDiv.className = `flex items-start ${isUser ? 'flex-row-reverse' : ''} mb-4`;
        
        msgDiv.innerHTML = `
            <div class="${isUser ? 'bg-accent-600' : 'bg-gray-700'} text-white text-sm rounded-2xl px-4 py-2 max-w-[85%] shadow-sm">
                ${text}
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // Создание пустого контейнера для "печатной машинки"
    const addEmptyMessage = () => {
        const msgDiv = document.createElement('div');
        msgDiv.className = 'flex items-start mb-4';
        msgDiv.innerHTML = `<div class="bg-gray-700 text-white text-sm rounded-2xl px-4 py-2 max-w-[85%] shadow-sm"></div>`;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return msgDiv.querySelector('div');
    };

    const showTyping = () => {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-start mb-4';
        typingDiv.innerHTML = `
            <div class="bg-gray-700 text-gray-200 rounded-2xl px-4 py-3 max-w-[85%] shadow-sm flex gap-1 items-center h-[36px]">
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTyping = () => {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    };

    // Основной обработчик отправки формы
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        // Защита от спама (5 секунд)
        const lastRequest = localStorage.getItem('lastReq');
        if (lastRequest && Date.now() - lastRequest < 5000) {
            addMessage("Подождите немного...");
            return;
        }

        addMessage(text, true);
        chatInput.value = '';
        showTyping();
        localStorage.setItem('lastReq', Date.now());

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            removeTyping();
            
            if (response.ok) {
                const fullText = data.reply;

                // Функция для обработки Markdown (жирный текст и ссылки)
                const parseMarkdown = (text) => {
                    return text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Жирный
                        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" class="text-accent-400 underline">$1</a>') // Ссылки
                        .replace(/\n/g, '<br>'); // Переносы
                };

                // Эффект печати (теперь мы печатаем "сырой" текст, а рендерим его)
                const textContainer = addEmptyMessage();
                textContainer.style.whiteSpace = "pre-wrap";

                for (let i = 0; i < fullText.length; i++) {
                    textContainer.innerHTML = parseMarkdown(fullText.substring(0, i + 1));
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                    await new Promise(r => setTimeout(r, 15)); 
                }
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            removeTyping();
            addMessage("Сервер временно недоступен. Напишите мне в Telegram напрямую.");
            console.error("Ошибка AI:", error);
        }
    });

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const feedbackMsg = document.getElementById('form-feedback');
    
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            submitBtn.innerText = 'Отправка...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                contactForm.reset();
                feedbackMsg.classList.remove('hidden');
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
                setTimeout(() => feedbackMsg.classList.add('hidden'), 5000);
            }, 1000);
        });
    }
});