from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
from models import Cotacao
from dao import CotacaoDAO

app = Flask(__name__)
CORS(app) 

dao = CotacaoDAO()

@app.route("/api/cotacao/buscar/<par>", methods=["GET"])
def buscar_cotacao(par):
    """
    Exemplo de <par>: USD-BRL, EUR-BRL, BTC-BRL, CAD-BRL
    """
    url_awesome_api = f"https://economia.awesomeapi.com.br/json/last/{par}"
    
    try:
        response = requests.get(url_awesome_api, timeout=5)
        if response.status_code != 200:
            return jsonify({"erro": "Par de moedas não encontrado ou inválido."}), 404
        
        dados = response.json()
        chave_par = par.replace("-", "")  
        
        if chave_par not in dados:
            return jsonify({"erro": "Resposta da API em formato inesperado."}), 400
        
        info = dados[chave_par]
        cotacao = Cotacao(
            moeda=par.upper(),
            nome=info.get("name"),
            valor=float(info.get("bid")),
            variacao=float(info.get("pctChange"))
        )
        
        return jsonify(cotacao.to_dict()), 200

    except Exception as e:
        return jsonify({"erro": f"Falha na comunicação com a AwesomeAPI: {str(e)}"}), 500

@app.route("/api/cotacoes", methods=["POST"])
def salvar_cotacao():
    dados = request.json
    if not dados or "moeda" not in dados or "valor" not in dados:
        return jsonify({"erro": "Dados incompletos para salvar cotação."}), 400

    nova_cotacao = Cotacao(
        moeda=dados.get("moeda"),
        nome=dados.get("nome", "Não informado"),
        valor=dados.get("valor"),
        variacao=dados.get("variacao", 0.0)
    )
    
    id_gerado = dao.salvar(nova_cotacao)
    return jsonify({"mensagem": "Cotação salva com sucesso!", "id": id_gerado}), 201

@app.route("/api/cotacoes", methods=["GET"])
def listar_cotacoes():
    lista = dao.listar_todas()
    return jsonify([c.to_dict() for c in lista]), 200

@app.route("/api/cotacoes/<int:id_cotacao>", methods=["DELETE"])
def excluir_cotacao(id_cotacao):
    sucesso = dao.excluir(id_cotacao)
    if sucesso:
        return jsonify({"mensagem": "Cotação removida com sucesso!"}), 200
    return jsonify({"erro": "Cotação não encontrada."}), 404

if __name__ == "__main__":
    app.run(debug=True, port=5000)