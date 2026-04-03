const { Pool } = require('pg');
const bcrypt = require('bcrypt');

// Konfiguracja połączenia z PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' 
    ? { rejectUnauthorized: false } 
    : false,
  // Dodatkowe opcje dla lepszej wydajności
  max: 20, // maksymalna liczba klientów w puli
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Funkcja inicjalizująca wszystkie tabele
const initDatabase = async () => {
  try {
    console.log('🔄 Inicjalizacja bazy danych PostgreSQL...');

    // Tabela użytkowników
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela pojazdów
    await pool.query(`
      CREATE TABLE IF NOT EXISTS vehicles (
        id SERIAL PRIMARY KEY,
        make TEXT NOT NULL,
        model TEXT NOT NULL,
        registrationNumber TEXT UNIQUE NOT NULL,
        year INTEGER,
        mileage INTEGER DEFAULT 0,
        fuelLevel REAL DEFAULT 0,
        tankSize REAL DEFAULT 50,
        fuelConsumption REAL DEFAULT 7.5,
        status TEXT DEFAULT 'available',
        vehicleType TEXT,
        fuelType TEXT,
        engineCapacity INTEGER,
        bodyType TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela kierowców
    await pool.query(`
      CREATE TABLE IF NOT EXISTS drivers (
        id SERIAL PRIMARY KEY,
        firstName TEXT NOT NULL,
        lastName TEXT NOT NULL,
        licenseNumber TEXT UNIQUE,
        phone TEXT,
        email TEXT,
        status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela tras - z WSZYSTKIMI potrzebnymi kolumnami
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trips (
        id SERIAL PRIMARY KEY,
        vehicleId INTEGER REFERENCES vehicles(id) ON DELETE SET NULL,
        driverId INTEGER REFERENCES drivers(id) ON DELETE SET NULL,
        startTime TIMESTAMP,
        endTime TIMESTAMP,
        startOdometer INTEGER DEFAULT 0,
        endOdometer INTEGER DEFAULT 0,
        startLocation TEXT,
        endLocation TEXT,
        purpose TEXT,
        status TEXT DEFAULT 'planned',
        startFuel REAL DEFAULT 0,
        endFuel REAL DEFAULT 0,
        fuelUsed REAL DEFAULT 0,
        distance INTEGER DEFAULT 0,
        fuelAdded REAL DEFAULT 0,
        fuelCost REAL DEFAULT 0,
        fuelReceiptNumber TEXT,
        fuelStation TEXT,
        notes TEXT,
        orderedBy TEXT,
        cardNumber TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela lokalizacji w trakcie trasy
    await pool.query(`
      CREATE TABLE IF NOT EXISTS trip_locations (
        id SERIAL PRIMARY KEY,
        tripId INTEGER REFERENCES trips(id) ON DELETE CASCADE,
        lat REAL,
        lng REAL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela serwisów
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id SERIAL PRIMARY KEY,
        vehicleId INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        date DATE,
        description TEXT,
        cost REAL,
        odometer INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela tankowań
    await pool.query(`
      CREATE TABLE IF NOT EXISTS refuelings (
        id SERIAL PRIMARY KEY,
        vehicleId INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        date DATE,
        liters REAL,
        cost REAL,
        mileage INTEGER,
        invoiceNumber TEXT,
        notes TEXT,
        fullTank BOOLEAN DEFAULT FALSE,
        tripId INTEGER REFERENCES trips(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela logów kluczyków
    await pool.query(`
      CREATE TABLE IF NOT EXISTS key_logs (
        id SERIAL PRIMARY KEY,
        vehicleId INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
        driverId INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
        action TEXT CHECK (action IN ('issued', 'returned')),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Tabela ustawień firmy - Z PEŁNYMI KOLUMNAMI
    await pool.query(`
      CREATE TABLE IF NOT EXISTS company_settings (
        id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        name TEXT,
        address TEXT,
        zipCode TEXT,
        city TEXT,
        nip TEXT,
        regon TEXT,
        tripNumberPrefix TEXT,
        tripNumberNext INTEGER DEFAULT 1,
        phone TEXT,
        email TEXT,
        website TEXT,
        logo TEXT,
        cardPrefix TEXT DEFAULT 'KD',
        cardCounter INTEGER DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Funkcja do automatycznej aktualizacji updated_at
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    // Trigger dla vehicles
    await pool.query(`
      DROP TRIGGER IF EXISTS update_vehicles_updated_at ON vehicles;
      CREATE TRIGGER update_vehicles_updated_at
        BEFORE UPDATE ON vehicles
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Trigger dla company_settings
    await pool.query(`
      DROP TRIGGER IF EXISTS update_company_settings_updated_at ON company_settings;
      CREATE TRIGGER update_company_settings_updated_at
        BEFORE UPDATE ON company_settings
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    // Wstaw domyślne ustawienia, jeśli nie istnieją
    const settingsResult = await pool.query('SELECT * FROM company_settings WHERE id = 1');
    if (settingsResult.rows.length === 0) {
      await pool.query(`
        INSERT INTO company_settings (id, name, tripNumberPrefix, tripNumberNext, cardPrefix, cardCounter)
        VALUES (1, 'Moja Firma', 'TRIP-', 1, 'KD', 1)
      `);
      console.log('✅ Domyślne ustawienia firmy utworzone');
    }

    // Dodanie domyślnego użytkownika admin
    const adminResult = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@longdrive.pl']);
    if (adminResult.rows.length === 0) {
      const saltRounds = 10;
      const defaultPassword = 'admin123';
      const hash = await bcrypt.hash(defaultPassword, saltRounds);
      await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        ['Administrator', 'admin@longdrive.pl', hash, 'admin']
      );
      console.log('✅ Domyślny użytkownik admin utworzony (admin@longdrive.pl / admin123)');
    }

    console.log('✅ Baza danych PostgreSQL zainicjalizowana pomyślnie');
  } catch (error) {
    console.error('❌ Błąd inicjalizacji bazy danych:', error);
    throw error;
  }
};

// Test połączenia i inicjalizacja
pool.connect(async (err, client, release) => {
  if (err) {
    console.error('❌ Błąd połączenia z PostgreSQL:', err.stack);
    return;
  }
  
  console.log('✅ Połączono z PostgreSQL');
  release();
  
  // Inicjalizuj tabele
  await initDatabase();
});

// Funkcje pomocnicze do konwersji nazw pól (SQLite -> PostgreSQL)
const toSnakeCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
};

const toCamelCase = (obj) => {
  if (!obj) return obj;
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
};

// Wrapowanie zapytań dla łatwiejszego przejścia z SQLite
const query = async (sql, params = []) => {
  try {
    const result = await pool.query(sql, params);
    return {
      rows: result.rows,
      rowCount: result.rowCount,
      lastID: result.rows[0]?.id || null
    };
  } catch (error) {
    console.error('Błąd zapytania SQL:', error);
    throw error;
  }
};

// Eksportuj pool i funkcje pomocnicze
module.exports = {
  pool,
  query,
  toSnakeCase,
  toCamelCase,
  // Dla kompatybilności z kodem napisanym dla SQLite
  run: async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return { lastID: result.rows[0]?.id, changes: result.rowCount };
    } catch (error) {
      console.error('Błąd w run():', error);
      throw error;
    }
  },
  get: async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Błąd w get():', error);
      throw error;
    }
  },
  all: async (sql, params = []) => {
    try {
      const result = await pool.query(sql, params);
      return result.rows;
    } catch (error) {
      console.error('Błąd w all():', error);
      throw error;
    }
  }
};