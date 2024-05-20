import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/web';
import session from 'express-session';
import AuthMiddleware from './app/middleware/AuthMiddleware';
import Game from './app/controller/Game';
import bodyParser from 'body-parser';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cron from 'node-cron'; // Import the 'node-cron' module

dotenv.config();

const app: express.Application = express();

const PORT: number = Number(process.env.PORT) || 3001;
const MONGODB_URI: string = process.env.MONGODB_URI || '';
const SESSION_SECRET: string = process.env.ACCESS_SESSION_SECRET || '';
const AuthSetup: AuthMiddleware = new AuthMiddleware();

app.use(
  session({
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  const userAgent = req.headers['user-agent'];
  if (userAgent && userAgent.includes('HTTrack')) {
    return res.status(403).send('Forbidden');
  }
  next();
});

const limiter = rateLimit({
  windowMs: 30 * 1000,
  max: 1500,
});

app.use(limiter);
app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(AuthSetup.getUser);
app.use(bodyParser.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/', routes);

app.set('view engine', 'ejs');
app.set('views', './views');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    const server = http.createServer(app);
    const io = new Server(server);

    io.on('connection', async (socket: Socket) => {
      console.log('A user connected');

      io.sockets.emit('gameData', {
        hello: 1
      });

      socket.on('disconnect', () => {
        console.log('A user disconnected');
      });
    });

    server.listen(PORT, () => {
      console.clear();
      console.info(`Server is running on ${process.env.URL}:${PORT}.`);
    });

    // Schedule the cron job
    cron.schedule('*/1 * * * * *', async () => {
      await Game.run(io);
    });
  })
  .catch((err) => console.log(err));