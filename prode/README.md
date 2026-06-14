## Requisitos
- Node.js y npm instalados
- MySQL local o remoto

## Pasos de ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Completar el archivo `.env`
Copiar `prode/.env.exmple` a `prode/.env` y completar:
```env
DB_USER=root
DB_PASSWORD=root
DB_NAME=PRODE
DB_HOST=127.0.0.1
DB_PORT=3306
PORT=3000
SESSION_SECRET=esunsecretomuysecreto
```

### 3. Crear y poblar la base
Ejecutar migraciones y seeders con Sequelize CLI.

### 4. Iniciar la aplicación
```bash
npm start
```
