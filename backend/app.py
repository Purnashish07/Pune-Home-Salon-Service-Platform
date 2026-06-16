# Generated with Claude + Cursor AI
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth
import os
from dotenv import load_dotenv
# import openai  # For AI Stylist chatbot

load_dotenv()
app = Flask(__name__)
CORS(app)

# Firebase Admin - setup prompt from ChatGPT
# cred = credentials.Certificate('firebase-admin-key.json')
# firebase_admin.initialize_app(cred)
# openai.api_key = os.getenv('OPENAI_API_KEY')

SERVICES = [
    {"id": 1, "name": "Haircut at Home Pune", "price": 499, "duration": "45min", "tag": "Popular"},
    {"id": 2, "name": "Bridal Makeup Trial", "price": 2999, "duration": "2hrs", "tag": "Premium"},
    {"id": 3, "name": "Men Grooming Express", "price": 699, "duration": "30min", "tag": "Express"},
    {"id": 4, "name": "Facial & Cleanup", "price": 999, "duration": "60min", "tag": "Relax"}
]

@app.route('/api/services')
def services():
    return jsonify({"data": SERVICES, "city": "Pune"})

@app.route('/api/bookings', methods=['POST'])
def book():
    # token = request.headers.get('Authorization', '').split('Bearer ')[-1]
    # user = auth.verify_id_token(token)  # Firebase verify
    data = request.json
    return jsonify({"success": True, "booking_id": "PNQ123", "message": "Booked!", **data})

@app.route('/api/ai/stylist', methods=['POST'])
def ai_stylist():
    # ChatGPT API integration - prompt engineered with Claude
    # user_msg = request.json['message']
    # response = openai.ChatCompletion.create(
    #   model="gpt-4o",
    #   messages=[{"role": "system", "content": "You are Pune home salon expert"}, {"role": "user", "content": user_msg}]
    # )
    # return jsonify({"reply": response.choices[0].message.content})
    return jsonify({"reply": "AI Stylist: For round face, try layer cut. Book now?"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
