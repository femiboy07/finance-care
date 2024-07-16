import { google } from "googleapis"


const oauth2Client=new google.auth.OAuth2({
    clientId:process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    redirectUri:process.env.REDIRECT_URI

 })

 export default oauth2Client;