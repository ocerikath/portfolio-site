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
                    "content": "Ты — ИИ-ассистент разработчика Хово. Специализируешься на Python, AI Automation и веб-разработке. Отвечай профессионально, кратко и по делу. Если спрашивают что-то специфическое, предлагай связаться в Telegram."
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
        self.wfile.write(json.dumps({"reply": reply_text}).encode())