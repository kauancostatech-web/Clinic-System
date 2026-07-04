import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return a clinic user for demo credentials', () => {
    let usuario: any;

    service.login('clinica@clinicsystem.local', 'clinica123', 'clinica').subscribe((response) => {
      usuario = response;
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios?email=clinica%40clinicsystem.local&senha=clinica123');
    req.flush([
      {
        id: 1,
        nome: 'Clínica Paulista Saúde',
        email: 'clinica@clinicsystem.local',
        senha: 'clinica123',
        perfil: 'clinica'
      }
    ]);

    expect(usuario?.perfil).toBe('clinica');
    expect(usuario?.email).toBe('clinica@clinicsystem.local');
  });

  it('should not return a user when the profile does not match', () => {
    let usuario: any;

    service.login('clinica@clinicsystem.local', 'clinica123', 'paciente').subscribe((response) => {
      usuario = response;
    });

    const req = httpMock.expectOne('http://localhost:3000/usuarios?email=clinica%40clinicsystem.local&senha=clinica123');
    req.flush([
      {
        id: 1,
        nome: 'Clínica Paulista Saúde',
        email: 'clinica@clinicsystem.local',
        senha: 'clinica123',
        perfil: 'clinica'
      }
    ]);

    expect(usuario).toBeUndefined();
  });
});
