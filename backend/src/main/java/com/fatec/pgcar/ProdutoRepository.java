package com.fatec.pgcar;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Integer> {

    // Vitrine: apenas produtos em destaque e com estoque, na ordem de destaque
    @Query(value = "select * from produto where destaque>0 and quantidade>0 " +
    " order by destaque", nativeQuery = true)
    public List<Produto> carregarVitrine();

    // Busca pelo nome, categoria ou descritivo
    @Query(value = "select * from produto where nome like :termo " +
    " or categoria like :termo or descritivo like :termo order by nome",
    nativeQuery = true)
    public List<Produto> fazerBuscar(@Param("termo") String termo);

    @Query(value = "select * from produto where categoria = :categoria order by nome",
    nativeQuery = true)
    public List<Produto> buscarPorCategoria(@Param("categoria") String categoria);

    @Query(value = "select distinct categoria from produto " +
    " where categoria is not null and categoria <> '' order by categoria",
    nativeQuery = true)
    public List<String> listarCategorias();

    @Query(value = "select * from produto order by nome", nativeQuery = true)
    public List<Produto> listarTodos();

}
