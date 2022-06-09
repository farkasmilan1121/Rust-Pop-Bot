# Rust Pop Bot
## Description
A discord.js bot that is capable to display player count and total player count for your servers using battlemetrics's api.
## Here is how it looks like
![Example](https://cdn.discordapp.com/attachments/956232582738116690/959150058111127582/unknown.png)  
## Set-up Guide:
Install [node.js](https://nodejs.org/en/)  
Download the repository  
Create one [discord bot](https://discord.com/developers/applications) for each of your servers and one for the global player count.  
Invite the bots to your server.  
Open powershell in the project's folder and run **npm install**  
Insert discord bot tokens and battlemetrics server ids, that can be found here:  
![BMID](https://cdn.discordapp.com/attachments/956232582738116690/959151945925402654/Nevtelen.png)  
You can also change refresh intervals if you want. Insert the number in ms. (1 s = 1000 ms)  
Run the bot with **node .** or **node index.js**
