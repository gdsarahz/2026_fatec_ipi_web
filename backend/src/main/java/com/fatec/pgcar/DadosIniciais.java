package com.fatec.pgcar;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Carga inicial: se a tabela de produtos estiver vazia, cadastra o catálogo da PG Car.
 * Os códigos (1 a 12) são gravados de forma explícita porque as fotos do frontend
 * têm o nome do código do produto (public/1.png, public/2.png ...).
 */
@Component
public class DadosIniciais implements CommandLineRunner {

    private final ProdutoRepository produtos;
    private final JdbcTemplate jdbc;

    public DadosIniciais(ProdutoRepository produtos, JdbcTemplate jdbc) {
        this.produtos = produtos;
        this.jdbc = jdbc;
    }

    @Override
    public void run(String... args) {
        if (produtos.count() > 0) {
            return;
        }
        //        cod, nome, categoria, descrição, características, valor, promo, estoque, destaque
        inserir(1, "Maçaneta Interna HB20 Cinza", "Maçanetas Internas",
            "Maçaneta interna para HB20 Lado Esquerdo encaixe original.",
            new String[] {"Material: plástico", "Posição: dianteira ou traseira", "Garantia: 12 meses"},
            39.90, 0, 25, 1);
        inserir(2, "Fechadura Tampa Traseira Gol G2", "Fechaduras",
            "Fechadura tampa traseira porta malas compatível com original.",
            new String[] {"Material: Metal", "Posição: Tampa Traseira", "Garantia: 12 meses"},
            49.90, 0, 15, 2);
        inserir(3, "Lanterna Traseira Corsa Wind", "Lanternas",
            "Lanterna Traseira Tricolor Corsa Wind Par.",
            new String[] {"Par: Lado Esquerdo e Direito", "Compatível com encaixe original"},
            134.90, 119.90, 10, 3);
        inserir(4, "Coxim HB20", "Coxim",
            "Coxim Amortecedor Hb20 com Rolamento.",
            new String[] {"Posição: Dianteiro", "Lado: Esquerdo e Direito", "Garantia: 6 meses"},
            59.90, 0, 18, 4);
        inserir(5, "Par Maçanetas Internas Kwid", "Maçanetas Internas",
            "Par Maçanetas Internas Kwid Cromadas",
            new String[] {"Par", "Cor: Prata Cromado", "Garantia: 6 meses"},
            27.50, 0, 30, 5);
        inserir(6, "Kit 4 Maçanetas Internas Uno", "Maçanetas Internas",
            "Jogo com 4 Maçanetas Internas Pretas Compatíveis com Uno",
            new String[] {"Kit com 4", "Cor: Preto", "Garantia: 6 meses"},
            89.00, 79.90, 12, 6);
        inserir(7, "Fechadura Porta Dianteira Esquerda Gol", "Fechaduras",
            "Fechadura para Porta Dianteira Gol Compatível com Original",
            new String[] {"Material: Metal", "Posição: Dianteira", "Lado: Esquerdo", "Unidade", "Garantia: 12 meses"},
            49.90, 0, 20, 7);
        inserir(8, "Par Maçanetas Externas Dianteiras Elantra", "Maçanetas Externas",
            "Maçanetas Externas Dianteiras Hyundai Elantra Com e Sem Furo para Chave.",
            new String[] {"Kit com 2 peças", "Cor: Preto", "Lado: Esquerdo e Direito", "Garantia: 6 meses"},
            79.90, 0, 16, 8);
        inserir(9, "Fechadura Tampa Traseira Corsa", "Fechaduras",
            "Fechadura Trava Tampa Traseira Porta Malas Corsa Compatível com Original",
            new String[] {"Material: Metal", "Aplicação: Porta Malas", "Garantia: 18 meses"},
            59.00, 0, 14, 9);
        inserir(10, "Kit 4 Maçanetas Externas Uno", "Maçanetas Externas",
            "Kit 4 Maçanetas Externas Uno Compatível Com Original",
            new String[] {"Cor: Preto", "Kit com 4", "Garantia: 6 meses"},
            89.90, 0, 12, 10);
        inserir(11, "Par Pingo Led T10", "Iluminação",
            "Par de lâmpadas LED T10 com luz branca de 6000K e baixo consumo.",
            new String[] {"Par (2 unidades)", "Potência: 12 v", "Cor: 6000K"},
            19.90, 0, 50, 11);
        inserir(12, "Par Maçanetas Internas Dianteira Corsa", "Maçanetas Internas",
            "Par Maçanetas Internas Dianteiras Corsa Compatíveis com Originais.",
            new String[] {"Par", "Cor: Preto", "Lado: Esquerdo e Direito", "Garantia: 12 meses"},
            49.00, 0, 22, 12);
    }

    private void inserir(int codigo, String nome, String categoria, String descricao,
            String[] caracteristicas, double valor, double promo, int quantidade, int destaque) {
        // 1ª linha = descrição, linhas seguintes = características (o frontend separa por \n)
        String descritivo = descricao;
        if (caracteristicas.length > 0) {
            descritivo = descricao + "\n" + String.join("\n", caracteristicas);
        }
        jdbc.update("insert into produto (codigo, nome, categoria, descritivo, valor, valor_promo, quantidade, destaque) "
            + "values (?, ?, ?, ?, ?, ?, ?, ?)",
            codigo, nome, categoria, descritivo, valor, promo, quantidade, destaque);
    }

}
