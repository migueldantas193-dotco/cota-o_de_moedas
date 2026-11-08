from models import Cotacao
from dao import CotacaoDAO

if __name__ == "__main__":
    dao = CotacaoDAO()
    # Teste de inserção inicial
    nova_cotacao = Cotacao(None, "USD", "Dólar Americano/Real Brasileiro", 5.15, 0.25)
    id_gerado = dao.salvar(nova_cotacao)
    print(f"Conexão bem-sucedida! Cotação de teste salva com ID: {id_gerado}")