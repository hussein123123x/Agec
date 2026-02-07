import { google } from 'googleapis';

export const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_DRIVE_CLIENT_ID,    
  process.env.GOOGLE_DRIVE_CLIENT_SECRET,   
  process.env.GOOGLE_DRIVE_REDIRECT_URI 
);


oAuth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_DRIVE_REFRESH_TOKEN,
});