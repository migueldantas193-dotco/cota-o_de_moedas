class Cotacao:
    def __init__(self, id_cotacao, moeda, nome, valor, variacao, data_consulta=None):
        self.id = id_cotacao
        self.moeda = moeda
        self.nome = nome
        self.valor = valor
        self.variacao = variacao
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