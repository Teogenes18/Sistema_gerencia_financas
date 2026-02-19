# Manual de Uso do Sistema 📖

Bem-vindo ao manual de uso! O **Sistema de Gerenciamento de Finanças** foi projetado para ser simples e direto. Abaixo estão as instruções das principais funcionalidades.

## 1. Tela Inicial e Navegação
Ao abrir o sistema, você verá um painel principal (Dashboard). O menu de navegação (geralmente na lateral ou no topo) permite acessar as seguintes áreas:
- **Dashboard/Início:** Visão geral das suas finanças com gráficos de receitas vs. despesas.
- **Lançamentos:** Tela para adicionar novas receitas ou gastos.
- **Importar Dados:** Área para carregar arquivos CSV.
- **Relatórios:** Geração e exportação de dados em PDF.

## 2. Como Registrar uma Nova Finança (Receita/Despesa)
1. Navegue até a tela de **Lançamentos**.
2. Preencha os campos obrigatórios:
   - **Descrição:** Ex: Conta de Luz, Salário, etc.
   - **Valor:** O valor monetário.
   - **Tipo:** Selecione se é uma "Receita" (dinheiro entrando) ou "Despesa" (dinheiro saindo).
   - **Data:** A data em que a transação ocorreu.
3. Clique em **Salvar**. Os dados serão guardados automaticamente no banco de dados local (`finance.sqlite`).

## 3. Visualizando Gráficos
Na tela de **Dashboard**, o sistema gera automaticamente gráficos visuais (utilizando a biblioteca Recharts) para facilitar a compreensão do seu fluxo de caixa mensal. As informações são atualizadas instantaneamente ao inserir novos registros.

## 4. Importando Arquivos CSV
Se você já possui planilhas financeiras, não é necessário digitar tudo manualmente:
1. Vá até a seção de **Importar Dados**.
2. Clique no botão de "Selecionar Arquivo" e escolha o seu arquivo `.csv` no computador.
3. O sistema fará a leitura (via PapaParse) e salvará os dados em lote no seu banco de dados. 

## 5. Exportando Relatórios em PDF
Para salvar um comprovante ou histórico das suas finanças:
1. Acesse a área de **Relatórios** ou visualize o Dashboard.
2. Clique no botão **"Exportar para PDF"**.
3. O sistema tirará uma "foto" da sua tela de dados (via html2canvas) e gerará um arquivo PDF (via jsPDF) para você baixar e imprimir.

## 6. Como Resetar Todos os Dados
Se você precisar apagar tudo e começar do zero (Atenção: essa ação é irreversível):
1. Feche o programa.
2. Vá até a pasta onde o programa está instalado/baixado.
3. Delete o arquivo chamado `finance.sqlite`.
4. Abra o programa novamente. O banco de dados nascerá vazio.