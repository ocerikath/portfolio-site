import os
import json
import requests
from http.server import BaseHTTPRequestHandler

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # Чтение тела запроса
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data)
        
        # Запрос к OpenRouter
        headers = {
            "Authorization": f"Bearer {os.environ['OPENROUTER_API_KEY']}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ТВОЙ_САЙТ.vercel.app", 
            "X-Title": "Hovo Portfolio"
        }

        payload = {
            "model": "openai/gpt-oss-120b:free",
            "messages": [
                {"role": "system", "content": "Ты - ИИ-ассистент разработчика Хово. Ты профессионален и краток."},
                {"role": "user", "content": data.get("message", "")}
            ],
            "reasoning": {"enabled": True}
        }

        response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload)
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(response.json()['choices'][0]['message']).encode())