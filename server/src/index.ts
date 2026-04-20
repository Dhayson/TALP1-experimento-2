import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/answer', (req, res) => {
  res.json({ answer: 42 });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});