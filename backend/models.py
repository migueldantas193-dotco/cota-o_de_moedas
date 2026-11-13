class Cotacao:
    def __init__(self, id_cotacao=None, moeda=None, nome=None, valor=0.0, variacao=0.0, data_consulta=None):
        self.id = id_cotacao
        self.moeda = moeda
        self.nome = nome
        self.valor = float(valor)
        self.variacao = float(variacao)
        self.data_consulta = data_consulta

    def to_dict(self):
        return {
            "id": self.id,
            "moeda": self.moeda,
            "nome": self.nome,
            "valor": self.valor,
            "variacao": self.variacao,
            "data_consulta": self.data_consulta
        }