import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../model/User';

interface CustomRequest extends Request {
  user?: any;
}

class AuthMiddleware {
  public async getUser(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = (req.session as any)['access_token'];
    if (token) {
      req.user = false;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        throw new Error('Thiếu ACCESS_TOKEN_SECRET');
      }
      if (token) {
        const decoded: JwtPayload | string = jwt.verify(
          token,
          accessTokenSecret,
        );

        if (typeof decoded !== 'string') {
          const user = await User.findOne({ username: decoded.username });
          if (user) {
            req.user = user; // Gán đối tượng user vào req.user
          }
          // Lấy thông tin người dùng từ cơ sở dữ liệu hoặc nguồn dữ liệu khác
        }
      }
    }
    next();
  }

  public async Auth(
    req: CustomRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const token = (req.session as any)['access_token'];
    if (token) {
      req.user = false;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        throw new Error('Thiếu ACCESS_TOKEN_SECRET');
      }
      if (token) {
        try {
          const decoded: JwtPayload | string = jwt.verify(
            token,
            accessTokenSecret,
          );
          if (typeof decoded !== 'string') {
            const user = await User.findOne({ username: decoded.username });
            if (user) {
              return res.redirect('/');
            }
          }
        } catch (error) {
          next();
        }
      }
    }
    next();
  }

  public async AuthAPI(
    req: CustomRequest,
    res: Response<any>,
    next: NextFunction,
  ): Promise<void> {
    const token = (req.session as any)['access_token'];
    if (token) {
      req.user = false;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        throw new Error('Thiếu ACCESS_TOKEN_SECRET');
      }
      if (token) {
        try {
          const decoded: JwtPayload | string = jwt.verify(
            token,
            accessTokenSecret,
          );

          if (typeof decoded !== 'string') {
            const user = await User.findOne({ username: decoded.username });
            if (user) {
              res.status(400).json({ message: 'Bạn đã đăng nhập tài khoản' });
              return; // Return after sending the response
            }
          }
        } catch (error) {
          next(error); // Pass the error to the error handling middleware
          return; // Return after passing the error
        }
      }
    }
    next();
  }

  public async Guest(
    req: CustomRequest,
    res: Response<any>,
    next: NextFunction,
  ): Promise<void> {
    const token = (req.session as any)['access_token'];
    if (token) {
      req.user = null;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        throw new Error('Thiếu ACCESS_TOKEN_SECRET');
      }
      try {
        const decoded: JwtPayload | string = jwt.verify(
          token,
          accessTokenSecret,
        );
        if (typeof decoded !== 'string') {
          const user = await User.findOne({
            username: (decoded as JwtPayload).username,
          });
          
          if (user) {
            req.user = user; // Gán đối tượng user vào req.user
            next();
            return;
          }
        }
      } catch (error) {
        res.redirect('/');
        return;
      }
    }
    res.redirect('/');
  }

  public async GuestAPI(
    req: CustomRequest,
    res: Response<any>,
    next: NextFunction,
  ): Promise<void> {
    const token = (req.session as any)['access_token'];
    if (token) {
      req.user = null;
      const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
      if (!accessTokenSecret) {
        throw new Error('Thiếu ACCESS_TOKEN_SECRET');
      }
      try {
        const decoded: JwtPayload | string = jwt.verify(
          token,
          accessTokenSecret,
        );
        if (typeof decoded !== 'string') {
          const user = await User.findOne({
            username: (decoded as JwtPayload).username,
          });
          if (user) {
            req.user = user; // Gán đối tượng user vào req.user
            next();
            return;
          }
        }
      } catch (error) {
        res.status(400).json({ message: 'Bạn chưa đăng nhập tài khoản' });

        return;
      }
    }
    res.status(400).json({ message: 'Bạn chưa đăng nhập tài khoản' });
  }
}

export default AuthMiddleware;
