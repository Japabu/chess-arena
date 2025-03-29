import { Controller, Get, All, Res, Req, Param } from '@nestjs/common';
import { Request, Response } from 'express';
import { join } from 'path';

@Controller()
export class AppController {
  @Get('*path')
  serveRoot(
    @Param('path') path: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    // Skip API routes
    if (req.url.startsWith('/api')) {
      return;
    }

    // Serve the SPA for frontend routes
    return res.sendFile(join(process.cwd(), '../frontend/dist/index.html'));
  }
}
