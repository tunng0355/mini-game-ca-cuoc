import { Request, Response, NextFunction } from 'express';
import User from '../model/User'; // Import the Shop model

interface CustomRequest extends Request {
  user?: any;
}

class PagesController {
  
  public async TrangChu(req: CustomRequest, res: Response, next: NextFunction) {
    const topUsers = await User.find().sort({ win: -1 }).limit(5);

    return res.render('home/index', { users: req.user,topUsers:topUsers});
  }

  public async Error404(req: CustomRequest, res: Response, next: NextFunction) {
    return res.render('404');
  }

}

export default PagesController;
