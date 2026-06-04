import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  /** 首次启动引导管理员账号 */
  async onModuleInit() {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;
    if (!username || !password) return;
    const existing = await this.userModel.findOne({ username }).exec();
    if (existing) return;
    await this.create(username, password, ['admin', 'user']);
    this.logger.log(`已引导管理员账号: ${username}`);
  }

  async create(username: string, password: string, roles: string[] = ['user']) {
    const passwordHash = await bcrypt.hash(password, 10);
    return this.userModel.create({ username, passwordHash, roles });
  }

  findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }

  findById(id: string | Types.ObjectId) {
    return this.userModel.findById(id).exec();
  }

  async validatePassword(plain: string, hash: string) {
    return bcrypt.compare(plain, hash);
  }

  async addRole(userId: string, role: string) {
    return this.userModel.updateOne({ _id: userId }, { $addToSet: { roles: role } }).exec();
  }

  /** 分账：累加开发者净收益 */
  async addEarnings(userId: string | Types.ObjectId, amount: number) {
    return this.userModel.updateOne({ _id: userId }, { $inc: { earningsBalance: amount } }).exec();
  }
}
