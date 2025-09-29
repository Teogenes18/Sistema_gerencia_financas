
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'financas.db');

const db = new Database(DB_PATH); 

let transacoes = [];

function setupDatabase() {
    try {
        db.exec(`
            CREATE TABLE IF NOT EXISTS transacoes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tipo TEXT NOT NULL,       -- 'receita' ou 'despesa'
                valor REAL NOT NULL,      -- REAL para números com ponto flutuante
                data TEXT NOT NULL,       -- 'AAAA-MM-DD'
                descricao TEXT
            )
        `);
        console.log("Banco de dados SQLite configurado.");
    } catch (error) {
        console.error("Erro ao configurar o banco de dados:", error);
    }
}


function adicionarTransacao() {
    const tipo = document.getElementById('tipo').value;
    const valor = parseFloat(document.getElementById('valor').value); 
    const dataStr = document.getElementById('data').value;
    const descricao = document.getElementById('descricao').value.trim();

    if (!valor || !dataStr || !descricao) {
        alert("Por favor, preencha todos os campos.");
        return;
    }

    const stmt = db.prepare('INSERT INTO transacoes (tipo, valor, data, descricao) VALUES (?, ?, ?, ?)');
    
    try {
        stmt.run(tipo, valor, dataStr, descricao);
        console.log('Transação salva no SQLite.');

        document.getElementById('valor').value = '';
        document.getElementById('data').value = '';
        document.getElementById('descricao').value = '';

        carregarTransacoes(); 

    } catch (error) {
        console.error("Erro ao salvar transação no banco de dados:", error);
        alert("Erro ao salvar transação. Verifique o console para detalhes.");
    }
}


function carregarTransacoes() {
    try {
        const transacoesDoBanco = db.prepare('SELECT * FROM transacoes ORDER BY data DESC, id DESC').all();
        transacoes = transacoesDoBanco;
        renderizarTransacoes();
    } catch (error) {
        console.error("Erro ao carregar transações do SQLite:", error);
        transacoes = []; 
        renderizarTransacoes();
    }
}

function renderizarTransacoes() {
    const container = document.getElementById('extrato-container');
    container.innerHTML = ''; 

    if (transacoes.length === 0) {
        container.innerHTML = '<p>Nenhuma transação cadastrada.</p>';
        return;
    }

    transacoes.forEach(transacao => {
        const elemento = document.createElement('div');
        elemento.classList.add('transacao-item');
        
        const valorFormatado = transacao.valor.toFixed(2).replace('.', ',');
        const valorComSinal = transacao.tipo === 'receita' ? `+ R$ ${valorFormatado}` : `- R$ ${valorFormatado}`;
        const classeCor = transacao.tipo === 'receita' ? 'receita' : 'despesa';

        const [ano, mes, dia] = transacao.data.split('-');
        const dataFormatada = `${dia}/${mes}/${ano}`;

        elemento.innerHTML = `
            <div>${dataFormatada} - ${transacao.descricao}</div>
            <div class="${classeCor}">${valorComSinal}</div>
        `;
        container.appendChild(elemento);
    });
}


setupDatabase(); 


document.addEventListener('DOMContentLoaded', () => {
    carregarTransacoes(); 
    const btnSalvar = document.getElementById('btn-salvar-transacao');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', adicionarTransacao);
    }
});