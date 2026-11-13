import sqlite3
from models import Cotacao

class CotacaoDAO:
    def __init__(self, caminho_banco="cotacoes.db"):
        self.caminho_banco = caminho_banco
        self._criar_tabela()

    def _conectar(self):
        return sqlite3.connect(self.caminho_banco)

    def _criar_tabela(self):
        with self._conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS cotacoes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    moeda TEXT NOT NULL,
                    nome TEXT NOT NULL,
                    valor REAL NOT NULL,
                    variacao REAL NOT NULL,
                    data_consulta DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conexao.commit()

    def salvar(self, cotacao: Cotacao) -> int:
        with self._conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                INSERT INTO cotacoes (moeda, nome, valor, variacao)
                VALUES (?, ?, ?, ?)
            """, (cotacao.moeda, cotacao.nome, cotacao.valor, cotacao.variacao))
            conexao.commit()
            return cursor.lastrowid

    def listar_todas(self) -> list:
        with self._conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("""
                SELECT id, moeda, nome, valor, variacao, data_consulta 
                FROM cotacoes 
                ORDER BY id DESC
            """)
            linhas = cursor.fetchall()
            return [Cotacao(*linha) for linha in linhas]

    def excluir(self, id_cotacao: int) -> bool:
        with self._conectar() as conexao:
            cursor = conexao.cursor()
            cursor.execute("DELETE FROM cotacoes WHERE id = ?", (id_cotacao,))
            conexao.commit()
            return cursor.rowcount > 0