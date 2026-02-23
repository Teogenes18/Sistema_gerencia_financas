# Guia de Instalação e Configuração ⚙️

Este documento descreve detalhadamente os passos necessários para instalar, configurar e executar o **Sistema de Gerenciamento de Finanças** em ambiente local.

---

# 1. Requisitos do Sistema

Antes de iniciar a instalação, certifique-se de que possui os seguintes softwares instalados:

- **Git** – Para clonar o repositório  
- **Node.js (versão 14 ou superior)** – Ambiente de execução JavaScript  
- **npm** – Gerenciador de pacotes (já incluso no Node.js)

Para verificar se o Node está instalado corretamente:

```bash
node -v
npm -v
```

---

# 2. Clonando o Projeto

No terminal, execute:

```bash
git clone https://github.com/Teogenes18/Sistema_gerencia_financas.git
cd Sistema_gerencia_financas
```

Esse processo fará o download do repositório e acessará a pasta do projeto.

---

# 3. Instalação das Dependências

## 3.1 Instalação Completa (Recomendado)

```bash
npm install
```

Este comando instala todas as dependências declaradas no arquivo `package.json`, incluindo:

### Backend / Desktop
- **Electron** – Execução da aplicação como software desktop  
- **Sequelize** – ORM para manipulação do banco de dados  
- **sqlite3** – Banco de dados local  

### Frontend
- **React / ReactDOM** – Construção da interface  
- **React Router DOM** – Gerenciamento de rotas  
- **React Icons** – Biblioteca de ícones  

### Build e Empacotamento
- **Parcel** – Bundler da aplicação  
- **parcel-reporter-static-files-copy** – Plugin para arquivos estáticos  

### Funcionalidades Extras
- **Recharts** – Criação de gráficos financeiros  
- **jsPDF** – Geração de relatórios em PDF  
- **html2canvas** – Captura de elementos da interface  
- **PapaParse** – Leitura e importação de arquivos CSV  

---

# 4. Recompilação de Módulos Nativos (Obrigatório)

Como o projeto utiliza `sqlite3` com Electron, é necessário recompilar o módulo para a arquitetura da sua máquina:

```bash
npx electron-rebuild -f -w sqlite3
```

Este comando evita erros relacionados a incompatibilidade binária do SQLite com o Electron.

---

# 5. Instalação Manual de Dependências (Caso Necessário)

Caso alguma biblioteca não seja instalada corretamente, utilize os comandos abaixo.

## React e Roteamento

```bash
npm install react react-dom
npm install react-router-dom
```

## Parcel (Build)

```bash
npm install --save-dev parcel
npm install --save-dev parcel-reporter-static-files-copy
```

## Ícones

```bash
npm install react-icons
```

## Gráficos e Exportação de PDF

```bash
npm install recharts jspdf html2canvas
```

## Importação de CSV

```bash
npm install papaparse
```

---

# 6. Execução da Aplicação

## 6.1 Gerar o Build do Frontend

```bash
npm run build
```

Compila a aplicação React utilizando o Parcel.

## 6.2 Iniciar o Sistema

```bash
npm start
```

Este comando inicia o Electron e abre a aplicação desktop.

---

# 7. Reset do Banco de Dados (Opcional)

Caso seja necessário reiniciar os dados do sistema:

1. Localize o arquivo `finance.sqlite` na raiz do projeto.
2. Exclua o arquivo manualmente.
3. Execute novamente:

```bash
npm start
```

O Sequelize recriará automaticamente todas as tabelas do banco.

---

# 8. Solução de Problemas

### Erro relacionado ao sqlite3

Execute novamente:

```bash
npx electron-rebuild -f -w sqlite3
```

---

# 9. Observações Finais

- Certifique-se de que o arquivo `package.json` esteja atualizado antes de executar `npm install`.
- Sempre execute o build (`npm run build`) antes de iniciar o Electron.
- Recomenda-se utilizar a versão LTS do Node.js para maior estabilidade.
