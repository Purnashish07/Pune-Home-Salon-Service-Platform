# 🤖 AI Chatbot Setup Guide - Pune Home Salon

## 🎯 Features Added

✅ **Professional AI Chatbot Widget** - Bottom right corner  
✅ **Image Upload Support** - Users can upload images for analysis  
✅ **Vision AI Capabilities** - Analyze hair, makeup, skin conditions  
✅ **No Error Handling** - Works smoothly with fallback responses  
✅ **Mobile Responsive** - Works on all devices  
✅ **Service Integration** - Knows about all salon services & pricing  

---

## 📋 Setup Instructions

### **Step 1: Get OpenAI API Key**

1. Go to https://console.groq.com/keys
2. Sign up or log in to your GroqCloud account
3. Click "Create new secret key"
4. Copy the key (save it safely!)

### **Step 2: Configure Backend**

1. Open `backend/.env` file
2. Replace `sk-your_api_key_here` with your actual OpenAI API key:
   ```
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
   ```

### **Step 3: Install Dependencies**

```bash
cd backend
pip install -r requirements.txt
```

### **Step 4: Run Backend Server**

```bash
python app.py
```

The server will start on `http://localhost:5000`

### **Step 5: Open Frontend**

Open `frontend/index.html` in your browser or deploy it to your hosting.

---

## 🎨 How It Works

### **Chatbot Widget**
- Located at **bottom-right** of the website
- Click the chat bubble icon to open/close
- Modern gradient design (Pink-Purple theme)

### **User Can:**
1. **Type Questions** - Ask about services, prices, beauty tips
2. **Upload Images** - Send photos to get AI recommendations
3. **Get Smart Responses** - Uses GPT-4 Vision API for image analysis
4. **View Recommendations** - AI suggests relevant salon services

### **Example Interactions:**
- ❓ "What's the best service for my face shape?" 
- 🖼️ Upload selfie → AI analyzes & recommends services
- 💰 "What services cost under ₹500?"
- 👗 "I'm getting married in 2 days!"
- 💇 "How to take care of my hair after haircut?"

---

## 🔧 API Endpoint

### **POST** `/api/chat`

**Request:**
```json
{
  "message": "What do you recommend for me?",
  "image": "data:image/jpeg;base64,..." // Optional
}
```

**Response:**
```json
{
  "reply": "Based on your face shape, I recommend our Bridal Makeup or Haircut & Styling service!"
}
```

---

## 🚀 Features

| Feature | Status |
|---------|--------|
| Text Chat | ✅ |
| Image Upload | ✅ |
| AI Vision Analysis | ✅ |
| Service Recommendations | ✅ |
| Error Handling | ✅ |
| Mobile Responsive | ✅ |
| Fallback Responses | ✅ |
| CORS Enabled | ✅ |

---

## 💡 Troubleshooting

### **Chatbot not responding?**
- Check if backend server is running on port 5000
- Verify OpenAI API key is correctly set in `.env`
- Check browser console for errors (F12 → Console tab)

### **"Error: CORS policy"?**
- Backend server must be running
- Make sure `flask-cors` is installed

### **Image upload not working?**
- Use JPG, PNG, or GIF formats
- Keep image size under 5MB
- Check file permissions

### **Backend not starting?**
```bash
pip install -r requirements.txt --upgrade
python app.py
```

---

## 📁 File Structure

```
backend/
├── app.py                 # Flask app with /api/chat endpoint
├── requirements.txt       # Python dependencies
└── .env                   # API keys (add your OpenAI key here!)

frontend/
├── index.html            # Chatbot widget added (bottom-right)
├── app.js                # JavaScript unchanged
└── style.css             # CSS unchanged
```

---

## 🎯 Key Improvements Made

1. **Added Chatbot Widget** - Professional UI in bottom-right corner
2. **Image Upload** - Users can upload and analyze images
3. **Vision AI** - Uses GPT-4o for intelligent image understanding
4. **Smart Responses** - Context-aware answers about salon services
5. **Error Handling** - Fallback responses if API fails
6. **Mobile Friendly** - Works on phones and tablets
7. **CORS Enabled** - No cross-origin issues
8. **XSS Protection** - Escapes HTML in user messages

---

## 🌟 Next Steps

1. ✅ Set your OpenAI API key in `backend/.env`
2. ✅ Install packages: `pip install -r requirements.txt`
3. ✅ Run backend: `python app.py`
4. ✅ Open frontend in browser
5. ✅ Test chatbot by clicking the chat bubble!

---

## 📞 Support

If you face any issues:
1. Check the troubleshooting section above
2. Ensure OpenAI API key is valid
3. Restart the backend server
4. Clear browser cache and reload

**Enjoy your new AI chatbot! 🚀**
