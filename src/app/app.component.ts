import { Component } from '@angular/core';
import { PacientesComponent } from './pages/pacientes/pacientes.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PacientesComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'clinic-system';
}
