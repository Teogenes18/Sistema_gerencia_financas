# Instala o Electron, better-sqlite3 e outras dependências
npm install

# Recompilar módulos nativos do Electron (necessário para better-sqlite3):
npm install --save-dev electron-rebuild && ./node_modules/.bin/electron-rebuild

# Iniciar o app
npm start