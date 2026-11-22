package com.fatec.pgcar;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class ClienteController {
    @Autowired
    ClienteRepository bd;

    @GetMapping("/api/cliente/{codigo}")
    public Cliente retorna(@PathVariable("codigo") int id){
        if(bd.existsById(id)){
            return bd.findById(id).get();
        } else {
            return new Cliente();
        }
    }

    // Novo cadastro. Se os dados forem inválidos ou o e-mail já existir,
    // devolve um Cliente vazio (codigo = 0), assim como o login.
    @PostMapping("/api/cliente")
    public Cliente gravar(@RequestBody Cliente obj){
        if(dadosInvalidos(obj) || emailEmUso(obj)){
            return new Cliente();
        }
        return salvar(obj);
    }

    @PutMapping("/api/cliente")
    public Cliente alterar(@RequestBody Cliente obj){
        if(bd.existsById(obj.getCodigo()) && !dadosInvalidos(obj) && !emailEmUso(obj)){
            return salvar(obj);
        } else {
            return new Cliente();
        }
    }

    @DeleteMapping("/api/cliente/{codigo}")
    public String apagar(@PathVariable("codigo") int id){
        bd.deleteById(id);
        return "Cliente removido com sucesso!";
    }

    @PostMapping("/api/cliente/login")
    public Cliente fazerLogin(@RequestBody Cliente obj){
        Optional<Cliente> objCliente = bd.fazerLogin(obj.getEmail(), obj.getSenha());
        if(objCliente.isPresent()){
            return objCliente.get();
        } else {
            return new Cliente();
        }
    }

    // Reinicia a senha para uma senha temporária e bloqueia o login (ativo=0)
    // até o cliente criar uma nova senha em /api/cliente/alterarSenha.
    @PatchMapping("/api/cliente/resetarSenha")
    public String resetarSenha(@RequestBody Cliente obj){
        String senhaTemp = "Senha1234";
        bd.resetarSenha(senhaTemp, obj.getEmail());
        //TODO ENVIAR EMAIL
        return "Sua senha foi reiniciada, verifique o seu email!";
    }

    // Contrato da requisição: "email" = e-mail do cliente,
    // "senha" = NOVA senha e "documento" = senha ATUAL (a temporária, no caso do reset).
    @PatchMapping("/api/cliente/alterarSenha")
    public ResponseEntity<String> alterarSenha(@RequestBody Cliente obj){
        int linhas = bd.alterarSenha(obj.getSenha(), obj.getDocumento(), obj.getEmail());
        //TODO ENVIAR EMAIL
        if(linhas > 0){
            return ResponseEntity.ok("Sua senha foi alterada!");
        } else {
            return ResponseEntity.badRequest().body("E-mail ou senha atual incorretos!");
        }
    }

    private boolean dadosInvalidos(Cliente obj){
        boolean semNome = obj.getNome() == null || obj.getNome().isBlank();
        boolean semEmail = obj.getEmail() == null || obj.getEmail().isBlank();
        boolean semSenha = obj.getCodigo() == 0 &&
            (obj.getSenha() == null || obj.getSenha().isBlank());
        return semNome || semEmail || semSenha;
    }

    // true se o e-mail já pertence a OUTRA conta
    private boolean emailEmUso(Cliente obj){
        Optional<Cliente> outro = bd.findFirstByEmail(obj.getEmail());
        return outro.isPresent() && outro.get().getCodigo() != obj.getCodigo();
    }

    private Cliente salvar(Cliente obj){
        if(obj.getCodigo() > 0){
            // alteração: mantém o status e, se não vier senha, mantém a senha atual
            Optional<Cliente> atual = bd.findById(obj.getCodigo());
            if(atual.isPresent()){
                obj.setAtivo(atual.get().getAtivo());
                if(obj.getSenha() == null || obj.getSenha().isBlank()){
                    obj.setSenha(atual.get().getSenha());
                }
            }
        } else {
            // novo cadastro já nasce ativo (o login só aceita ativo=1)
            obj.setAtivo(1);
        }
        return bd.save(obj);
    }

}
