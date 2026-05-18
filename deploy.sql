#

nano /etc/nginx/sites-available/kigalibespoke.com


server {
    listen 80;
    server_name kigalibespoke.com www.kigalibespoke.com;

    root /var/www/kigalibespoke/;
    index index.html index.htm;

    location / {
        try_files $uri $uri/ =404;
    }
}


1. UI Deployment:
-- deleting the folder contents before copying the new files
cd /var/www/E-commerce/frontend
rm -rf *
rm -rf .[^.]* ..?* 2>/dev/null



 scp -r "D:\MP\AI\MBI\E-commerce\frontend\build\*" root@104.207.67.246:/var/www/E-commerce/frontend/


2. Backend Deployment:
git pull

npm install
npm run prisma:generate
# Optional (if you use Prisma migrations in production):
# npx prisma migrate deploy --schema prisma/schema.prisma
npm run build
pm2 start dist/server.js --name belife-backend


-- Restart PM2 to apply changes

pm2 restart belife-backend
-- If you updated environment variables, use:
pm2 restart belife-backend --update-env


pm2 save
pm2 startup

pm2 status



git hub 

git stash
git pull
git stash pop
-- What this does:
-- saves your local changes temporarily
-- pulls latest code
-- restores your changes

-- What this does
-- reset --hard
-- removes all local conflicts
-- clean -fd
-- deletes untracked files (like .package.json)
-- pull
-- gets fresh clean code from GitHub
git reset --hard
git clean -fd
git pull