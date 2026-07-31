import express from 'express';
import apiRoutes from './src/routes/api.js';

const app = express();

app.use(express.json());
app.use('/api', apiRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});