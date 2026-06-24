from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = "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"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        message = data.get('message', '')
        image = data.get('image', None)

        messages = [
            {"role": "system", "content": """You are Pune Home Salon assistant.
            Prices: Haircut ₹399, Facial ₹699, Manicure ₹499, Pedicure ₹599, Bridal ₹4999.
            Areas: Kothrud, Baner, Wakad, Viman Nagar.
            Reply in Hinglish, max 2 lines."""},
            {"role": "user", "content": message}
        ]

        # Agar image hai toh vision model
        if image:
            messages[1]["content"] = [
                {"type": "text", "text": message or "Beauty tips do"},
                {"type": "image_url", "image_url": {"url": image}}
            ]
            model = "llama-3.2-90b-vision-preview"
        else:
            model = "llama-3.1-70b-versatile"

        # Groq API call
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {GROQ_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": model,
                "messages": messages,
                "max_tokens": 150,
                "temperature": 0.7
            }
        )

        if response.status_code!= 200:
            return jsonify({"reply": 'AI is a bit busy right now Please book directly using "Book Now" above!'}), 500

        result = response.json()
        reply = result['choices'][0]['message']['content']
        return jsonify({"reply": reply})

    except Exception as e:
        print("Error:", e)
        return jsonify({"reply": 'AI is a bit busy right now, Please book directly using "Book Now" above!'}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)