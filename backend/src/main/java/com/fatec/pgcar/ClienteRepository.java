package com.fatec.pgcar;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.transaction.Transactional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente,Integer> {

    // usado para impedir dois cadastros com o mesmo e-mail
    Optional<Cliente> findFirstByEmail(String email);

    @Query(value = "select * from cliente where ativo=1 and email=:email and senha=:senha", nativeQuery = true)
    public Optional<Cliente> fazerLogin(@Param("email") String email, @Param("senha") String senha);

    @Modifying
    @Transactional
    @Query(value = "update cliente set senha=:senhaTemp, ativo=0 where " +
    " email=:email", nativeQuery = true)
    int resetarSenha(@Param("senhaTemp") String senhaTemp, @Param("email") String email);

    @Modifying
    @Transactional
    @Query(value = "update cliente set senha=:novaSenha, ativo=1 where " +
    " email=:email and senha=:antigaSenha", nativeQuery = true)
    int alterarSenha(@Param("novaSenha") String novaSenha, @Param("antigaSenha") String antigaSenha, @Param("email") String email);

}
