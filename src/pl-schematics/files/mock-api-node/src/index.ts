import express from 'express';
import cors from 'cors';
import { workersRouter } from './routes/workers.routes';

const app = express();
const port = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json());

app.get('/health', function(req, res) {
  res.json({
    status: 'ok',
    app: '<%= dasherize(namePackage) %>-mock-api',
    date: new Date().toISOString(),
  });
});

app.use('/api/workers', workersRouter);

app.listen(port, function() {
  console.log('Mock API running on http://localhost:' + port);
});