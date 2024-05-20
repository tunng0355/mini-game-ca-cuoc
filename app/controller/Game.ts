import Game from '../model/Game';
import Order from '../model/Order';
import User from '../model/User';

import { Server } from 'socket.io';
import { Request, Response } from 'express';

interface CustomRequest extends Request {
  user?: any;
}

class GameController {
  static async run(io: Server) {
    try {
      const ck = await Game.countDocuments({ nama_materi: 'HTML' });

      if (ck === 0) {
        const newGame = new Game({
          phien: 1,
          TeamA: '0',
          TeamB: '0',
          time: 60,
          status: 'start',
        });
        await newGame.save();
        io.emit('gameData', { message: 'Đang tạo phiên...', type: 'newgame' });
      } else {

        const game = await Game.findOne();
        if (game) {
          var phien = Number(game.phien);

          let { time, TeamA, TeamB, status } = game;

          if (game.status === 'start') {
            if (time > 0) {
              time = time - 1;
              TeamB = '0';
              TeamA = '0';
              status = 'start';
            } else {
              time = 10;
              const min = Math.ceil(1);
              const max = Math.floor(10);
              TeamB = String(Math.floor(Math.random() * (max - min + 1)) + min);
              TeamA = String(Math.floor(Math.random() * (max - min + 1)) + min);
              status = 'done';
              if (Number(TeamB) > Number(TeamA)) {
                var win = "B";
                await Order.findOneAndUpdate(
                  { phien: phien, team: win }, { status: 'win' }, // New data to update
                  { new: true }
                );      
                 await Order.findOneAndUpdate(
                  { phien: phien, team: 'A' },
                  { status: 'thua' }, // New data to update
                  { new: true }
                );

                var userwin = await Order.find({ phien: phien, team: win });
                for (const item of userwin) {
                  var ck_user = await User.findOne({ username: item.username });
                
                  if (ck_user) {
                    // Check if ck_user is not undefined or null
                    // Accessing ck_user.money is safe here
                    const updatedMoney = Number(ck_user.money) + Number(item.quantity) + Number(item.quantity) ;
                    const wintong = Number(ck_user.win) + Number(item.quantity) + Number(item.quantity) ;
                    await User.findOneAndUpdate(
                      { username: item.username },
                     { money: updatedMoney, win:  wintong} , // Increment the money field by updatedMoney
                      { new: true }
                    );
                  }
                }
                var phien = Number(game.phien) + 1;
         
              } else if (Number(TeamB) < Number(TeamA)) {
                var win = "A";
                await Order.findOneAndUpdate(
                  { phien: phien, team: win },
                  { status: 'win' }, // New data to update
                  { new: true }
                );
                await Order.findOneAndUpdate(
                  { phien: phien, team: 'B' },
                  { status: 'thua' }, // New data to update
                  { new: true }
                );
                console.log('A win')

                var userwin = await Order.find({ phien: phien, team: win });
                for (const item of userwin) {
                  var ck_user = await User.findOne({ username: item.username });
                
                  if (ck_user) {
                    // Check if ck_user is not undefined or null
                    // Accessing ck_user.money is safe here
                    const updatedMoney = Number(ck_user.money) + Number(item.quantity) + Number(item.quantity) ;
                    const wintong = Number(ck_user.win) + Number(item.quantity) + Number(item.quantity) ;
                    await User.findOneAndUpdate(
                      { username: item.username },
                     { money: updatedMoney, win:  wintong} , // Increment the money field by updatedMoney
                      { new: true }
                    );
                  }
                }

                var phien = Number(game.phien) + 1;


              } else {
                var win = "=";
                await Order.findOneAndUpdate(
                  { phien: phien },
                  { status: 'hoa' }, // New data to update
                  { new: true }
                );

                var userwin = await Order.find({ phien: phien });
                for (const item of userwin) {
                  var ck_user = await User.findOne({ username: item.username });

                  if (ck_user) {
                    // Check if ck_user is not undefined or null
                    // Accessing ck_user.money is safe here
                    const updatedMoney = Number(ck_user.money) + Number(item.quantity);
                    await User.findOneAndUpdate(
                      { username: item.username },
                      { money: updatedMoney },
                      { new: true }
                    );
                  }
                }
                var phien = Number(game.phien) + 1;

              }
            }
          } else {
            if (time > 0) {
              time = time - 1;
              TeamB = game.TeamB;
              TeamA = game.TeamA;
              status = 'done';
            } else {
              time = 60;
              TeamB = '0';
              TeamA = '0';
              status = 'start';
            }
          }

          game.phien = phien;
          game.time = time;
          game.TeamA = TeamA;
          game.TeamB = TeamB;
          game.status = status;

          await game.save();

          io.emit('gameData', {
            message: 'Cập nhật game thành công',
            type: 'updategame',
            data: {
              TeamA: game.TeamA,
              TeamB: game.TeamB,
              time: game.time,
              status: game.status,
            },
          });
      
        }
      }
    } catch (error) {
      // Handle the error
    }
  }

  public async cuoc(req: CustomRequest, res: Response): Promise<void> {
    const { quantity, team } = req.body;
    const ck = await Game.countDocuments({ nama_materi: 'HTML' });

    if (ck === 0) {
      res.status(400).json({ message: 'Chưa có phiên nào' });
      return;
    }

    if (!quantity || !team) {
      res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (quantity < 100) {
      res.status(400).json({ message: 'Số lượng phải lớn hơn hoặc bằng 100' });
      return;
    }

    var type = team != 1 ? 'B' : 'A';
    const game = await Game.findOne();

    if (game && game.time < 11) {
      res.status(400).json({ message: 'Đã quá thời gian đặt cược' });
      return;
    }

    if (req.user.money < quantity) {
      res.status(400).json({ message: 'Bạn không đủ tiền vui lòng nạp thêm' });
      return;
    }

    var Nums = Number(req.user.money) - Number(quantity);
    var Gameck = await Game.findOne();

    if (Gameck) {
      const newOrder = new Order({
        phien: Gameck.phien,
        username: req.user.username,
        quantity: quantity,
        team: type,
        status: 'pending',
      });
      await newOrder.save();
      await User.findOneAndUpdate(
        { username: req.user.username },
        {
          moneycu: req.user.money,
          money: Nums,
        }, // New data to update
        { new: true }
      );

      res.status(200).json({ message: 'Đặt cược thành công' });
    } else {
      res.status(400).json({ message: 'Không tìm thấy phiên' });
    }
  }
}

export default GameController;