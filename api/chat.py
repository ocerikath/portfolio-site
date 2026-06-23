import os
import json
from http.server import BaseHTTPRequestHandler
import requests

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        user_message = data.get("message", "")
        
        # Системный промпт (информация о тебе)
        system_prompt = """
        Ты — ИИ-ассистент разработчика Хово.
        Твоя специализация: Python, AI Automation (LLM, n8n), веб-разработка.
        Твой тон: профессиональный, лаконичный, деловой, дружелюбный.
        Если тебя спрашивают о коде или услугах, отвечай кратко и предлагай связаться в Telegram.
        """

        # Запрос к OpenRouter
        headers = {
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://твое-портфолио.vercel.app", 
            "X-Title": "Hovo Portfolio Assistant"
        }

        payload = {
            "model": "openai/gpt-oss-120b:free",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message}
            ],
            "reasoning": {"enabled": True}
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        res_data = response.json()
        
        reply = res_data['choices'][0]['message']['content']

        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({"reply": reply}).encode())