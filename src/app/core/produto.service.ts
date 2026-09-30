import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Produto {
  id: number;
  nome: string;
  categoria: string;
  preco: number;
  icone: string;     
  imagem?: string;    
  descricao: string;
  detalhes: string[];
}

const PRODUTOS: Produto[] = [
  { id: 1, nome: 'Maçaneta Interna HB20 Cinza', categoria: 'Maçanetas Internas', imagem: '/1.png', preco: 39.9, icone: 'bi-disc',
    descricao: 'Maçaneta interna para HB20 Lado Esquerdo encaixe original.',
    detalhes: ['Material: plástico', 'Posição: dianteira ou traseira', 'Garantia: 12 meses'] },
  { id: 2, nome: 'Fechadura Tampa Traseira Gol G2', categoria: 'Fechaduras', imagem: '/2.png', preco: 49.9, icone: 'bi-circle',
    descricao: 'Fechadura tampa traseira porta malas compátivel com original.',
    detalhes: ['Material: Metal', 'Posição: Tampa Traseira', 'Garantia: 12 meses'] },
  { id: 3, nome: 'Lanterna Traseira Corsa Wind', categoria: 'Lanternas', imagem: '/3.png', preco: 134.9, icone: 'bi-cup-straw',
    descricao: 'Lanterna Traseira Tricolor Corsa Wind Par.',
    detalhes: ['Par: Lado Esquerdo e Direito', 'Compatível com encaixe original'] },
  { id: 4, nome: 'Coxim HB20', categoria: 'Coxim', imagem: '/4.png', preco: 59.9, icone: 'bi-wind',
    descricao: 'Coxim Amortecedor Hb20 com Rolamento.',
    detalhes: ['Posição: Dianteiro', 'Lado: Esquerdo e Direito', 'Garantia: 6 meses'] },
  { id: 5, nome: 'Par Maçanetas Internas Kwid', categoria: 'Maçanetas Internas', imagem: '/5.png', preco: 27.5, icone: 'bi-lightning-charge',
    descricao: 'Par Maçanetas Internas Kwid Cromadas',
    detalhes: ['Par', 'Cor: Prata Cromado', 'Garantia: 6 meses'] },
  { id: 6, nome: 'Kit 4 Maçanetas Internas Uno', categoria: 'Maçanetas Internas', imagem: '/6.png', preco: 89.0, icone: 'bi-link-45deg',
    descricao: 'Jogo com 4 Maçanetas Internas Prtetas Compatíveis com Uno',
    detalhes: ['Kit com 4', 'Cor: Preto', 'Garantia: 6 meses'] },
  { id: 7, nome: 'Fechadura Porta Dianteira Esquerda Gol', categoria: 'Fechaduras', imagem: '/7.png', preco: 49.9, icone: 'bi-arrows-collapse-vertical',
    descricao: 'Fechadura para Porta Dianteira Gol Compatível com Original',
    detalhes: ['Material: Metal', 'Posição: Dianteira', 'Lado: Esquerdo', 'Unidade', 'Garantia: 12 meses'] },
  { id: 8, nome: 'Par Maçanetas Externas Dianteiras Elantra', categoria: 'Maçanetas Externas', imagem: '/8.png', preco: 79.9, icone: 'bi-tools',
    descricao: 'Maçanetas Externas Dianteiras Hyundai Elantra Com e Sem Furo para Chave.',
    detalhes: ['Kit com 2 peças', 'Cor: Preto', 'Lado: Esquerdo e Direito', 'Garantia: 6 meses'] },
  { id: 9, nome: 'Fechadura Tampa Traseira Corsa', categoria: 'Fechaduras', imagem: '/9.png', preco: 59.0, icone: 'bi-battery-charging',
    descricao: 'Fechadura Trava Tampa Traseira Porta Malas Corsa Compatível com Original',
    detalhes: ['Material: Metal', 'Aplicação: Porta Malas', 'Garantia: 18 meses'] },
  { id: 10, nome: 'Kit 4 Maçanetas Externas Uno', categoria: 'Maçanetas Externas', imagem: '/10.png', preco: 89.9, icone: 'bi-lightning',
    descricao: 'Kit 4 Maçanetas Externas Uno Compatível Com Original',
    detalhes: ['Cor: Preto', 'Kit com 4', 'Garantia: 6 meses'] },
  { id: 11, nome: 'Par Pingo Led T10', categoria: 'Iluminação', imagem: '/11.png', preco: 19.9, icone: 'bi-lightbulb',
    descricao: 'Par de lâmpadas LED T10 com luz branca de 6000K e baixo consumo.',
    detalhes: ['Par (2 unidades)', 'Potência: 12 v', 'Cor: 6000K'] },
  { id: 12, nome: 'Par Maçanetas Internas Dianteira Corsa', categoria: 'Maçanetas Internas', imagem: '/12.png', preco: 49.0, icone: 'bi-brightness-high',
    descricao: 'Par Maçanetas Internas Dianteiras Corsa Compatíveis com Originais.',
    detalhes: ['Par', 'Cor: Preto', 'Lado: Esquerdo e Direito', 'Garantia: 12 meses'] }
];

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  readonly categorias = ['Maçanetas Externas', 'Maçanetas Internas', 'Fechaduras', 'Lanternas', 'Coxim', 'Iluminação'];

  // No P2 trocar 'of(...)' por chamadas HttpClient.
  listar(): Observable<Produto[]> { return of(PRODUTOS); }

  obter(id: number): Observable<Produto | undefined> {
    return of(PRODUTOS.find(p => p.id === id));
  }

  buscar(termo: string, categoria: string): Observable<Produto[]> {
    const t = termo.trim().toLowerCase();
    return this.listar().pipe(map(lista => lista.filter(p =>
      (!categoria || p.categoria === categoria) &&
      (!t || (p.nome + ' ' + p.categoria + ' ' + p.descricao).toLowerCase().includes(t)))));
  }
}
