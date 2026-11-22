package com.fatec.pgcar;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido,Integer> {

    @Query(value = "select * from pedido where codigo_cliente=:codigo order by codigo_pedido desc", nativeQuery = true)
    public List<Pedido> listarPorCliente(@Param("codigo") int codigo);
}
