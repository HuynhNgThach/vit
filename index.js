
const axios = require('axios').default;
const cheerio = require('cheerio');
const from = ['Phương. Nguyễn Ngọc Quỳnh (2)', 'Thạch. Huỳnh Ngọc (3)','Phụng. Tô Hoàng']
const config = {
    authentication: process.env.msteam_token,
    url: `https://southeastasia-prod-2.notifications.teams.microsoft.com/users/8:orgid:e91527c9-2481-45ec-972c-9ceb2226357d/endpoints/88001bde-ee83-4214-aaab-6cbf312993ee/events/poll?cursor=${Math.round(Date.now()/1000)}&sca=0`
}

const options = {
    headers: {
        Authentication: config.authentication
    }
}



const { Client, Intents, MessageEmbed  } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES]});
//music bot create
const { Player } = require("discord-music-player");
const player = new Player(client, {
    leaveOnEmpty: false, // This options are optional.
});
client.player = player;
//end music bot create
const prefix = "#";
var textChannelId = ''

client.on('ready', client => {
  console.log(`Logged in as ${client.user.tag}!`)
  client.channels.cache.forEach(channel => {
    if(!textChannelId && channel.type === 'GUILD_TEXT') {
      textChannelId = channel.id
    }
  })
  client.channels.cache.get(textChannelId).send(':duck: Vịt đã online!');

  //uncomment
  // try {
  //   conitunousGetMessage(config.url)
  // } catch (error) {
  //   console.log("ERROR", error)
  // }
  
  
})
client.on('error', client => {
  client.channels.cache.get(textChannelId).send(':duck: Quack quack .....! tao sắp đi r, gọi th farmer giúp t');
})

client.on("message",async (message) => {
  if (message.author.bot) return;
  if(!message.content.startsWith(prefix)) return


  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  let guildQueue = client.player.getQueue(message.guild.id);
  let reply = ''

  switch (command) {
    case 'mission':
      reply = ':duck: Quack quack...! Tao là vit, ngoài nhắc điểm danh tao còn ca hát được nha ae'
      break;
    case 'play':
      let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.play(args.join(' ')).catch(_ => {
            if(!guildQueue)
                queue.stop();
        });
      break
    case 'skip':
      reply = `:duck: ok skip`
      guildQueue.skip();
      break
    case 'nowplay': 
      const ProgressBar = guildQueue.createProgressBar();
      const exampleEmbed = new MessageEmbed()
      .setColor('#e26900')
      .setTitle(':duck: Now playing ')
      .setDescription(guildQueue.nowPlaying + ` | ${ProgressBar.prettier}`)
      .setFooter('vit@2021');
      client.channels.cache.get(textChannelId).send({ embeds: [exampleEmbed] })
      break
    case 'help': 
      reply = ':duck: | mission | play | skip | nowPlay'
      break
    default:
      reply = ':duck: Dm gõ tào gì lao vậy'
      break;
  }
  if(reply) {
    message.reply(reply)
  }
})


client.player.on('songAdd',  (queue, song) => {
  try {
    console.log(`Song ${song} was added to the queue.`)
    const exampleEmbed = new MessageEmbed()
      .setColor('#e26900')
      .setTitle(':duck: Added to farm ')
      .setDescription(song.name + ` | ( ${song.duration} )`)
      .setImage(song.thumbnail)
      .setFooter('vit@2021');
      client.channels.cache.get(textChannelId).send({ embeds: [exampleEmbed] })
    } catch (error) {
      console.log("ERROR | ",error)
    }
})


const oldMessage = []

async function conitunousGetMessage(link) {
  try {
    console.log("fetch url ",link)
    const response = await axios.get(link,options)
    let data = response.data
    const eventMessages = data.eventMessages
    // console.log(client.channels.cache)
    if(eventMessages) {
      console.log(eventMessages)
      eventMessages.forEach(mess => {
      if(mess.resource && mess.resourceType==='NewMessage') {
        if(!oldMessage.includes(mess.resource.clientmessageid)) {
          if(mess.resource.content && mess.resource.imdisplayname && from.includes(mess.resource.imdisplayname)) {
            // client.channels.cache.get(textChannelId).send(mess);
            const testParseHtml = cheerio.load(mess.resource.content)
            const url = testParseHtml('a').attr('href')
            if(url) {
              const cmd = `!dd  ${url}`
              sendMessage(textChannelId,cmd)
            }
            
            
          }
        }
                
      }
      })
    }
    conitunousGetMessage(data.next)
    // config.url = data.next
  } catch (error) {
    sendMessage(textChannelId, ':duck: :x: Tao chết rồi nhen!')
    sendMessage(textChannelId, `:duck: :x: ERROR ${error.message}`)
    // client.channels.cache.get(textChannelId).send('error');
  }
  
}
function sendMessage(channelId, mess) {
  client.channels.cache.get(channelId).send(mess);    
}
// music bot

client.login(process.env.bot_token || 'ODgxOTEyMjc3NzY5NTUyMDAz.YSzu0A.xQISDzpiCAqqTXlm3_1W1fxiSaI');




