# Generated with Claude + Cursor AI
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import base64
from io import BytesIO
import requests
import json

load_dotenv()
app = Flask(__name__)
CORS(app)

# Firebase Admin - setup prompt from ChatGPT
# Uncomment below if you want to enable Firebase authentication
# import firebase_admin
# from firebase_admin import credentials, auth
# cred = credentials.Certificate('firebase-admin-key.json')
# firebase_admin.initialize_app(cred)

# OpenAI API Key
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

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

@app.route('/api/chat', methods=['POST'])
def chat():
    """AI Chatbot endpoint that handles text and image queries"""
    try:
        data = request.json
        user_message = data.get('message', '').strip()
        image_data = data.get('image')

        # If no API key, return fallback response
        if not OPENAI_API_KEY:
            return handle_fallback_response(user_message, image_data)

        # Build the message content
        content = []
        
        # Add text if provided
        if user_message:
            content.append({
                "type": "text",
                "text": f"""You are a helpful Salon AI Assistant for Pune Home Salon, a professional home-based beauty service in Pune. 
                
Available Services:
- Haircut & Styling (₹399, 45 mins)
- Facial & Cleanup (₹699, 60 mins)
- Manicure (₹499, 40 mins)
- Pedicure (₹599, 50 mins)
- Bridal Makeup (₹4999, 3-4 hours)
- Body Massage (₹1199, 90 mins)

Please provide helpful, friendly responses about our services, beauty tips, and recommendations. Keep responses concise (2-3 sentences max).

User Question: {user_message}"""
            })
        
        # Add image if provided
        if image_data and image_data.startswith('data:image'):
            # Remove the data URL prefix and decode
            try:
                image_base64 = image_data.split(',')[1]
                image_type = image_data.split(';')[0].split(':')[1]  # e.g., "image/jpeg"
                
                content.append({
                    "type": "image_url",
                    "image_url": {
                        "url": image_data
                    }
                })
                
                if user_message:
                    # Update text to mention the image
                    content[0]["text"] = f"""You are a helpful Salon AI Assistant for Pune Home Salon. 
                    
Available Services:
- Haircut & Styling (₹399, 45 mins)
- Facial & Cleanup (₹699, 60 mins)
- Manicure (₹499, 40 mins)
- Pedicure (₹599, 50 mins)
- Bridal Makeup (₹4999, 3-4 hours)
- Body Massage (₹1199, 90 mins)

The user has uploaded an image and asked: {user_message}

Analyze the image and provide helpful salon recommendations based on what you see. Keep responses concise (2-3 sentences max)."""
                else:
                    content.append({
                        "type": "text",
                        "text": "You are a helpful Salon AI Assistant for Pune Home Salon. Analyze this image and suggest relevant salon services. Keep response concise (2-3 sentences max)."
                    })
            except Exception as e:
                print(f"Error processing image: {e}")
                pass
        
        if not content:
            return jsonify({"reply": "Please ask something or upload an image!"}), 400

        # Call OpenAI Vision API
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {OPENAI_API_KEY}"
        }
        
        payload = {
            "model": "gpt-4-vision-preview" if image_data else "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "user",
                    "content": content if image_data else content[0]["text"]
                }
            ],
            "max_tokens": 500,
            "temperature": 0.7
        }
        
        # Try with gpt-4o (latest vision model)
        if image_data:
            payload["model"] = "gpt-4o"
        
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            ai_reply = result['choices'][0]['message']['content']
            return jsonify({"reply": ai_reply})
        else:
            # Fallback if API call fails
            return handle_fallback_response(user_message, image_data)
            
    except Exception as e:
        print(f"Chat error: {e}")
        return jsonify({"reply": "Sorry, I encountered an error. Please try again or check back soon!"}), 500

def handle_fallback_response(user_message, image_data):
    """Fallback responses when OpenAI API is not available"""
    responses = {
        "hair": "Great question! Our Haircut & Styling service is ₹399 and takes 45 minutes. Our expert stylists will give you a professional cut and styling. Would you like to book? 💇",
        "makeup": "For makeup services, we offer Bridal Makeup (₹4999) and regular makeup touch-ups. Want to book with our premium makeup artists? 💄",
        "facial": "Our Facial & Cleanup is ₹699 for 60 mins - perfect for glowing skin! Includes deep cleanse and nourishing treatment. 🧖‍♀️",
        "massage": "Try our Body Massage (₹1199, 90 mins) with Ayurvedic oils for complete relaxation! Perfect after a long day. 💆‍♀️",
        "manicure": "Our Manicure is ₹499 for 40 mins with premium nail polish & nail art options! 💅",
        "pedicure": "Pedicure service is ₹599 for 50 mins - includes foot soak, scrub, massage & callus removal. ✨",
        "price": "Our services range from ₹399-₹4999. Budget-friendly options: Haircut (₹399), Express Grooming (₹699), Facial (₹699)! 💰",
        "booking": "You can book any service directly through our website! Select your service, date, time, and we'll assign a verified professional. 📅",
        "default": "I'm here to help! Ask me about our services, prices, or beauty tips. You can also upload an image for personalized recommendations! 😊"
    }
    
    # Simple keyword matching for fallback
    msg_lower = user_message.lower()
    for keyword, response in responses.items():
        if keyword in msg_lower:
            return jsonify({"reply": response})
    
    return jsonify({"reply": responses["default"]})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
