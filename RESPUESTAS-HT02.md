# HT-02 – Respuestas a las preguntas

**1. ¿Qué operaciones CRUD consideraste más desafiantes y por qué?**
Update y Delete. En Update hay que validar los datos igual que en Create y además comprobar que el registro exista (si `affectedRows` es 0, responder 404). En Delete el reto fue la integridad referencial: un producto que ya fue comprado está enlazado en `detalle_compra` con `ON DELETE RESTRICT`, así que MySQL no deja borrarlo; manejé ese error y devuelvo un mensaje claro (409) en lugar de un error 500.

**2. ¿Cómo validas que las operaciones CRUD funcionan correctamente en el sistema?**
Probé cada endpoint con peticiones HTTP (curl/Postman) revisando el código de estado y la respuesta: crear → 201 con el id generado; listar → el producto aparece; actualizar → 200 y el cambio se ve al listar; eliminar → 200 y ya no aparece; id inexistente → 404; datos inválidos → 400; sin token → 401; cliente intentando modificar productos → 403. También verifiqué directamente en MySQL (`SELECT`) que los datos quedaron guardados.

**3. ¿Cuál fue el aspecto más complicado al crear la funcionalidad de actualización (Update) en el servidor y cómo lo resolviste?**
Lo más delicado fue no actualizar datos inválidos ni el registro equivocado. Lo resolví con una función `validProduct` (nombre y categoría no vacíos, precio numérico ≥ 0, stock entero ≥ 0), consultas parametrizadas (`?`) para evitar inyección SQL, y revisando `affectedRows` para devolver 404 si el producto no existe. Además restringí la ruta solo a administradores con JWT.

**4. ¿Qué decisiones tomaste en cuanto al diseño del sistema y por qué?**
- Arquitectura por capas (rutas → controladores → configuración) para separar responsabilidades y facilitar el mantenimiento.
- Pool de conexiones de `mysql2` con promesas para manejar varias peticiones y usar `async/await`.
- Autenticación con JWT y contraseñas cifradas con bcrypt; dos roles: `admin` (gestiona productos) y `cliente` (compra). El registro público solo crea clientes, para que nadie se autoasigne admin.
- Compras con transacción (`beginTransaction`/`commit`/`rollback`) y `SELECT ... FOR UPDATE`, para que el stock nunca quede negativo si dos clientes compran a la vez.
- Precios como `DECIMAL` (no `FLOAT`) para evitar errores de redondeo con dinero.

**5. ¿Qué ajustes o mejoras aplicarías al servidor backend si tuvieras más tiempo o recursos?**
Paginación y búsqueda en `GET /productos`, pruebas automáticas (Jest + Supertest), variables de entorno con `.env` para credenciales, límite de intentos de login (rate limiting) y `helmet`, validación con una librería como Joi/Zod, historial de pedidos por usuario, subida de imágenes de productos, documentación con Swagger y despliegue con Docker.
