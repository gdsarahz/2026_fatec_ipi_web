import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { ProdutoService, Produto } from '../core/produto.service';
import { CardProdutoComponent } from '../shared/card-produto.component';

@Component({
  selector: 'app-busca',
  standalone: true,
  imports: [CardProdutoComponent],
  template: `
    <div class="container pagina">
      <h1>Pesquisa por: {{ dados().rotulo }}</h1>
      @if (dados().lista.length) {
        <div class="row g-3 g-lg-4">
          @for (p of dados().lista; track p.id) {
            <div class="col-12 col-sm-6 col-lg-4 col-xl-3"><app-card-produto [produto]="p" /></div>
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
  dados = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(
      map(p => ({ q: p.get('q') ?? '', cat: p.get('cat') ?? '' })),
      switchMap(f => this.svc.buscar(f.q, f.cat).pipe(map(lista => ({ lista, rotulo: f.q || f.cat || 'Todos os produtos' }))))
    ),
    { initialValue: { lista: [] as Produto[], rotulo: '' } }
  );
}
