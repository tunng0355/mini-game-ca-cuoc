import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import User from '../model/User';
import jwt from 'jsonwebtoken';

class AuthController {
  // Đăng ký người dùng
  public async login(req: Request, res: Response) {
    try {
      const saltRounds = 10;
      const { username, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const token = await jwt.sign(
        {
          username: username,
        },
        process.env.ACCESS_TOKEN_SECRET!,
        {
          algorithm: 'HS256',
          expiresIn: '365d',
        },
      );

      // Kiểm tra các trường bắt buộc
      if (!username || !password) {
        return res
          .status(400)
          .json({ message: 'Vui lòng điền đầy đủ thông tin' });
      }

      var check = await User.findOne({ username: username });

      if (check) {
        // Kiểm tra mật khẩu
        const isPasswordValid = await bcrypt.compare(password, check.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Mật khẩu không chính xác' });
        }else{
          (req.session as any)['access_token'] = token;
          return res.status(200).json({
            message: 'Đăng nhập tài khoản thành công',
            token: token,
            href: '/',
          });
        }

      }else{

        const newUser = new User({
          username: username,
          password: hashedPassword,
          money: 0,
          win: 0,
          moneycu:0,
          status: 'active',
        });

        await newUser.save();
        return res.status(200).json({
          message: 'Đăng ký tài khoản thành công',
          token: token,
          href: '/',
        });
      }

    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: 'Có lỗi gì đó đã xảy ra' });
    }
  }

}

export default AuthController;
