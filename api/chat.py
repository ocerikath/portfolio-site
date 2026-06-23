import os
import json
import requests
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Читаем тело запроса
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        # Получаем API ключ из переменных окружения
        api_key = os.environ.get('OPENROUTER_API_KEY')
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://your-portfolio-site.vercel.app", 
            "X-Title": "Hovo Portfolio Assistant"
        }

        payload = {
            "model": "openai/gpt-oss-120b:free",

            "messages": [
                {
                    "role": "system", 
                    "content": """
                        Ты — AI-ассистент разработчика Хово. 
                        Твоя задача — кратко и структурированно отвечать посетителям сайта.

                        Твои знания:
                        - Python, AI Automation (LLM, n8n), веб-разработка (Django, Flask, React).

                        Правила форматирования:
                        1. Используй **Markdown** для оформления: **жирный текст** для акцентов, списки для перечислений.
                        2. Делай переносы строк (\n) между логическими блоками. Ответ не должен быть «стеной текста».
                        3. Будь кратким (макс. 3-4 предложения в ответе).

                        Правила взаимодействия:
                        1. Если спрашивают про Хово — давай краткий обзор навыков. В конце ответа добавь: «Хотите обсудить проект? Пишите в [Telegram](https://t.me/ТВОЙ_НИК)».
                        2. Не придумывай факты. Если чего-то не знаешь — вежливо перенаправь к Хово.
                        3. Отвечай только на русском языке.
                        """
                },
                {"role": "user", "content": data.get("message", "")}
            ],
            "reasoning": {"enabled": True}
        }

        try:
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
            res_json = response.json()
            
            # Извлекаем ответ
            reply_text = res_json['choices'][0]['message'].get('content', 'Извините, ответ не был получен.')
            
            self.send_response(200)
        except Exception as e:
            reply_text = "Ошибка сервера при общении с AI. Попробуйте позже."
            self.send_response(500)

        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"reply": reply_text}, ensure_ascii=False).encode('utf-8'))