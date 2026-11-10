import express from 'express';
import cors from 'cors';
import { workersRouter } from './routes/workers.routes';

/**
 * @author l.piciollo
 * Istanza Express del mock delle API: server di sviluppo locale che espone endpoint di esempio (workers)
 * con CORS abilitato e body JSON. La porta e' letta da PORT (default 3001).
 */
const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

/**
 * @author l.piciollo
 * Endpoint di health check: risponde con stato, nome del mock e data corrente per verificare che il server sia attivo.
 * @param req :richiesta HTTP (non utilizzata)
 * @param res :risposta HTTP, valorizzata con un JSON di stato
 */
app.get('/health', function(req, res) {
  res.json({
    status: 'ok',
    app: '<%= dasherize(namePackage) %>-mock-api',
    date: new Date().toISOString(),
  });
});

app.use('/api/workers', workersRouter);

/**
 * @author l.piciollo
 * Avvia il server in ascolto sulla porta configurata e ne stampa l'indirizzo in console.
 */
app.listen(port, function() {
  console.log('Mock API running on http://localhost:' + port);
});