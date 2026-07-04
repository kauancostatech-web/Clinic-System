import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CadastroPacienteComponent } from './cadastro-paciente.component';
import { AuthService } from '../../services/auth.service';
import { PortalApiService } from '../../services/portal-api.service';

describe('CadastroPacienteComponent', () => {
  let fixture: ComponentFixture<CadastroPacienteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroPacienteComponent],
      providers: [
        {
          provide: AuthService,
          useValue: {
            cadastrar: () => of({})
          }
        },
        {
          provide: PortalApiService,
          useValue: {
            listarEspecialidades: () => of([]),
            listarUnidades: () => of([])
          }
        },
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroPacienteComponent);
    fixture.detectChanges();
  });

  it('should render the clinic and specialty selection fields', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Clínica preferida');
    expect(text).toContain('Tipo de médico');
  });
});
