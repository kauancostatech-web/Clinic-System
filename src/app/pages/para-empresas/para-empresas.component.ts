import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-para-empresas',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './para-empresas.component.html',
  styleUrl: './para-empresas.component.css'
})
export class ParaEmpresasComponent {}
