# Instala o Electron, better-sqlite3 e outras dependências
npm install

# Recompilar módulos nativos do Electron (necessário para better-sqlite3):
npx electron-rebuild -f -w better-sqlite3

# Iniciar o app
npm start

# comandos para instalar e react e parcel
npm install react react-dom
npm install --save-dev parcel
npm run build
npm start