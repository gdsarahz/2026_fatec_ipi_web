// Modelos espelham as entidades do backend (Produto, Cliente, Pedido e ItemPedido).

export interface Produto {
  codigo: number;
  nome: string;
  categoria: string;
  // 1ª linha = descrição; linhas seguintes = características do produto
  descritivo: string;
  valor: number;
  valorPromo: number;
  quantidade: number;
  destaque: number;
}

export interface Cliente {
  codigo: number;
  nome: string;
  email: string;
  telefone: string;
  documento: string;   // CPF
  logradouro: string;  // endereço de entrega
  senha?: string;      // só é enviada ao backend; nunca volta na resposta
  ativo?: number;
}

export interface ItemPedido {
  codigoItemPedido: number;
  codigoProduto: number;
  quantidade: number;
  valor: number;
}

export interface Pedido {
  codigoPedido: number;
  valorTotal: number;
  entrega: string;
  obs: string;
  dataPedido?: string | number[];
  codigoCliente: number;
  itens: ItemPedido[];
}

// Item da cesta (a cesta fica no navegador até o pedido ser finalizado)
export interface ItemCesta {
  produto: Produto;
  qtd: number;
}

export const arredondar = (n: number): number => Math.round(n * 100) / 100;

/** Preço que o cliente paga: o promocional, quando existir. */
export const precoVenda = (p: Produto): number => (p.valorPromo > 0 ? p.valorPromo : p.valor);

export const emPromocao = (p: Produto): boolean => p.valorPromo > 0;

export const descricaoCurta = (p: Produto): string => (p.descritivo ?? '').split('\n')[0];

export const caracteristicas = (p: Produto): string[] =>
  (p.descritivo ?? '').split('\n').slice(1).filter(l => l.trim().length > 0);

/** Converte a data do pedido (texto ISO ou lista [ano, mês, dia, ...]) em Date. */
export function paraData(v: unknown): Date | null {
  if (typeof v === 'string' && v) {
    const d = new Date(v.replace(/(\.\d{3})\d+/, '$1'));
    return isNaN(d.getTime()) ? null : d;
  }
  if (Array.isArray(v) && v.length >= 3) {
    const [a, m, d, h = 0, mi = 0, s = 0] = v as number[];
    return new Date(a, m - 1, d, h, mi, s);
  }
  return null;
}
