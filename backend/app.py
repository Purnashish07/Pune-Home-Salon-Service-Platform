import json
import time
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
            {"role": "system", "content": """You are Pune Home Salon assistant.python -m http.server 8000
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

@app.route('/api/bookings', methods=['POST'])
def save_booking():
    try:
        data = request.json
        booking_id = data.get('id')
        print(f"[BOOKING] Received booking: ID={booking_id}, Service={data.get('service')}, Price={data.get('price')}, Status={data.get('paymentStatus')}")
        
        # Save to local bookings.json
        bookings_file = os.path.join(os.path.dirname(__file__), 'bookings.json')
        bookings = []
        if os.path.exists(bookings_file):
            try:
                with open(bookings_file, 'r', encoding='utf-8') as f:
                    bookings = json.load(f)
            except Exception:
                bookings = []
                
        # Update booking if it exists, otherwise append
        exists = False
        for i, b in enumerate(bookings):
            if b.get('id') == booking_id:
                bookings[i] = data
                exists = True
                break
        if not exists:
            bookings.append(data)
            
        with open(bookings_file, 'w', encoding='utf-8') as f:
            json.dump(bookings, f, indent=2)
            
        return jsonify({"status": "success", "message": "Booking saved successfully", "bookingId": booking_id})
    except Exception as e:
        print("Error saving booking:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/payment/refund', methods=['POST'])
def initiate_refund():
    try:
        data = request.json
        booking_id = data.get('bookingId')
        amount = data.get('amount')
        
        print(f"[REFUND] Initiating automatic refund of \u20b9{amount} for Booking ID {booking_id}...")
        
        # Save to local refunds.json
        refunds_file = os.path.join(os.path.dirname(__file__), 'refunds.json')
        refunds = []
        if os.path.exists(refunds_file):
            try:
                with open(refunds_file, 'r', encoding='utf-8') as f:
                    refunds = json.load(f)
            except Exception:
                refunds = []
                
        refund_record = {
            "bookingId": booking_id,
            "amount": amount,
            "timestamp": data.get('timestamp') or int(time.time() * 1000),
            "status": "Refunded"
        }
        refunds.append(refund_record)
        with open(refunds_file, 'w', encoding='utf-8') as f:
            json.dump(refunds, f, indent=2)
            
        return jsonify({
            "status": "success",
            "message": f"Refund of \u20b9{amount} initiated successfully for Booking ID {booking_id}"
        })
    except Exception as e:
        print("Error initiating refund:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)