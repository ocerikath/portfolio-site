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



const chatTooltip = document.getElementById('chat-tooltip');
const closeTooltipBtn = document.getElementById('close-tooltip-btn');
const chatToggleBtn = document.getElementById('chat-toggle-btn');

// Функция скрытия подсказки
function hideTooltip() {
    if (chatTooltip) {
        chatTooltip.classList.add('opacity-0', 'pointer-events-none', 'translate-y-2');
        // Полностью удаляем из разметки через полсекунды после анимации затухания
        setTimeout(() => chatTooltip.remove(), 300);
    }
}

// Скрываем при клике на крестик на самом облачке
if (closeTooltipBtn) {
    closeTooltipBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Чтобы не срабатывал клик по кнопке чата
        hideTooltip();
    });
}

// Скрываем при открытии чата
if (chatToggleBtn) {
    chatToggleBtn.addEventListener('click', () => {
        hideTooltip();
    });
}


const ideData = [
    {
        filename: "automation.py",
        code: `<span class="text-purple-400">import</span> openai, asyncio\n\n<span class="text-blue-400">async def</span> <span class="text-green-400">integrate_ai</span>():\n    agent = AIAgent(role=<span class="text-orange-400">"RAG"</span>)\n    <span class="text-purple-400">await</span> agent.start_pipeline()\n    <span class="text-gray-500"># Снижаем рутину бизнеса на 80%</span>\n    print(<span class="text-orange-400">"System: Optimized! ✅"</span>)`
    },
    
    {
        filename: "index.html",
        code: `<span class="text-gray-500">&lt;!-- Landing Hero --&gt;</span>\n<span class="text-red-400">&lt;section</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"grid gap-8"</span><span class="text-red-400">&gt;</span>\n  <span class="text-red-400">&lt;h1&gt;</span>AI Automation Engineer<span class="text-red-400">&lt;/h1&gt;</span>\n  <span class="text-red-400">&lt;div</span> <span class="text-yellow-400">id</span>=<span class="text-orange-400">"app"</span><span class="text-red-400">&gt;&lt;/div&gt;</span>\n<span class="text-red-400">&lt;/section&gt;</span>`
    },

    {
        filename: "agent.js",
        code: `<span class="text-purple-400">const</span> deployButton = document.<span class="text-blue-400">querySelector</span>(<span class="text-orange-400">'.btn'</span>);\n\ndeployButton.<span class="text-blue-400">addEventListener</span>(<span class="text-orange-400">'click'</span>, () => {\n  <span class="text-purple-400">const</span> success = workflow.<span class="text-blue-400">launch</span>();\n  <span class="text-purple-400">if</span> (success) <span class="text-blue-400">console.log</span>(<span class="text-orange-400">'Deployed successfully!'</span>);\n});`
    },


    {
        filename: "ai_agent.py",
        code: `<span class="text-purple-400">from</span> langchain <span class="text-purple-400">import</span> OpenAI, RAG_Pipeline\n\n<span class="text-blue-400">def</span> <span class="text-green-400">analyze_document</span>(file_path):\n    llm = DeepSeek(model=<span class="text-orange-400">"reasoning"</span>, temp=<span class="text-orange-400">0.2</span>)\n    ctx = RAG_Pipeline.load_embeddings(file_path)\n    \n    <span class="text-purple-400">return</span> llm.generate_summary(context=ctx)\n\n<span class="text-gray-500"># Сгенерирован краткий отчет по BigData 📊</span>`
    },

    {
        filename: "n8n_webhook.py",
        code: `<span class="text-purple-400">import</span> requests, json\n\n<span class="text-blue-400">def</span> <span class="text-green-400">trigger_automation</span>(payload):\n    webhook_url = <span class="text-orange-400">"https://n8n.internal/v1/webhook"</span>\n    headers = {<span class="text-orange-400">"Content-Type"</span>: <span class="text-orange-400">"application/json"</span>}\n    \n    res = requests.post(webhook_url, json=payload)\n    <span class="text-purple-400">if</span> res.status_code == <span class="text-orange-400">200</span>:\n        print(<span class="text-orange-400">"Telegram Broadcast Sent! 🚀"</span>)`
    },

    {
        filename: "GlassEffect.css",
        code: `<span class="text-yellow-400">.premium-card</span> {\n  <span class="text-blue-400">background</span>: <span class="text-orange-400">rgba(255, 255, 255, 0.05)</span>;\n  <span class="text-blue-400">backdrop-filter</span>: <span class="text-purple-400">blur</span>(<span class="text-orange-400">12px</span>);\n  <span class="text-blue-400">-webkit-backdrop-filter</span>: <span class="text-purple-400">blur</span>(<span class="text-orange-400">12px</span>);\n  <span class="text-blue-400">border</span>: <span class="text-orange-400">1px solid rgba(255, 255, 255, 0.1)</span>;\n  <span class="text-blue-400">box-shadow</span>: <span class="text-orange-400">0 8px 32px 0 rgba(0, 0, 0, 0.3)</span>;\n}`
    }
];

const codeElem = document.getElementById('ide-code');
const fileElem = document.getElementById('ide-filename');

let currentSnippetIndex = 0;
let isDeleting = false;
let displayedText = "";
let rawTokens = [];
let currentTokenIndex = 0;
let charIndex = 0;

// Парсинг HTML-строк кода на массив токенов (обычный текст или HTML-тег), чтобы анимация не ломала теги подсветки
function tokenize(htmlString) {
    const tokens = [];
    let i = 0;
    while (i < htmlString.length) {
        if (htmlString[i] === '<') {
            let end = htmlString.indexOf('>', i);
            if (end !== -1) {
                tokens.push({ type: 'tag', value: htmlString.substring(i, end + 1) });
                i = end + 1;
                continue;
            }
        }
        tokens.push({ type: 'char', value: htmlString[i] });
        i++;
    }
    return tokens;
}

function typeEffect() {
    const currentSnippet = ideData[currentSnippetIndex];
    fileElem.textContent = currentSnippet.filename;

    if (!isDeleting && charIndex === 0 && currentTokenIndex === 0) {
        rawTokens = tokenize(currentSnippet.code);
    }

    if (!isDeleting) {
        // Печать
        if (currentTokenIndex < rawTokens.length) {
            const token = rawTokens[currentTokenIndex];
            if (token.type === 'tag') {
                displayedText += token.value;
                currentTokenIndex++;
                typeEffect(); // Мгновенно обрабатываем HTML-тег без задержки
            } else {
                displayedText += token.value;
                currentTokenIndex++;
                charIndex++;
                codeElem.innerHTML = displayedText + '<span class="animate-pulse text-accent-500">|</span>';
                setTimeout(typeEffect, Math.random() * 20 + 20); // Реалистичная скорость печати
            }
        } else {
            // Пауза после завершения печати текста
            isDeleting = true;
            setTimeout(typeEffect, 2500);
        }
    } else {
        // Удаление кода (происходит быстрее, целыми токенами)
        if (rawTokens.length > 0) {
            let lastToken = rawTokens.pop();
            // Если удалили текстовый символ, обновляем счетчик
            if (lastToken.type === 'char') charIndex--;
            
            // Восстанавливаем строку из оставшихся токенов
            displayedText = rawTokens.map(t => t.value).join('');
            codeElem.innerHTML = displayedText + '<span class="animate-pulse text-accent-500">|</span>';
            setTimeout(typeEffect, 10);
        } else {
            // Переход к следующему языку
            isDeleting = false;
            currentTokenIndex = 0;
            charIndex = 0;
            currentSnippetIndex = (currentSnippetIndex + 1) % ideData.length;
            setTimeout(typeEffect, 500);
        }
    }
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    typeEffect();
});