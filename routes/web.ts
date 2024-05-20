import express, { Router as ExpressRouter } from 'express';
import { Request, Response } from 'express';
import PagesController from '../app/controller/pages';
import AuthController from '../app/controller/Auth';
import GameController from '../app/controller/Game';
import AuthMiddleware from '../app/middleware/AuthMiddleware';


const Router: ExpressRouter = express.Router();
const Pages: PagesController = new PagesController();
const Auth: AuthController = new AuthController();
const Game: GameController = new GameController();
const AuthSetup: AuthMiddleware = new AuthMiddleware();

Router.get('/', Pages.TrangChu);
Router.get('/404', Pages.Error404);
Router.post('/api/auth', Auth.login);
Router.post('/api/cuoc', AuthSetup.GuestAPI, Game.cuoc);


Router.use((req: Request, res: Response) => {
  res.redirect('/404');
});

export default Router;
