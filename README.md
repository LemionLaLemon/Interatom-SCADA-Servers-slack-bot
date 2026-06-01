# InterATOM SCADA Bot
## Bot to yeet data over from Vogataya Generating Station
### Which by the way, is a completely fictional power plant, and is a game.

> [!WARNING]  
> InterATOM SCADA Bot is VERY tightly intergated with [Fijium Reactor Core](https://polytoria.com/places/27873) and basically has no uses outside of it

InterATOM SCADA Bot is a fork off Fijium Scada Bot that does basically the same thing as it.

<img width="607" height="210" alt="image" src="https://github.com/user-attachments/assets/7c0e1287-7ef0-430d-a7bd-783ac0a3cb5a" />
<img width="588" height="410" alt="image" src="https://github.com/user-attachments/assets/c5797a13-4524-4555-ae17-ca0c97d3cb73" />

What it does:
- Performs credit operations from the database (only get on this slack version)
- Performs total power operations from the database (..you shouldn't be able to write to total power anyways)

There are no special or fancy features, it just lists statistics from the game ;-;

# Installing & running
1. Clone the repo
```bash
git clone https://github.com/LemionLaLemon/Interatom-SCADA-Servers-slack-bot/
```
2. cd into the new directory
```bash
cd Interatom-SCADA-Servers-slack-bot
```
3. Install required packages (there arent that many)
```bash
npm i
```
4. Create a `.env` file for all of your secrets
```bash
nvim .env
```
or use whatever text editor you use<br><br>
5. Just fill in from this template because everyone is lazy
```env
SLACK_APP_TOKEN = 
SLACK_BOT_TOKEN = 
SUPABASE_API_KEY = 
SUPABASE_AUTH = 
SUPABASE_URL =
```
6. Find out how to quit neovim

`esc` to enter command mode<br>
`:wq` to write and quit<br>
<br>
7. Run the thing
```bash
node index.js
```
