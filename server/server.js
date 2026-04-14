require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Importy tras
const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const refuelingRoutes = require('./routes/refuelingRoutes');
const keyLogRoutes = require('./routes/keyLogRoutes');
const companySettingsRoutes = require('./routes/companySettingsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// --- POPRAWIONA KONFIGURACJA CORS ---
const allowedOrigins = [
  'https://longdrive.onrender.com', // Twój frontend na Renderze
  'http://localhost:5173',          // Lokalny frontend Vite
  'http://localhost:3000'           // Dodatkowy port lokalny (opcjonalnie)
];

app.use(cors({
  origin: function (origin, callback) {
    // Zezwalaj na zapytania bez origin (np. Postman, curl, aplikacje mobilne)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS zablokował zapytanie z origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // Kluczowe dla ciasteczek i nagłówków autoryzacji
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
// --- KONIEC KONFIGURACJI CORS ---

app.use(express.json());

// Główne trasy API
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/refuelings', refuelingRoutes);
app.use('/api/key-logs', keyLogRoutes);
app.use('/api/company-settings', companySettingsRoutes);

// Przykładowa chroniona trasa
app.get('/api/protected', require('./middleware/auth').verifyToken, (req, res) => {
  res.json({ message: 'To jest chroniona trasa', user: req.user });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Obsługa błędów 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint nie istnieje' });
});

// Globalna obsługa błędów
app.use((err, req, res, next) => {
  console.error('Nieoczekiwany błąd:', err);
  res.status(500).json({ error: 'Wewnętrzny błąd serwera' });
});

app.listen(PORT, () => {
  console.log(`✅ Serwer LongDrive uruchomiony na porcie ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});
