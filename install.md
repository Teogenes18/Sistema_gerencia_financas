# Guia de Instalação e Configuração ⚙️

Este documento descreve todos os passos necessários para baixar, instalar as dependências e executar o **Sistema de Gerenciamento de Finanças** na sua máquina local.

## Pré-requisitos
Antes de começar, você precisará ter instalado em sua máquina:
- **Git** (para clonar o repositório)
- **Node.js** (versão 14 ou superior recomendada, que já inclui o `npm`)

## Passo a Passo da Instalação

**1. Clonar o repositório**
Abra o terminal e execute:
\`\`\`bash
git clone https://github.com/Teogenes18/Sistema_gerencia_financas.git
cd Sistema_gerencia_financas
\`\`\`

**2. Instalar as dependências principais**
Execute o comando abaixo para baixar todas as bibliotecas necessárias (React, Electron, etc.):
\`\`\`bash
npm install
\`\`\`

**3. Recompilar módulos nativos (Muito Importante!)**
Como o projeto utiliza o banco de dados SQLite via Electron, é obrigatório recompilar o módulo para a arquitetura da sua máquina:
\`\`\`bash
npx electron-rebuild -f -w sqlite3
\`\`\`

*(Nota: Instalações avulsas de bibliotecas como `recharts`, `jspdf`, `papaparse` e `parcel` já devem estar cobertas pelo comando `npm install` se o arquivo `package.json` estiver atualizado).*

## Executando a Aplicação

Para iniciar o sistema, primeiro precisamos compilar o código do React (frontend) e depois abrir a janela do Electron:

**1. Construir a aplicação (Build do Parcel):**
\`\`\`bash
npm run build
\`\`\`

**2. Iniciar o App:**
\`\`\`bash
npm start
\`\`\`

## Solução de Problemas (Troubleshooting)
- **Erro de Banco de Dados:** Se houver inconsistências estruturais no banco ou se desejar resetar o sistema, basta excluir o arquivo `finance.sqlite` localizado na raiz do projeto. Ao rodar `npm start` novamente, o Sequelize recriará automaticamente todas as tabelas em branco.