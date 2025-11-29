import { AuthGuard } from '@nestjs/passport';
import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Let Passport handle JWT verification using the strategy
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    // Provide better error messages
    if (err || !user) {
      if (info?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (info?.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token signature');
      }
      if (info?.message) {
        throw new UnauthorizedException(info.message);
      }
      throw err || new UnauthorizedException('Unauthorized');
    }
    return user;
  }
}
