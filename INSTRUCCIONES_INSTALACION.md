Requirements:
Instalar NVM (Node Version Manager)
Node.js 20 LTS
Instalar NestJS CLI globalmente
Instalar Docker

Imagenes necesarias para correr docker-compose
docker pull postgres:15
docker pull mongo:7
docker pull dpage/pgadmin4:8



Despues de tener todo instalado para ejecutarlo la primera vez hace falta
en la Carpeta del backend
npm install 
docker compose up -d
npm run start:dev 

en la carpeta del front
Para ejecutar el front
npm install ( creo que aqui falta agregarle --legacy-peer-dep)
npm run dev





NOTAS SOBRE COMO CONFIGURAR PGADMIN (SOLO PARA CUANDO SEA NECESARIO HACERLO PARA TRABAJAR CON LA BASE DE DATOS)

---

# ✅ **NOTAS SOBRE CÓMO CONFIGURAR PGADMIN con las referencias al docker-compose.yml**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    container_name: policlinic_postgres
    environment:
      POSTGRES_USER: policlinic
      POSTGRES_PASSWORD: policlinicpass
      POSTGRES_DB: poldb
    ports:
      - "5436:5432"
```

```yaml
  pgadmin:
    image: dpage/pgadmin4:8
    container_name: policlinic_pgadmin
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@policlinic.com
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
```

---

# 🧩 **1️⃣ Verifica que PostgreSQL y pgAdmin están corriendo**

Ejecuta:

```bash
docker ps
```

Debes ver los contenedores definidos en tu compose:

### Fragmento del compose:

```yaml
container_name: policlinic_postgres
container_name: policlinic_pgadmin
```

Si no aparecen:

```bash
docker compose up -d
```

---

# 🧩 **2️⃣ Abrir pgAdmin**

En tu docker compose, pgAdmin expone el puerto:

```yaml
ports:
  - "5050:80"
```

Esto significa:

📌 **pgAdmin URL:**

```
http://localhost:5050
```

### Credenciales (según compose):

```yaml
PGADMIN_DEFAULT_EMAIL: admin@policlinic.com
PGADMIN_DEFAULT_PASSWORD: admin123
```

Úsalas para iniciar sesión.

---

# 🧩 **3️⃣ Registrar PostgreSQL dentro de pgAdmin**

Una vez dentro:

1. Clic derecho en **Servers**
2. → **Register**
3. → **Server…**

---

## 🏷️ **Pestaña General**

**Name:**

```
PoliclinicDB
```

(Tú eliges el nombre, no afecta la conexión)

---

## 🔌 **Pestaña Connection**

A continuación, cada campo con su valor + referencia al compose.

---

### ✔ **Host name / Address**

💡 Lo tomamos de:

```yaml
container_name: policlinic_postgres
```

📌 Usar:

```
policlinic_postgres
```

---

### ✔ **Port**

En el compose:

```yaml
ports:
  - "5436:5432"
```

* **5436** = puerto externo
* **5432** = puerto interno del contenedor

pgAdmin está dentro de Docker → debe usar el **puerto interno**.

📌 Usar:

```
5432
```

---

### ✔ **Maintenance database**

Lo tomamos de:

```yaml
POSTGRES_DB: poldb
```

📌 Usar:

```
poldb
```

---

### ✔ **Username**

Del compose:

```yaml
POSTGRES_USER: policlinic
```

📌 Usar:

```
policlinic
```

---

### ✔ **Password**

Del compose:

```yaml
POSTGRES_PASSWORD: policlinicpass
```

📌 Usar:

```
policlinicpass
```

---

### ✔ Marcar "Save Password"

Para no tener que escribirla cada vez.

Finalmente clic en:

```
Save
```

---

# 🧩 **4️⃣ Verificar la conexión**

Si todo está bien verás:

```
Servers
 └── PoliclinicDB
      └── Databases
            └── poldb
                 └── Schemas
                      └── public
```

---

# ⭐ RESUMEN FINAL DE VALORES CON FUENTE EN EL COMPOSE

| Campo pgAdmin          | Valor a usar            | De dónde sale en docker-compose       |
| ---------------------- | ----------------------- | ------------------------------------- |
| Host                   | `policlinic_postgres`   | `container_name: policlinic_postgres` |
| Port                   | `5432`                  | `"5436:5432"` (puerto interno)        |
| Maintenance DB         | `poldb`                 | `POSTGRES_DB: poldb`                  |
| Username               | `policlinic`            | `POSTGRES_USER: policlinic`           |
| Password               | `policlinicpass`        | `POSTGRES_PASSWORD: policlinicpass`   |
| Login pgAdmin email    | `admin@policlinic.com`  | `PGADMIN_DEFAULT_EMAIL`               |
| Login pgAdmin password | `admin123`              | `PGADMIN_DEFAULT_PASSWORD`            |
| URL pgAdmin            | `http://localhost:5050` | `"5050:80"`                           |

---

Si quieres, te genero esta guía **en formato README.md** lista para copiar a tu repositorio. ¿Quieres que te la prepare?
