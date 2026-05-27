import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PacientesComponent } from './pacientes.component';
import { PacientesService } from './pacientes.service';

describe('PacientesComponent', () => {
  let component: PacientesComponent;
  let fixture: ComponentFixture<PacientesComponent>;
  const pacientesServiceMock = {
    listar: jasmine.createSpy('listar').and.returnValue(of([])),
    cadastrar: jasmine.createSpy('cadastrar').and.returnValue(of({ id: 1, nome: 'Ana', cpf: '123', telefone: '999' })),
    atualizar: jasmine.createSpy('atualizar').and.returnValue(of({ id: 1, nome: 'Ana', cpf: '123', telefone: '999' })),
    excluir: jasmine.createSpy('excluir').and.returnValue(of(void 0))
  };

  beforeEach(async () => {
    pacientesServiceMock.listar.calls.reset();
    pacientesServiceMock.cadastrar.calls.reset();
    pacientesServiceMock.atualizar.calls.reset();
    pacientesServiceMock.excluir.calls.reset();

    await TestBed.configureTestingModule({
      imports: [PacientesComponent],
      providers: [{ provide: PacientesService, useValue: pacientesServiceMock }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list patients on init', () => {
    expect(pacientesServiceMock.listar).toHaveBeenCalled();
  });

  it('should create a patient', () => {
    component.nome = 'Ana';
    component.cpf = '123';
    component.telefone = '999';

    component.salvar();

    expect(pacientesServiceMock.cadastrar).toHaveBeenCalledWith({
      nome: 'Ana',
      cpf: '123',
      telefone: '999'
    });
  });
});
