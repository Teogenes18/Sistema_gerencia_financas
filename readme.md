# Instala o Electron, Sequelize, sqlite3 e outras dependências
npm install

# Recompilar módulos nativos do Electron (necessário para sqlite3):
npx electron-rebuild -f -w sqlite3

# Resetar o banco local (finance.sqlite)
# Basta remover o arquivo finance.sqlite na raiz do projeto.
# Ao iniciar o app novamente, o Sequelize recriará todas as tabelas automaticamente.

# Iniciar o app
npm start

# comandos para instalar o react, parcel e os icones
npm install react react-dom
npm install react-router-dom
npm install --save-dev parcel-reporter-static-files-copy
npm install --save-dev parcel
npm install react-icons
npm run build
npm start