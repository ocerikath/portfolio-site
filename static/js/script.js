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
        filename: "ai_rag_agent.py",
        code: `<span class="text-purple-400">import</span> os, asyncio\n<span class="text-purple-400">from</span> google <span class="text-purple-400">import</span> genai\n<span class="text-purple-400">from</span> db <span class="text-purple-400">import</span> VectorStore\n\n<span class="text-blue-400">async def</span> <span class="text-green-400">process_knowledge_base</span>(user_query: <span class="text-orange-400">str</span>):\n    ai_client = genai.Client(api_key=os.getenv(<span class="text-orange-400">"GEMINI_API_KEY"</span>))\n    vectordb = VectorStore(collection=<span class="text-orange-400">"documents"</span>)\n    \n    <span class="text-gray-500"># Поиск релевантного контекста для RAG</span>\n    context = <span class="text-purple-400">await</span> vectordb.search(user_query, limit=<span class="text-orange-400">3</span>)\n    prompt = <span class="text-orange-400">f"Context: {context}\\n\\nQuery: {user_query}"</span>\n    \n    response = <span class="text-purple-400">await</span> ai_client.models.generate_content(\n        model=<span class="text-orange-400">"gemini-2.5-flash"</span>,\n        contents=prompt\n    )\n    <span class="text-purple-400">return</span> response.text`
    },
    {
        filename: "n8n_pipeline.py",
        code: `<span class="text-purple-400">import</span> requests, json\n<span class="text-purple-400">from</span> fastapi <span class="text-purple-400">import</span> FastAPI, HTTPException\n\napp = FastAPI(title=<span class="text-orange-400">"AutomationBridge"</span>)\n\n<span class="text-purple-400">@app</span>.post(<span class="text-orange-400">"/v1/webhook/habr-sync"</span>)\n<span class="text-blue-400">def</span> <span class="text-green-400">sync_rss_to_telegram</span>(payload: <span class="text-orange-400">dict</span>):\n    n8n_webhook = <span class="text-orange-400">"https://n8n.internal/flow/v12"</span>\n    \n    <span class="text-purple-400">try</span>:\n        <span class="text-gray-500"># Перенаправляем разобранные данные в воркфлоу</span>\n        res = requests.post(n8n_webhook, json=payload, timeout=<span class="text-orange-400">5</span>)\n        res.raise_for_status()\n        <span class="text-purple-400">return</span> {<span class="text-orange-400">"status"</span>: <span class="text-orange-400">"dispatched"</span>, <span class="text-orange-400">"id"</span>: res.json().get(<span class="text-orange-400">"id"</span>)}\n    <span class="text-purple-400">except</span> requests.RequestException <span class="text-purple-400">as</span> err:\n        <span class="text-purple-400">raise</span> HTTPException(status_code=<span class="text-orange-400">500</span>, detail=str(err))`
    },
    {
        filename: "stream_chat.js",
        code: `<span class="text-purple-400">async function</span> <span class="text-green-400">fetchAiStream</span>(promptMessage) {\n  <span class="text-purple-400">const</span> response = <span class="text-purple-400">await</span> <span class="text-blue-400">fetch</span>(<span class="text-orange-400">'/api/chat/stream'</span>, {\n    method: <span class="text-orange-400">'POST'</span>,\n    body: JSON.<span class="text-blue-400">stringify</span>({ message: promptMessage })\n  });\n\n  <span class="text-purple-400">const</span> reader = response.body.<span class="text-blue-400">getReader</span>();\n  <span class="text-purple-400">const</span> decoder = <span class="text-blue-400">new</span> <span class="text-green-400">TextDecoder</span>();\n  \n  <span class="text-purple-400">while</span> (<span class="text-orange-400">true</span>) {\n    <span class="text-purple-400">const</span> { value, done } = <span class="text-purple-400">await</span> reader.<span class="text-blue-400">read</span>();\n    <span class="text-purple-400">if</span> (done) <span class="text-purple-400">break</span>;\n    \n    <span class="text-purple-400">const</span> chunk = decoder.<span class="text-blue-400">decode</span>(value, { stream: <span class="text-orange-400">true</span> });\n    appendMessageChunk(chunk); <span class="text-gray-500">// Живой вывод UI ассистента</span>\n  }\n}`
    },
    {
        filename: "telegram_bot.py",
        code: `<span class="text-purple-400">from</span> aiogram <span class="text-purple-400">import</span> Bot, Dispatcher, types\n<span class="text-purple-400">from</span> handlers <span class="text-purple-400">import</span> doc_analyzer\n\nbot = Bot(token=os.getenv(<span class="text-orange-400">"TELEGRAM_BOT_TOKEN"</span>))\ndp = Dispatcher()\n\n<span class="text-purple-400">@dp</span>.message(types.ContentType.DOCUMENT)\n<span class="text-blue-400">async def</span> <span class="text-green-400">handle_user_document</span>(message: types.Message):\n    <span class="text-gray-500"># Бот принимает файл из Google Drive или локально</span>\n    await message.reply(<span class="text-orange-400">"Анализирую документ... ⏳"</span>)\n    summary = <span class="text-purple-400">await</span> doc_analyzer.summarize(message.document)\n    \n    <span class="text-purple-400">await</span> message.reply_document(summary, caption=<span class="text-orange-400">"Готово!"</span>)\n\n<span class="text-purple-400">if</span> __name__ == <span class="text-orange-400">"__main__"</span>:\n    dp.run_polling(bot)`
    },
    {
        filename: "LiquidGlass.css",
        code: `<span class="text-yellow-400">.liquid-glass-card</span> {\n  <span class="text-blue-400">background</span>: <span class="text-orange-400">rgba(255, 255, 255, 0.03)</span>;\n  <span class="text-blue-400">backdrop-filter</span>: <span class="text-purple-400">blur</span>(<span class="text-orange-400">16px</span>) <span class="text-purple-400">saturate</span>(<span class="text-orange-400">120%</span>);\n  <span class="text-blue-400">border-radius</span>: <span class="text-orange-400">1.25rem</span>;\n  <span class="text-blue-400">border</span>: <span class="text-orange-400">1px solid rgba(255, 255, 255, 0.08)</span>;\n  <span class="text-blue-400">box-shadow</span>: <span class="text-orange-400">0 20px 50px rgba(0, 0, 0, 0.4)</span>;\n  <span class="text-blue-400">transition</span>: <span class="text-orange-400">all 0.4s ease-in-out</span>;\n}\n\n<span class="text-yellow-400">.liquid-glass-card:hover</span> {\n  <span class="text-blue-400">border-color</span>: <span class="text-orange-400">rgba(var(--accent-rgb), 0.3)</span>;\n  <span class="text-blue-400">transform</span>: <span class="text-purple-400">translateY</span>(<span class="text-orange-400">-4px</span>);\n}`
    },
    {
        filename: "index.html",
        code: `<span class="text-gray-500">&lt;!-- Dynamic Portfolio Layout --&gt;</span>\n<span class="text-red-400">&lt;section</span> <span class="text-yellow-400">id</span>=<span class="text-orange-400">"portfolio"</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"relative min-h-screen bg-gray-900"</span><span class="text-red-400">&gt;</span>\n  <span class="text-red-400">&lt;div</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"max-w-7xl mx-auto px-6 py-24"</span><span class="text-red-400">&gt;</span>\n    <span class="text-red-400">&lt;div</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"absolute top-0 right-0 w-96 h-96 bg-accent-500/10 blur-3xl"</span><span class="text-red-400">&gt;&lt;/div&gt;</span>\n    \n    <span class="text-red-400">&lt;div</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"grid grid-cols-1 lg:grid-cols-2 gap-12"</span><span class="text-red-400">&gt;</span>\n      <span class="text-red-400">&lt;h2</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"text-4xl font-extrabold text-white"</span><span class="text-red-400">&gt;</span>\n        Featured Automation Flows\n      <span class="text-red-400">&lt;/h2&gt;</span>\n      <span class="text-red-400">&lt;div</span> <span class="text-yellow-400">id</span>=<span class="text-orange-400">"projects"</span> <span class="text-yellow-400">class</span>=<span class="text-orange-400">"grid gap-6"</span><span class="text-red-400">&gt;&lt;/div&gt;</span>\n    <span class="text-red-400">&lt;/div&gt;</span>\n  <span class="text-red-400">&lt;/div&gt;</span>\n<span class="text-red-400">&lt;/section&gt;</span>`
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
                setTimeout(typeEffect, Math.random() * 15 + 15); // Реалистичная скорость печати
            }
        } else {
            // Пауза после завершения печати текста
            isDeleting = true;
            setTimeout(typeEffect, 3000);
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