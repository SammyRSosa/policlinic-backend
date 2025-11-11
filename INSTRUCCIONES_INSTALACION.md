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
Conectar 
Perfecto 🔥
Vamos paso a paso — te voy a enseñar **cómo conectar pgAdmin (en Docker)** con tu **contenedor PostgreSQL (también en Docker)** para poder ver tus bases, tablas y datos directamente desde la interfaz web de pgAdmin.

---

## 🧩 1️⃣ Asegúrate de que ambos contenedores estén corriendo

Ejecuta:

```bash
docker ps
```

Deberías ver algo así:

```
CONTAINER ID   NAMES                IMAGE                  STATUS
d4f3b1234abc   policlinic_pgadmin   dpage/pgadmin4:8       Up 2 minutes (healthy)
a7c9d9876def   policlinic_postgres  postgres:15            Up 2 minutes (healthy)
```

👉 Si ambos están corriendo, seguimos.
Si no, levántalos con:

```bash
docker compose -f docker-compose-db.yml up -d
```

---

## 🧩 2️⃣ Accede a **pgAdmin** desde el navegador

Abre tu navegador y ve a:

```
http://localhost:8080
```

(o el puerto que tengas configurado para `pgadmin` en tu `docker-compose-db.yml`).

### Si no recuerdas las credenciales:

Busca en tu archivo YAML algo así:

```yaml
environment:
  - PGADMIN_DEFAULT_EMAIL=admin@correo.com
  - PGADMIN_DEFAULT_PASSWORD=admin123
```

🔑 Esas son las credenciales que usas para iniciar sesión en pgAdmin.

---

## 🧩 3️⃣ Conecta **pgAdmin → PostgreSQL**

Una vez dentro de pgAdmin:

1. En el panel izquierdo, haz clic derecho en **Servers → Register → Server…**
2. Te aparecerá una ventana con dos pestañas: **General** y **Connection**.

### En la pestaña **General**

* **Name:** ponle un nombre identificativo, por ejemplo `PoliclinicDB`

### En la pestaña **Connection**

Completa los siguientes campos:

| Campo                    | Valor                                                 | Explicación                                                                        |
| ------------------------ | ----------------------------------------------------- | ---------------------------------------------------------------------------------- |
| **Host name / address**  | `policlinic_postgres`                                 | Es el **nombre del contenedor de PostgreSQL** (Docker lo resuelve por red interna) |
| **Port**                 | `5432`                                                | Puerto estándar de Postgres                                                        |
| **Maintenance database** | `postgres`                                            | Base inicial (puede ser otra si ya creaste una)                                    |
| **Username**             | `policlinic`                                            | Usuario por defecto de Postgres                                                    |
| **Password**             | la que pusiste en `POSTGRES_PASSWORD` dentro del YAML que seria policlinicpass |                                                                                    |

Luego marca la casilla **Save password** ✅
y pulsa **Save**.

---

## 🧩 4️⃣ Verifica la conexión

* Si todo está bien, verás en el panel izquierdo un nuevo servidor.
* Ábrelo → **Databases → (nombre de tu BD) → Schemas → public → Tables**
* Y ahí ya podrás navegar las tablas, columnas, constraints, datos, etc.

---

## 🧠 ¿Por qué “policlinic_postgres” como Host?

Porque Docker Compose crea una **red interna** donde cada contenedor puede acceder al otro usando su **nombre de servicio**.
Ejemplo (dentro del YAML):

```yaml
services:
  policlinic_postgres:
    image: postgres:15
  policlinic_pgadmin:
    image: dpage/pgadmin4:8
```

Entonces, desde pgAdmin:

```
Host name = policlinic_postgres
```

👉 *No uses `localhost`*, porque eso apuntaría al **contenedor de pgAdmin**, no al de tu máquina.

---