import express, { Express, Router } from 'express';

interface ServerOptions {
  port: number;
  routes: Router;
}

export class Server {
  private readonly app: Express;
  private readonly port: number;
  private readonly routes: Router;

  constructor(options: ServerOptions) {
    this.app = express();
    this.port = options.port;
    this.routes = options.routes;
  }

  public start(): void {
    // Middleware obligatorio para parsear el cuerpo JSON entrante en las peticiones
    this.app.use(express.json());

    // Registro de rutas bajo el prefijo general /api
    this.app.use('/api', this.routes);

    this.app.listen(this.port, () => {
      console.log(`[HTTP Server] Servidor ejecutándose en http://localhost:${this.port}`);
    });
  }
}