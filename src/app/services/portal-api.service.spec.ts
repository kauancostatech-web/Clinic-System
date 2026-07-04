import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PortalApiService } from './portal-api.service';

describe('PortalApiService', () => {
  let service: PortalApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(PortalApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return an empty list when the backend is unavailable', () => {
    let especialidades: unknown[] = [];

    service.listarEspecialidades().subscribe((response) => {
      especialidades = response;
    });

    const req = httpMock.expectOne('http://localhost:3000/servicos');
    req.flush('server down', { status: 500, statusText: 'Server Error' });

    expect(especialidades).toEqual([]);
  });
});
