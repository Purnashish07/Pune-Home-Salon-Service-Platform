# Architecture - Made with Figma AI + ChatGPT

Frontend (Vercel) ← HTTPS → Backend (Render/Railway) ← Admin SDK → Firebase Auth
                                ↓
                          OpenAI API for AI Stylist

Data Flow:
1. User clicks Login → Firebase JS SDK → Google/Email
2. Firebase returns ID token → Sent to Flask `/api/bookings`
3. Flask verifies via firebase-admin → Creates booking
4. Optional: `/api/ai/stylist` → OpenAI → Style suggestion
