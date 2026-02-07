import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { oAuth2Client } from 'src/core/drive/google-drive.service';

@Controller('oauth2callback')
export class GoogleOauthController {
  @Get()
  async oauth2callback(@Query('code') code: string) {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    console.log('Access Token:', tokens.access_token);
    console.log('Refresh Token:', tokens.refresh_token);

    return 'Tokens saved successfully!';
  }


  @Post('/get-refreshToken')
  async getRefreshToken(@Body() body: any) {
    console.log("🚀 ~ GoogleOauthController ~ getRefreshToken ~ code:", body.code)
    const { tokens } = await oAuth2Client.getToken(body.code);
    console.log(tokens);
  }
}

// https://accounts.google.com/o/oauth2/v2/auth?
// client_id=698037729262-kc1fl8loffvicqiq3nqj4sedd35ca1u4.apps.googleusercontent.com&
// redirect_uri=http://localhost:3000/oauth2callback&
// response_type=code&
// scope=https://www.googleapis.com/auth/drive.file&
// access_type=offline