
const axios = require('axios').default;
const cheerio = require('cheerio');
const ytdl = require("ytdl-core");
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



const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const queue = new Map();
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
  try {
    conitunousGetMessage(config.url)
  } catch (error) {
    console.log("ERROR", error)
  }
  
  
})
client.on('error', client => {
  client.channels.cache.get(textChannelId).send(':duck: Quack quack .....! tao sắp đi r, gọi th farmer giúp t');
})

client.on("message", message => {
  if (message.author.bot) return;
  if(!message.content.startsWith(prefix)) return


  const commandBody = message.content.slice(prefix.length);
  const args = commandBody.split(' ');
  const command = args.shift().toLowerCase();
  let reply = ''
  const serverQueue = queue.get(message.guild.id);

  switch (command) {
    case 'mission':
      reply = ':duck: Quack quack...! Tao là vit, con trai đầu lòng thằng Farmer'
      break;
    case 'play':
      execute(message, serverQueue);
      return;
    default:
      reply = ':duck: Dm gõ tào lao'
      break;
  }
  if(reply) {
    message.reply(reply)
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
async function execute(message, serverQueue) {
  const args = message.content.split(" ");

  const voiceChannel = message.member.voice.channel;
  console.log("voice channel", voiceChannel)
  if (!voiceChannel)
    return message.channel.send(
      ":duck: mày ở đâu mà đòi tao hát"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      ":duck: bye"
    );
  }

  const songInfo = await ytdl.getInfo("mơ");
  console.log("songinfo", songInfo)
  const song = {
        title: songInfo.videoDetails.title,
        url: songInfo.videoDetails.video_url,
   };

  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}
function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`:duck: :musical_note: **${song.title}**`);
}
client.login(process.env.bot_token || 'ODgxOTEyMjc3NzY5NTUyMDAz.YSzu0A.xQISDzpiCAqqTXlm3_1W1fxiSaI');




