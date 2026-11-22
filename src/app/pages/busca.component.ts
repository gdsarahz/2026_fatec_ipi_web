import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { ProdutoService } from '../core/produto.service';
import { Produto } from '../core/models';
import { mensagemErro } from '../core/http-erro';
import { CardProdutoComponent } from '../shared/card-produto.component';

interface EstadoBusca {
  status: 'carregando' | 'ok' | 'erro';
  lista: Produto[];
  rotulo: string;
  erro: string;
}

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [CardProdutoComponent],
  template: `
    <div class="container pagina">
      @let e = estado();
      <h1>Pesquisa por: {{ e.rotulo }}</h1>
      @if (e.status === 'carregando') {
        <div class="vazio">Buscando produtos...</div>
      } @else if (e.status === 'erro') {
        <div class="alert alert-warning">{{ e.erro }}</div>
      } @else if (e.lista.length) {
        <p class="text-secondary">{{ e.lista.length }} produto(s) encontrado(s)</p>
        <div class="row g-3 g-lg-4">
          @for (p of e.lista; track p.codigo) {
            <div class="col-6 col-md-4 col-xl-3"><app-card-produto [produto]="p" /></div>
          }
        </div>
      } @else {
        <div class="vazio">Nenhum produto encontrado. Tente outro item ou escolha uma categoria no menu.</div>
      }
    </div>
  `
})
export class BuscaComponent {
  private svc = inject(ProdutoService);

  estado = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(
      map(p => ({ q: (p.get('q') ?? '').trim(), cat: (p.get('cat') ?? '').trim() })),
      switchMap(f => this.consultar(f.q, f.cat))
    ),
    { initialValue: { status: 'carregando', lista: [], rotulo: '', erro: '' } as EstadoBusca }
  );

  private consultar(q: string, cat: string): Observable<EstadoBusca> {
    const rotulo = q || cat || 'Todos os produtos';
    const fonte$ = q ? this.svc.buscar(q) : cat ? this.svc.porCategoria(cat) : this.svc.listar();
    return fonte$.pipe(
      map((lista): EstadoBusca => ({ status: 'ok', lista, rotulo, erro: '' })),
      catchError(e => of<EstadoBusca>({ status: 'erro', lista: [], rotulo, erro: mensagemErro(e) })),
      startWith<EstadoBusca>({ status: 'carregando', lista: [], rotulo, erro: '' })
    );
  }
}
