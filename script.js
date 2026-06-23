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
        msgDiv.className = `flex items-start ${isUser ? 'flex-row-reverse' : ''}`;
        
        const iconHTML = isUser 
            ? `<div class="w-8 h-8 rounded bg-accent-600 flex items-center justify-center ml-2 flex-shrink-0 shadow-sm">
                 <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
               </div>`
            : `<div class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0 shadow-sm">
                 <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
               </div>`;

        const textBg = isUser ? 'bg-accent-600 text-white rounded-tr-sm' : 'bg-gray-700 text-gray-200 rounded-tl-sm';
        
        msgDiv.innerHTML = `
            ${iconHTML}
            <div class="${textBg} text-sm rounded-2xl px-4 py-2 max-w-[85%] shadow-sm">
                ${text}
            </div>
        `;
        chatMessages.appendChild(msgDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const showTyping = () => {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex items-start';
        typingDiv.innerHTML = `
            <div class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-2 flex-shrink-0">
                <svg class="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
            </div>
            <div class="bg-gray-700 text-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] shadow-sm flex gap-1 items-center h-[36px]">
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
                <div class="w-1.5 h-1.5 bg-gray-400 rounded-full typing-dot"></div>
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    const removeTyping = () => {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    };

    const getMockResponse = (query) => {
        const lowerQ = query.toLowerCase();
        if (lowerQ.includes('навыки') || lowerQ.includes('стек') || lowerQ.includes('технологии')) {
            return "Стек Хово включает: Python (Flask, Django), интеграции LLM (Gemini, ChatGPT), базы данных (PostgreSQL) и инструменты автоматизации (n8n). Опыт более 3.5 лет.";
        } else if (lowerQ.includes('проект') || lowerQ.includes('опыт')) {
            return "Среди проектов: системы автоматизации контента, AI-генераторы отчетов, сложные корпоративные сайты и интеграции Telegram-решений.";
        } else if (lowerQ.includes('связаться') || lowerQ.includes('контакты')) {
            return "Вы можете написать в Telegram или воспользоваться формой обратной связи на сайте.";
        }
        return "Отличный вопрос! Я пока лишь заглушка, но в реальном проекте здесь будет ответ от обученной языковой модели через Python-бэкенд.";
    };

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, true);
        chatInput.value = '';
        
        showTyping();

        // Mock API Delay
        setTimeout(() => {
            removeTyping();
            addMessage(getMockResponse(text));
        }, 1500);
    });

    // --- Contact Form Submission Mock Logic ---
    const contactForm = document.getElementById('contact-form');
    const feedbackMsg = document.getElementById('form-feedback');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerText;
        
        submitBtn.innerText = 'Отправка...';
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-75', 'cursor-not-allowed');

        setTimeout(() => {
            contactForm.reset();
            feedbackMsg.classList.remove('hidden');
            
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-75', 'cursor-not-allowed');

            // Hide message after 5 seconds
            setTimeout(() => {
                feedbackMsg.classList.add('hidden');
            }, 5000);
        }, 1000);
    });
});


async function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value;
    
    // Блокировка от спама (простая проверка)
    if (!message) return;

    const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ message: message })
    });
    
    const data = await response.json();
    // Выведи data.reply в окно чата
    console.log("Ответ от Хово-бота:", data.reply);
}