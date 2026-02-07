import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*', // 开发环境允许所有来源，生产环境应限制
  },
})
export class VotesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('VotesGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * 广播投票更新事件到指定饭桌的所有客户端
   * @param tableId 饭桌 ID
   * @param data 投票数据（包含更新后的饭桌信息）
   */
  broadcastVoteUpdate(tableId: string, data: any) {
    this.server.emit(`table:${tableId}:vote`, data);
    this.logger.log(`Broadcasted vote update for table ${tableId}`);
  }
}
