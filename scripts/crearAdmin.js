// Uso: node scripts/crearAdmin.js "Nombre" correo@ejemplo.com contraseña
// Crea (o promueve) un usuario con rol admin. El registro público solo crea clientes.
const bcrypt = require('bcryptjs');
const db = require('../src/config/db');

async function main() {
    const [nombre = 'Administrador', email = 'admin@tienda.com', password = 'admin123'] = process.argv.slice(2);
    const correo = email.trim().toLowerCase();
    const hash = await bcrypt.hash(password, 10);
    const [existe] = await db.query('SELECT id FROM usuarios WHERE email = ?', [correo]);
    if (existe.length) {
        await db.query('UPDATE usuarios SET rol = "admin", password = ? WHERE id = ?', [hash, existe[0].id]);
        console.log(`Usuario ${correo} actualizado a admin`);
    } else {
        await db.query('INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, "admin")', [nombre, correo, hash]);
        console.log(`Admin creado: ${correo} / ${password}`);
    }
    await db.end();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
