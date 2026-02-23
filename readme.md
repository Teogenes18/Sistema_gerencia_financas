# Sistema de Gerenciamento de Finanças 💰

O **Sistema de Gerenciamento de Finanças** é uma aplicação desktop desenvolvida para auxiliar no controle de receitas e despesas de forma prática e intuitiva.  

O sistema permite o gerenciamento completo de transações financeiras, geração de gráficos dinâmicos e exportação de relatórios em múltiplos formatos.

---

## 🎯 Principais Funcionalidades

- Cadastro e autenticação de usuários
- Registro de receitas e despesas
- Gerenciamento de bancos/contas
- Visualização de extrato com filtros
- Edição de transações
- Geração de gráficos financeiros interativos
- Importação de dados via CSV
- Exportação de relatórios em PDF e CSV
- Armazenamento local seguro (offline)

---

## 🚀 Tecnologias Utilizadas

O sistema foi construído com uma arquitetura moderna baseada em tecnologias web aplicadas ao ambiente desktop:

### 🖥 Desktop e Backend
- **Electron** – Empacotamento da aplicação como software desktop
- **Sequelize** – ORM para manipulação do banco de dados
- **SQLite3** – Banco de dados local

### 🎨 Frontend
- **React** – Construção da interface
- **React Router DOM** – Gerenciamento de rotas

### 📊 Visualização e Relatórios
- **Recharts** – Geração de gráficos interativos
- **jsPDF** – Geração de relatórios em PDF
- **html2canvas** – Captura de elementos da interface
- **PapaParse** – Leitura e importação de arquivos CSV

### 📦 Build e Empacotamento
- **Parcel** – Bundler da aplicação

---

## 📚 Documentação

A documentação do projeto está dividida nos seguintes arquivos:

- [Guia de Instalação e Configuração](./install.md)
- [Manual de Uso do Sistema](./usage.md)

Consulte esses documentos para instruções detalhadas sobre instalação e utilização do sistema.

---

## 📌 Requisitos

- Node.js (versão 14 ou superior recomendada)
- npm
- Git

---

## 📎 Observações

- O sistema funciona de forma offline.
- Os dados são armazenados localmente.
