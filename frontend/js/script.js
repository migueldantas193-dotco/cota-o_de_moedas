const API_BASE_URL = "http://127.0.0.1:5000/api";

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

// Event Listeners
btnBuscar.addEventListener("click", buscarCotacao);
btnSalvar.addEventListener("click", salvarCotacao);
btnAtualizarHistorico.addEventListener("click", carregarHistorico);
document.addEventListener("DOMContentLoaded", carregarHistorico);

// 1. Buscar Cotações (AwesomeAPI via Flask)
async function buscarCotacao() {
    const par = parInput.value.trim().toUpperCase();
    if (!par) {
        alert("Por favor, informe o par de moedas (ex: USD-BRL).");
        return;
    }

    loading.classList.remove("hidden");
    resultadoBusca.classList.add("hidden");

    try {
        const response = await fetch(`${API_BASE_URL}/cotacao/buscar/${par}`);
        const dados = await response.json();

        if (!response.ok) {
            alert(dados.erro || "Erro ao buscar cotação.");
            return;
        }

        // Armazena temporariamente para salvar no BD se o usuário clicar
        cotacaoAtualObj = dados;

        // Atualiza a interface
        nomeMoeda.textContent = dados.nome;
        parMoeda.textContent = dados.moeda;
        valorMoeda.textContent = dados.valor.toFixed(4);
        variacaoMoeda.textContent = `${dados.variacao}%`;
        
        // Formatação de cor baseada na variação
        variacaoMoeda.style.color = dados.variacao >= 0 ? "#16a34a" : "#dc2626";

        resultadoBusca.classList.remove("hidden");

    } catch (error) {
        console.error("Erro na busca:", error);
        alert("Não foi possível conectar ao servidor local.");
    } finally {
        loading.classList.add("hidden");
    }
}

// 2. Salvar Cotação no Banco de Dados SQLite (POST)
async function salvarCotacao() {
    if (!cotacaoAtualObj) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cotacoes`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cotacaoAtualObj)
        });

        const resData = await response.json();

        if (response.ok) {
            alert("Cotação salva com sucesso!");
            carregarHistorico();
        } else {
            alert(resData.erro || "Erro ao salvar cotação.");
        }
    } catch (error) {
        console.error("Erro ao salvar:", error);
        alert("Erro ao comunicar com o banco de dados.");
    }
}

// 3. Listar Histórico do Banco de Dados (GET)
async function carregarHistorico() {
    try {
        const response = await fetch(`${API_BASE_URL}/cotacoes`);
        const cotacoes = await response.json();

        tabelaHistorico.innerHTML = "";

        if (cotacoes.length === 0) {
            tabelaHistorico.innerHTML = `<tr><td colspan="7" style="text-align:center;">Nenhuma cotação salva.</td></tr>`;
            return;
        }

        cotacoes.forEach(cot => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${cot.id}</td>
                <td><strong>${cot.moeda}</strong></td>
                <td>${cot.nome}</td>
                <td>R$ ${cot.valor.toFixed(4)}</td>
                <td style="color: ${cot.variacao >= 0 ? '#16a34a' : '#dc2626'};">${cot.variacao}%</td>
                <td>${cot.data_consulta || '-'}</td>
                <td>
                    <button class="btn-excluir" onclick="excluirCotacao(${cot.id})">Excluir</button>
                </td>
            `;
            tabelaHistorico.appendChild(tr);
        });

    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

// 4. Excluir Cotação (DELETE)
async function excluirCotacao(id) {
    if (!confirm("Deseja realmente remover esta cotação do histórico?")) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cotacoes/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            carregarHistorico();
        } else {
            alert("Falha ao excluir o registro.");
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
    }
}