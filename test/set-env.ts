// test/set-env.ts
import * as dotenv from 'dotenv';
import { join } from 'path';

// Cargar variables de entorno de prueba
dotenv.config({ 
  path: join(__dirname, '..', '.env.test') 
});

console.log('🧪 Entorno de pruebas configurado');
console.log('📦 Base de datos de prueba:', process.env.DB_NAME);