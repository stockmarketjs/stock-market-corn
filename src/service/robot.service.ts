import { Injectable, UnauthorizedException, NotFoundException, BadRequestException, Logger, Inject } from '@nestjs/common';
import { BaseService } from './base.service';
import { UserService } from './user.service';
import { Sequelize } from 'sequelize-typescript';
import { ConstProvider } from '../constant/provider.const';
import { StockService } from './stock.service';
import * as _ from 'lodash';
import { Transaction } from 'sequelize/types';
import { Calc } from '../common/util/calc';

@Injectable()
export class RobotService extends BaseService {

    constructor(
        @Inject(ConstProvider.SEQUELIZE) private readonly sequelize: Sequelize,
        private readonly userService: UserService,
        private readonly stockService: StockService,
    ) {
        super();
    }

    private async randomStrategy(
        operatorId: string,
        transaction?: Transaction,
    ) {
        if (await this.random()) {
            await this.buyRandomStock(operatorId, transaction);
        }
        if (await this.random()) {
            await this.soldRandomStock(operatorId, transaction);
        }
    }

    private async random(): Promise<boolean> {
        if (_.random(0, 6) !== 2) return false;
        return true;
    }

    private async buyRandomStock(
        operatorId: string,
        transaction?: Transaction,
    ) {
        const stocks = await this.stockService.findAll(transaction);
        const stock = _.shuffle(stocks).pop();
        if (!stock) return false;

        const hand = _.random(1, 100);
        const price = _.round(_.random(Calc.mul(stock.currentPrice, 0.9), Calc.mul(stock.currentPrice, 1.1)), 2);
        await this.stockService.buy(stock.id, price, hand, operatorId, transaction);
    }

    private async soldRandomStock(
        operatorId: string,
        transaction?: Transaction,
    ) {
        const stocks = await this.stockService.findAll(transaction);
        const stock = _.shuffle(stocks).pop();
        if (!stock) return false;

        const hand = _.random(1, 100);
        const price = _.round(_.random(Calc.mul(stock.currentPrice, 0.9), Calc.mul(stock.currentPrice, 1.1)), 2);
        await this.stockService.sold(stock.id, price, hand, operatorId, transaction);
    }

    public async dispatchStrategy(
        operatorId: string,
        transaction?: Transaction,
    ) {
        await this.randomStrategy(operatorId, transaction);
    }

}