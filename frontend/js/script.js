const AWESOME_API_URL = "https://economia.awesomeapi.com.br/json/last/";
const STORAGE_KEY = "cotacoes_historico";

let cotacaoAtualObj = null;

// Elementos DOM
const parInput = document.querySelector("#parInput");
const btnBuscar = document.querySelector("#btnBuscar");
const resultadoBusca = document.querySelector("#resultadoBusca");
const loading = document.querySelector("#loading");

const nomeMoeda = document.querySelector("#nomeMoeda");
const parMoeda = document.querySelector("#parMoeda");
const valorMoeda = document.querySelector("#valorMoeda");
const variacaoMoeda = document.querySelector("#variacaoMoeda");
const btnSalvar = document.querySelector("#btnSalvar");

const tabelaHistorico = document.querySelector("#tabelaHistorico");
const btnAtualizarHistorico = document.querySelector("#btnAtualizarHistorico");

btnBuscar.addEventListener("click", buscarCotacao);
btnSalvar.addEventListener("click", salvarCotacao);
btnAtualizarHistorico.addEventListener("click", carregarHistorico);
document.addEventListener("DOMContentLoaded", carregarHistorico);

async function buscarCotacao() {
    const par = parInput.value.trim().toUpperCase();
    if (!par) {
        alert("Por favor, informe o par de moedas (ex: USD-BRL).");
        return;
    }

    loading.classList.remove("hidden");
    resultadoBusca.classList.add("hidden");

    try {
        const response = await fetch(`${AWESOME_API_URL}${par}`);
        const dados = await response.json();

        const chavePar = par.replace("-", "");
        
        if (dados.status === 404 || !dados[chavePar]) {
            alert("Par de moedas não encontrado.");
            return;
        }

        const info = dados[chavePar];

        cotacaoAtualObj = {
            id: Date.now(), 
            moeda: par,
            nome: info.name,
            valor: parseFloat(info.bid),
            variacao: parseFloat(info.pctChange),
            data_consulta: new Date().toLocaleString("pt-BR") 
        }

        nomeMoeda.textContent = cotacaoAtualObj.nome;
        parMoeda.textContent = cotacaoAtualObj.moeda;
        valorMoeda.textContent = cotacaoAtualObj.valor.toFixed(4);
        variacaoMoeda.textContent = `${cotacaoAtualObj.variacao}%`;
        
        variacaoMoeda.style.color = cotacaoAtualObj.variacao >= 0 ? "#16a34a" : "#dc2626";

        resultadoBusca.classList.remove("hidden");

    } catch (error) {
        console.error("Erro na busca:", error);
        alert("Falha na comunicação com a AwesomeAPI.");
    } finally {
        loading.classList.add("hidden");
    }
}

function salvarCotacao() {
    if (!cotacaoAtualObj) return;

    let historico = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    historico.unshift(cotacaoAtualObj);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));

    alert("Cotação salva com sucesso no histórico local!");
    carregarHistorico();
}

function carregarHistorico() {
    let historico = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    tabelaHistorico.innerHTML = "";

    if (historico.length === 0) {
        tabelaHistorico.innerHTML = `<tr><td colspan="6" style="text-align:center;">Nenhuma cotação salva.</td></tr>`;
        return;
    }

    historico.forEach(cot => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${cot.moeda}</strong></td>
            <td>${cot.nome}</td>
            <td>R$ ${cot.valor.toFixed(4)}</td>
            <td style="color: ${cot.variacao >= 0 ? '#16a34a' : '#dc2626'};">${cot.variacao}%</td>
            <td>${cot.data_consulta}</td>
            <td>
                <button class="btn-excluir" onclick="excluirCotacao(${cot.id})">Excluir</button>
            </td>
        `;
        tabelaHistorico.appendChild(tr);
    });
}

function excluirCotacao(id) {
    if (!confirm("Deseja realmente remover esta cotação do histórico?")) return;

    let historico = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    historico = historico.filter(cot => cot.id !== id);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(historico));
    
    carregarHistorico();
}