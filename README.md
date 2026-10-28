# HT-02 – Backend de inventario (Node.js + Express + MySQL)

## Requisitos
Node.js 18+ y MySQL (o XAMPP/MariaDB).

## Puesta en marcha
```bash
npm install
mysql -u root -p --default-character-set=utf8mb4 < database.sql          # crea la BD y las tablas
mysql -u root -p --default-character-set=utf8mb4 < datos_ejemplo.sql     # (opcional) productos de prueba
npm run crear-admin                                                       # crea admin@tienda.com / admin123
npm start                                                                 # http://localhost:3000
```

El registro público (`/api/auth/register`) crea **clientes** intencionalmente. Para crear un administrador, ejecuta `npm run crear-admin`. Puedes indicar nombre, correo y contraseña propios:

```bash
npm run crear-admin -- "Administradora" "admin@tienda.com" "UnaClaveSegura"
```

En Windows PowerShell, si MySQL tiene contraseña, configura la variable antes de crear el admin y antes de iniciar el servidor:

```powershell
$env:DB_PASSWORD = "tuclave"
npm run crear-admin -- "Administradora" "admin@tienda.com" "UnaClaveSegura"
npm start
```

Variables opcionales: `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `PORT`, `JWT_SECRET`. En producción configura `JWT_SECRET` con un valor secreto y estable.

## Endpoints
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /api/auth/register | público | Registra cliente |
| POST | /api/auth/login | público | Devuelve token JWT |
| GET | /api/productos | público | Lista productos (Read) |
| POST | /api/productos | admin | Crea producto (Create) |
| POST | /api/productos/masivo | admin | Crea varios productos |
| PUT | /api/productos/:id | admin | Actualiza producto (Update) |
| DELETE | /api/productos/:id | admin | Elimina producto (Delete) |
| POST | /api/compras | cliente | Registra compra y descuenta stock |

## Obtener el token y crear productos

Crear el administrador no genera el token. Inicia sesión con ese usuario en `POST /api/auth/login`; la respuesta incluye `token` y el rol `admin`. En PowerShell:

```powershell
$login = Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/auth/login" `
  -ContentType "application/json" `
  -Body (@{ email = "admin@tienda.com"; password = "UnaClaveSegura" } | ConvertTo-Json)

$token = $login.token
```

Usa ese token como `Bearer` al llamar a una ruta protegida. Por ejemplo, para crear un producto:

```powershell
Invoke-RestMethod -Method Post `
  -Uri "http://localhost:3000/api/productos" `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" `
  -Body (@{
    nombre = "Audífonos Bluetooth"
    categoria = "Audio"
    precio = 89.90
    stock = 25
  } | ConvertTo-Json)
```

Si recibes `403`, inicia sesión con una cuenta cuyo rol sea `admin`; si recibes `401`, comprueba que envías `Authorization: Bearer <token>` y que el token no haya expirado. El token dura un día.
