import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'detalhes-profissional/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'agendar-consulta/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'pagamento/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
