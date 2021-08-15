# Discord-Success-Poster
Discord success bot with retweet and leaderboard support

![Alt Text](https://media.giphy.com/media/ZY7ZBHyRAr33A1cBfG/giphy.gif)

## Prerequisites

- Linux / Windows server ([link](https://cloud.google.com/free))
- Discord application ([link](https://discord.com/developers/applications/))
- Twitter developer account ([link](https://developer.twitter.com/en/apply-for-access))

## Get started

Clone this repo and edit config.json with your details

**twitterData** - Your twitter developer keys  
**token** - Your discord bot token  
**successChannelID** -  The ID of the success channel  
**canDeleteSuccess** -  The key permission a user must have to delete others success  
**canResetLeaderboard** -  The key permission a user must have to reset the leaderboard  
**name** - Your server name  
**imageUrl** - The logo of your server or of a random image (mandatory)  
**twitterId** - Your server name  
**twitterHandle** - The Twitter handle of your group (you can get it [here](https://tweeterid.com/))

#### Key permission

ADMINISTRATOR = Group administrator
MANAGE_SERVER = A role with manage server permission
MANAGE_MESSAGES = A role with manage messages permission
etc..


### How it works

You will get a point for every image posted on the success channel (after the bot is running) and two points for every Twitter success post

### Bot commands

*!leaderboard* - Shows the leaderboard  
*!resetLeaderboard* - Reset the leaderboard (only authorized users can reset the leaderboard)

![Alt Text](https://media.giphy.com/media/IcWzmQuWJnxBnlnxZn/giphy.gif)
