import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ItemCesta } from '../model/item-cesta';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-cesta',
  styleUrl: './cesta.css',
  templateUrl: './cesta.html',
})
export class Cesta implements OnInit {
  mensagem: string = "";
  valorCesta: number = 0;
  itens: ItemCesta[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.carregarCesta();
      this.calculaTotal();
    }
  }

  carregarCesta() {
    const cestaSalva = localStorage.getItem("cesta");
    this.itens = cestaSalva ? JSON.parse(cestaSalva) : [];
  }

  calculaTotal() {
    this.valorCesta = 0;
    for (let obj of this.itens) {
      this.valorCesta += obj.valorTotal;
    }
  }
}