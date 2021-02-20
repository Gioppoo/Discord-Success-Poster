const Discord = require('discord.js')
const axios = require('axios')
const Twit = require('twit')
const fs = require('fs')
const path = require('path')

const { twitterData, discordData, groupInfo } = require(path.join(__dirname, 'config.json'))

const client = new Discord.Client()

let leaderboard = {}

var T = new Twit(twitterData)

client.on('ready', async () => {
  try
  {
    leaderboard = await getLeaderboard()
  }
  catch (e)
  {
    console.error(e)
  }
})

client.on('message', async (msg) => {
  try
  {
    if (msg.channel.id === discordData.successChannelID && msg.attachments.size)
    {
      const urls = msg.attachments.map((res) => {
        return res.url
      })
      const image = await axios.get(urls[0], { responseType: 'arraybuffer' })

      T.post('media/upload', { media_data: Buffer.from(image.data).toString('base64') }, function (err, data, response) {
        T.post('statuses/update', { status: 'Success posted in ' + groupInfo.name + (msg.content? ' | '+msg.content: ''), media_ids: [data.media_id_string] }, function (err, data, response) {
          msg.channel.send({embed: {
            "title": "Tweet was posted! React with :wastebasket: to delete",
            "description": "You've earned a point on our rewards leaderboard!",
            "color": 1876223,
            "footer": {
              "text": groupInfo.name + ' Success',
              "icon_url": groupInfo.imageUrl+'?author='+msg.member.id+'&tweetId='+data.id_str
            }
          }}).then((msg) => {
            msg.react('🗑')
          })
          editScore(msg.member.id, 1)
        })
      })
    }
    else if (msg.channel.id === discordData.successChannelID && msg.content.match(/(https\:\/\/twitter\.com\/)/))
    {
      const twitterId = msg.content.match(/(?:(?:\/status\/)([0-9]+))/i)

      if (twitterId)
      {
        T.get('statuses/show/:id', { id: twitterId[1] }, (err, data, response) => {
          if (data.entities && data.entities.user_mentions && data.entities.media)
          {
            let tagged = false
            for (const mention of data.entities.user_mentions)
            {
              if (mention.id_str == groupInfo.twitterId)
              {
                tagged = true
                T.post('statuses/retweet/:id', { id: twitterId[1] }, () => {})
                msg.channel.send({embed: {
                  "title": "Thank you for tweeting your success!",
                  "description": "You've earned 2 points on our rewards leaderboard!",
                  "color": 1876223,
                  "footer": {
                    "text": groupInfo.name + ' Success',
                    "icon_url": groupInfo.imageUrl
                  }
                }})
                editScore(msg.member.id, 2)
                break
              }
            }
            if (!tagged)
            {
              msg.channel.send({embed: {
                "title": "Your tweet doesn't tag us.",
                "description": "Remember to tag @"+groupInfo.twitterHandle+" when posting success!",
                "color": 1876223,
                "footer": {
                  "text": groupInfo.name + ' Success',
                  "icon_url": groupInfo.imageUrl
                }
              }})
            }
          }
        })
      }
      else
      {
        msg.channel.send({embed: {
          "title": "Invalid tweet link",
          "description": "",
          "color": 1876223,
          "footer": {
            "text": groupInfo.name + ' Success',
            "icon_url": groupInfo.imageUrl
          }
        }})
      }
    }
    else if (msg.content == '!leaderboard')
    {
      const users = Object.keys(leaderboard)
      const sorted = users.sort((a, b) => {
        return leaderboard[b] - leaderboard[a]
      })

      let leaderboardText = ''
      for (let i = 0; i < sorted.length && i < 10; i++)
      {
        if (i == 0)
        {
          leaderboardText = '1st - <@'+sorted[i]+'> - '+leaderboard[sorted[i]]
        }
        else if (i == 1)
        {
          leaderboardText += '\n2nd - <@'+sorted[i]+'> - '+leaderboard[sorted[i]]
        }
        else if (i == 2)
        {
          leaderboardText += '\n3rd - <@'+sorted[i]+'> - '+leaderboard[sorted[i]]
        }
        else
        {
          leaderboardText += '\n'+(i+1)+'th - <@'+sorted[i]+'> - '+leaderboard[sorted[i]]
        }
      }

      msg.channel.send({embed: {
            "title": "Leaderboard",
            "description": leaderboardText,
            "color": 3447003
          }})
    }
    else if (msg.content == '!resetLeaderboard' && msg.member.hasPermission('ADMINISTRATOR'))
    {
      leaderboard = {}
      fs.writeFileSync(path.join(__dirname, 'leaderboard.json'), JSON.stringify(leaderboard, null, 2))
      msg.channel.send({embed: {
            "title": "Leaderboard resetted",
            "description": '',
            "color": 3447003
          }})
    }
  }
  catch (e)
  {
    console.error(e)
  }
})

client.on('messageReactionAdd', async (messageReaction, user) => {
  try
  {
    if (!user.bot && messageReaction.message.channel.id === discordData.successChannelID)
    {
      const member = await messageReaction.message.guild.members.fetch(user.id)
      if (messageReaction.message.embeds && messageReaction.message.embeds[0])
      {
        const urlData = messageReaction.message.embeds[0].footer.iconURL
        const messagOwner = urlData.match(/(?:(?:author\=)([0-9]+))/i)[1]
        const tweetId = urlData.match(/(?:(?:tweetId\=)([0-9]+))/i)[1]

        if (messagOwner == user.id || member.hasPermission('ADMINISTRATOR'))
        {
          T.post('statuses/destroy/:id', { id: tweetId }, function (err, data, response) {
            messageReaction.message.edit({embed: {
              "title": "Tweet was deleted!",
              "description": "Make sure to double-check images before posting",
              "color": 1876223,
              "footer": {
                "text": groupInfo.name + ' Success',
                "icon_url": groupInfo.imageUrl
              }
            }})
            editScore(messagOwner, -1)
            messageReaction.message.reactions.removeAll()
          })
        }
      }
    }
  }
  catch (e)
  {
    console.error(e)
  }
})

async function getLeaderboard ()
{
  return new Promise ( resolve => {
    try
    {
      fs.readFile(path.join(__dirname, 'leaderboard.json'), 'utf8', function (err, data) {
        if (err) throw err
        resolve(JSON.parse(data))
      })
    }
    catch (e)
    {
      console.error(e)
    }
  })
}

async function editScore (userId, n)
{
  try
  {
    if (leaderboard[userId])
    {
      leaderboard[userId] = leaderboard[userId] + n
    }
    else
    {
      leaderboard[userId] = n
    }
    fs.writeFileSync(path.join(__dirname, 'leaderboard.json'), JSON.stringify(leaderboard, null, 2))
  }
  catch (e)
  {
    console.error(e)
  }
}

client.login(discordData.token)
