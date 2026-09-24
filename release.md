# Релиз на прод (davedivine.com)

Стек: Next.js (Node-сервер, `next start`, не serverless/static), SQLite через Prisma
(`prisma/dev.db`), загруженные файлы на диске (`uploads/`), админка на next-auth.

Важно: **SQLite-файл и папка `uploads/` — это единственное хранилище данных сайта.**
Их нельзя терять при деплое и нужно бэкапить. Ниже это учтено.

Сервер — Ubuntu, на нём уже крутится несколько сайтов (в т.ч. что-то на порту
3001, судя по `ss -tulpn`). Процесс держим через **systemd** (без pm2 — он не
установлен и не нужен, systemd есть из коробки и сам переживает перезагрузку
сервера). Порт и nginx-конфиг подгони под то, как оформлены соседние сайты на
этом сервере (ниже — общий шаблон, значения в `<...>` — заполнить).

Node/npm стоят через nvm под root: `/root/.nvm/versions/node/v22.23.2/bin/npm`.
Порт сайта — **3002** (3001 и 3411 уже заняты другими процессами на сервере).
Systemd не подхватывает shell-профиль (nvm подключается через `.bashrc`),
поэтому в юните ниже путь к npm и `PATH` прописаны явно, а сервис запускается
от `root` (раз node установлен в root-профиль).

---

## 1. Первый деплой (разово)

1. Склонировать репозиторий на сервер, в свою директорию (например
   `/var/www/davedevine`):
   ```bash
   git clone https://github.com/wladyslaw-wor/dave_site.git /var/www/davedevine
   cd /var/www/davedevine
   ```

2. Создать `.env` в корне проекта (не коммитить, .gitignore уже это исключает):
   ```bash
   DATABASE_URL="file:./prisma/dev.db"

   SITE_URL="https://davedivine.com"
   NEXTAUTH_URL="https://davedivine.com"
   NEXTAUTH_SECRET="<сгенерировать: openssl rand -base64 32>"

   ADMIN_USERNAME="<свой логин>"
   ADMIN_PASSWORD="<свой сильный пароль, не оставлять дефолтный>"

   UPLOADS_DIR="./uploads"
   ```

3. Установить зависимости, накатить базу и собрать проект:
   ```bash
   npm ci                     # postinstall сам вызовет `prisma generate`
   npx prisma migrate deploy  # применяет миграции к prisma/dev.db, создаёт файл при первом запуске
   npm run db:seed            # создаёт админа (ADMIN_USERNAME/ADMIN_PASSWORD из .env) и дефолтный контент
   npm run build
   ```
   Важно: логин в админку проверяется по таблице `AdminUser` в базе, а не по
   `.env` напрямую — её заполняет только `db:seed`, и только если пользователя
   с таким `username` там ещё нет. Если позже сменишь `ADMIN_PASSWORD` в `.env`,
   просто повторный `db:seed` пароль **не обновит** (см. раздел 7).

4. Создать systemd-юнит `/etc/systemd/system/davedevine.service`:
   ```ini
   [Unit]
   Description=Dave Devine site (Next.js)
   After=network.target

   [Service]
   Type=simple
   User=root
   WorkingDirectory=/var/www/davedevine
   Environment=NODE_ENV=production
   Environment=PATH=/root/.nvm/versions/node/v22.23.2/bin:/usr/bin:/bin
   ExecStart=/root/.nvm/versions/node/v22.23.2/bin/npm run start -- -p 3002
   Restart=on-failure
   RestartSec=5

   [Install]
   WantedBy=multi-user.target
   ```
   `.env` Next.js подхватит сам из `WorkingDirectory` — прописывать переменные
   из него в юните не нужно.

   Запустить и включить автозапуск:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now davedevine
   sudo systemctl status davedevine
   ```

5. Настроить reverse proxy в nginx (по образцу конфигов соседних сайтов,
   `/etc/nginx/sites-available/`). `davedivine.com` — канонический хост (без www),
   его отдает приложение; `www.davedivine.com` и HTTP всегда 301 на канонический
   HTTPS-адрес с сохранением пути и параметров (`$request_uri`), чтобы хосты не
   индексировались как дубли:
   ```nginx
   # HTTP (любой хост) → канонический HTTPS
   server {
       listen 80;
       listen [::]:80;
       server_name davedivine.com www.davedivine.com;
       return 301 https://davedivine.com$request_uri;
   }

   # www по HTTPS → канонический хост без www
   server {
       listen 443 ssl;
       listen [::]:443 ssl;
       server_name www.davedivine.com;

       ssl_certificate /etc/letsencrypt/live/davedivine.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/davedivine.com/privkey.pem;

       return 301 https://davedivine.com$request_uri;
   }

   # Канонический хост — отдает приложение
   server {
       listen 443 ssl;
       listen [::]:443 ssl;
       server_name davedivine.com;

       ssl_certificate /etc/letsencrypt/live/davedivine.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/davedivine.com/privkey.pem;

       client_max_body_size 220M;  # видео до 200MB (см. src/lib/upload.ts) + запас

       location / {
           proxy_pass http://127.0.0.1:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```
   ```bash
   sudo ln -s /etc/nginx/sites-available/davedivine.com /etc/nginx/sites-enabled/
   sudo certbot --nginx -d davedivine.com -d www.davedivine.com
   sudo nginx -t && sudo systemctl reload nginx
   ```
   Сертификат от `certbot` покрывает оба хоста, поэтому один и тот же путь к
   нему используется в обоих `server` блоках с `ssl_certificate*`. Если nginx
   уже настроен со старым единым блоком на оба хоста — заменить его этой
   конфигурацией и перезагрузить nginx (`nginx -t` перед `reload` обязателен).

6. Убедиться, что DNS-запись домена `davedivine.com` указывает на IP этого сервера.

---

## 2. Обычный релиз (обновление кода)

```bash
cd /var/www/davedevine
git pull origin master

npm ci                     # если менялись зависимости
npx prisma generate        # обязательно, если менялась prisma/schema.prisma — npm ci выше не всегда перегенерит клиент
npx prisma migrate deploy  # применит новые миграции, если есть; безопасно гонять всегда
npm run build

sudo systemctl restart davedevine
```

Ключевые правила:
- **Никогда** не `rm -rf` рабочую директорию и не пересоздавай проект с нуля при
  обновлении — `prisma/dev.db` и `uploads/` живут внутри репозитория на диске и
  не хранятся в git (см. `.gitignore`). Обновление делается через `git pull`
  поверх существующей директории.
- Если меняли схему `prisma/schema.prisma` — миграция создаётся локально
  (`npx prisma migrate dev --name ...`) и коммитится в `prisma/migrations/`
  **до** пуша на сервер. На сервере накатывается только `migrate deploy`
  (никогда не `migrate dev` на проде).
- `npm run build` обязателен перед рестартом — `next start` раздаёт собранный
  билд из `.next/`.

---

## 3. Бэкапы

Бэкапить нужно только два пути (это всё состояние сайта):
```
prisma/dev.db
uploads/
```
Например, простой ежедневный cron:
```bash
tar -czf /backups/davedevine-$(date +%F).tar.gz \
  /var/www/davedevine/prisma/dev.db \
  /var/www/davedevine/uploads
```

---

## 4. Откат

```bash
cd /var/www/davedevine
git log --oneline -5        # найти коммит для отката
git checkout <hash>
npm ci
npm run build
sudo systemctl restart davedevine
```
Если откат пересекает миграцию базы — миграции Prisma не откатываются
автоматически; перед откатом такого рода восстанови `prisma/dev.db` из бэкапа
(см. раздел 3).

---

## 5. Проверка после деплоя

- Открыть `https://davedivine.com` — страница отдаётся, фон/контент на месте.
- Открыть `/about`.
- Зайти в админку под своим логином/паролем, проверить, что правки сохраняются.
- Проверить, что загрузка файла в админке работает и файл отдаётся по
  `/api/uploads/...`.
- `sudo journalctl -u davedevine -n 50 --no-pager` — нет ошибок при старте.

---

## 6. Смена пароля админа

`db:seed` создаёт запись в `AdminUser` только один раз — если пользователь с
таким `username` уже существует, скрипт его не трогает (даже если пароль в
`.env` поменялся). Чтобы сменить пароль:

```bash
cd /var/www/davedevine
sqlite3 prisma/dev.db "DELETE FROM AdminUser WHERE username='<текущий username>';"
# поправь ADMIN_USERNAME/ADMIN_PASSWORD в .env, затем:
npm run db:seed
```

---

## 7. Дальше по плану (ещё не сделано)

Из внутренних заметок по релизу (см. `правки`):
- Перенести домен `davedivine.com` под Cloudflare (DNS/proxy).
- Перенести хранение загружаемых файлов в S3 (сейчас — локальный диск
  `uploads/`, что нормально для одного сервера, но требует ручного бэкапа и не
  переживёт переезд/масштабирование без миграции файлов).
