import { Router } from 'express';
import workers from '../data/workers.mock.json';

export const workersRouter = Router();

workersRouter.get('/', function(req, res) {
  res.json(workers);
});

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