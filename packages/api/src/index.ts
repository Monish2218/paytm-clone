import express, {Application} from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import userRouter from './routes/user.routes';

const app: Application = express();

dotenv.config();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

const port = process.env.PORT ?? 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/health', (req, res) => {
  res.status(200).json({status: 'ok'});
});

app.use('/api/v1/user', userRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

export default app;