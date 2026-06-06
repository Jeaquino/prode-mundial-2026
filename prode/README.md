

## Requisitos
- Node.js y npm instalados

## Pasos de ejecucion

### 1. Se recomienda instalar pnpm


Antes de instalar pnpm, asegúrate de tener Node.js y npm instalados.

Instala pnpm globalmente con:

```bash
npm install -g pnpm
```

También puedes usar Corepack (incluido en Node.js 16.10+):

```bash
corepack enable
corepack prepare pnpm@latest --activate
```

Una vez instalado, ejecute sobre el path raiz el comando pnpm i para instalar las dependencias requeridas en el proyecto. En caso de no utilizar pnpm, ejecute npm.

### 2. Instalar sequelize-cli
```bash
pnpm install -g sequelize-cli
```

### Comandos útiles para utilizar la orm

```bash
# Crear una migración
sequelize migration:generate --name nombre-migracion

# Ejecutar migraciones
sequelize db:migrate

# Deshacer migraciones
sequelize db:migrate:undo

# Crear un modelo
sequelize model:generate --name NombreModelo --attributes campo1:string,campo2:integer

# Crear un seeder
sequelize seed:generate --name nombre-seeder
```

Ya se encuentra la configuracion en el archivo .sequelizerc por lo cual por medio de un comando van a poder generar la base de datos

### 3. Instalar mysql de forma local

Para instalar MySQL en Windows localmente, sigue estos pasos:

1. Descarga el instalador de MySQL desde https://dev.mysql.com/downloads/installer/.
2. Ejecuta el instalador y elige la opción "Developer Default" o "Server Only".
3. Cuando llegue a la pantalla de configuración, configura una contraseña para el usuario `root` y toma nota.
4. Finaliza la instalación y asegúrate de que el servicio de MySQL esté en ejecución.
5. Opcional: agrega MySQL al PATH para poder usar `mysql` desde la terminal.

Nota: también puedes instalar MySQL Workbench, ya que incluye la instalación del motor de MySQL y herramientas gráficas para administrar tus bases de datos.

Una vez instalado, puedes verificar la instalación con:

```bash
mysql -u root -p
```

Ingresa la contraseña de `root` cuando se solicite. Luego, crea la base de datos que necesites para el proyecto.

### 4. Completar el archivo .env 

Debe copiar o renombrar el archivo .env.example y asignarle el nombre ".env" . Luego completar las variables con las credenciales de su base de datos y el nombre que desea asignarle a la base

### 5. Ejecutar la migreacion de la base

Corriendo el comando pnpm run dbinit, ejecutara las migraciones y seeders. Generando la base de datos y poblandola con los registros minimos requeridos.

### 6. Inicializar la aplicacion

Ejecute el comando pnpm run start en el path raiz para inicializar la app
