import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma.service';

export interface SessionData {
  id: string;
  createdAt: Date;
  lastAccessed: Date;
  userId?: string; // Optional user ID if authenticated
  data: Record<string, any>; // Additional session data
}

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Creates a new session and returns the session ID
   */
  async createSession(userData: Partial<SessionData> = {}): Promise<string> {
    const sessionId = randomUUID(); // Generate secure UUID
    const now = new Date();

    const session: SessionData = {
      id: sessionId,
      createdAt: now,
      lastAccessed: now,
      data: userData.data || {},
      userId: userData.userId,
    };

    // Store session in database
    await this.prisma.session.upsert({
      where: { id: sessionId },
      update: {
        lastAccessed: now,
        data: session.data,
        userId: session.userId,
      },
      create: {
        id: sessionId,
        createdAt: now,
        lastAccessed: now,
        data: session.data,
        userId: session.userId,
      },
    });

    return sessionId;
  }

  /**
   * Gets session data by session ID
   */
  async getSession(sessionId: string): Promise<SessionData | null> {
    const dbSession = await this.prisma.session.findUnique({
      where: { id: sessionId },
    });

    if (!dbSession) {
      return null;
    }

    // Update last accessed time
    await this.prisma.session.update({
      where: { id: sessionId },
      data: { lastAccessed: new Date() },
    });

    return {
      id: dbSession.id,
      createdAt: dbSession.createdAt,
      lastAccessed: dbSession.lastAccessed,
      data: dbSession.data as Record<string, any>,
      userId: dbSession.userId || undefined,
    };
  }

  /**
   * Updates session data
   */
  async updateSession(sessionId: string, data: Partial<SessionData>): Promise<boolean> {
    try {
      await this.prisma.session.update({
        where: { id: sessionId },
        data: {
          ...(data.lastAccessed && { lastAccessed: data.lastAccessed }),
          ...(data.data && { data: data.data }),
          ...(data.userId !== undefined && { userId: data.userId }),
        },
      });
      return true;
    } catch (error) {
      // Session might not exist
      return false;
    }
  }

  /**
   * Deletes a session
   */
  async destroySession(sessionId: string): Promise<boolean> {
    try {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      return true;
    } catch (error) {
      // Session might not exist
      return false;
    }
  }

  /**
   * Cleans up expired sessions (sessions older than 24 hours)
   */
  async cleanupExpiredSessions(): Promise<void> {
    const now = new Date();
    const expirationTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const expiredTime = new Date(now.getTime() - expirationTime);

    await this.prisma.session.deleteMany({
      where: {
        lastAccessed: {
          lt: expiredTime,
        },
      },
    });
  }
}