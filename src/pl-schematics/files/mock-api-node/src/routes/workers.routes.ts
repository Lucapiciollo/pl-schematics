import { Router } from 'express';
import workers from '../data/workers.mock.json';

/**
 * @author l.piciollo
 * Router Express del mock 'workers': espone la lista dei lavoratori e il dettaglio per id,
 * leggendo i dati dal file statico workers.mock.json. E' montato su /api/workers in index.ts.
 */
export const workersRouter = Router();

/**
 * @author l.piciollo
 * GET /api/workers: restituisce l'elenco completo dei lavoratori del mock.
 * @param req :richiesta HTTP (non utilizzata)
 * @param res :risposta HTTP, valorizzata con l'array JSON dei lavoratori
 */
workersRouter.get('/', function(req, res) {
  res.json(workers);
});

/**
 * @author l.piciollo
 * GET /api/workers/:id: restituisce il lavoratore con l'id indicato, oppure 404 con un messaggio se non esiste.
 * @param req :richiesta HTTP, con il parametro di rotta id
 * @param res :risposta HTTP, valorizzata con il lavoratore o con l'errore 404
 */
workersRouter.get('/:id', function(req, res) {
  const id = req.params.id;

  const worker = (workers as any[]).find(function(item) {
    return String(item.id) === String(id);
  });

  if (!worker) {
    res.status(404).json({
      message: 'Worker not found',
      id: id,
    });

    return;
  }

  res.json(worker);
});