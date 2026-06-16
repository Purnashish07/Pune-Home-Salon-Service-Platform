// Generated with Cursor AI + Claude
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FIREBASE_CONFIG = { /* TODO: Add from Firebase Console */ };

// Firebase Init - code suggested by ChatGPT
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js';
const app = initializeApp(FIREBASE_CONFIG);
const auth = getAuth(app);

// API calls - scaffolded by Cursor
export async function fetchServices() {
  const res = await fetch(`${API_BASE}/services`);
  return res.json();
}

export async function createBooking(data, token) {
  const res = await fetch(`${API_BASE}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify(data)
  });
  return res.json();
}
