import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirmacao-consulta',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmacao-consulta.component.html',
  styleUrl: '../agendar-consulta/agendar-consulta.component.css'
})
export class ConfirmacaoConsultaComponent implements OnInit {
  agendamentoId: string | null = null;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.agendamentoId = this.route.snapshot.queryParamMap.get('agendamentoId');
  }
}
