import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

console.log('--- LIMPIEZA DE USUARIOS REGISTRADOS ---');

try {
  let count = 0;
  if (fs.existsSync(USERS_FILE)) {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    const users = JSON.parse(raw);
    count = Array.isArray(users) ? users.length : 0;
  }

  // Vaciar completamente el archivo
  fs.writeFileSync(USERS_FILE, '[]\n', 'utf-8');
  console.log(`✅ Se borraron exitosamente ${count} usuarios/personas almacenadas.`);
  console.log('✅ Archivo data/users.json restablecido a [] (0 usuarios).');
  console.log('✅ El sistema iniciará nuevamente pidiendo la creación del primer Administrador.');
} catch (err) {
  console.error('❌ Error al limpiar usuarios:', err.message);
  process.exit(1);
}
