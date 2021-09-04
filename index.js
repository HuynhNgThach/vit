
const axios = require('axios').default;
const cheerio = require('cheerio');
const from = ['Phương. Nguyễn Ngọc Quỳnh (2)', 'Thạch. Huỳnh Ngọc (3)','Phụng. Tô Hoàng']
const config = {
    authentication: 'skypetoken=eyJhbGciOiJSUzI1NiIsImtpZCI6IjEwMiIsIng1dCI6IjNNSnZRYzhrWVNLd1hqbEIySmx6NTRQVzNBYyIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MzA0NTk1NDgsImV4cCI6MTYzMDU0NTk0Mywic2t5cGVpZCI6Im9yZ2lkOmU5MTUyN2M5LTI0ODEtNDVlYy05NzJjLTljZWIyMjI2MzU3ZCIsInNjcCI6NzgwLCJjc2kiOiIxNjMwNDU5MjQzIiwidGlkIjoiN2MxMTJhNmUtMTBlMi00ZTA5LWFmYzQtMmUzN2JjNjBkODIxIiwicmduIjoiYXBhYyJ9.w-d5IdOkWbT-Z0MXOqnJh2HdqX6oDLpkFWKDtavWxxPIc5QgZNl5gzuU1N1uNH8wpjtV3Xq8phRvi0skFLUCpmZTFofZ6x0SU-5rTUZp8kSW30peP_Mqntvo2KdONnqRI0s7bM9ZqLcVkFVJN6BThOAf6quSDaD5_g7CyUrpR8Uv64RXUU5GZuwSCvYMF2yNdJgH9xHu1UsKw_1whIQQ9Iv5UtpEKUQILaOvvRN2tExRP76Vjg8d8H7LjG8Qi4AoWom30x6OpOT70s_wuBoFHqCBl06oejAjG4nd4WSs1n4o_NtDR102Z0QgELWld_72yleWer_kDNdpRYVDC6rf7A',
    url: `https://southeastasia-prod-2.notifications.teams.microsoft.com/users/8:orgid:e91527c9-2481-45ec-972c-9ceb2226357d/endpoints/88001bde-ee83-4214-aaab-6cbf312993ee/events/poll?cursor=${Math.round(Date.now()/1000)}&sca=0`
}

const options = {
    headers: {
        Authentication: config.authentication
    }
}

const configFile = require('./config.json')


const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
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
  conitunousGetMessage(config.url)
  
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
  switch (command) {
    case 'mission':
      reply = ':duck: Quack quack...! Tao là vit, con trai đầu lòng thằng Farmer'
      break;
    default:
      reply = ':duck: Dm gõ tào lao'
      break;
  }
  if(reply) {
    message.reply(reply)
  }
})

// 881913844363034695
// console.log(channel)
const oldMessage = []

// setInterval(() => {
//     console.log("fetch url ", config.url)
//     const response = axios.get(config.url,options)
//     let data = {}
//     response.then(resp => {
//         data = resp.data
//         const eventMessages = data.eventMessages
//         if(eventMessages) {
//           eventMessages.forEach(mess => {
//             if(mess.resource) {
//               if(!oldMessage.includes(mess.resource.clientmessageid)) {
//                 oldMessage.push(mess.resource.clientmessageid)
//                 if(mess.resource.content) {
                  
//                   client.channels.cache.get(textChannelId).send(mess.resource.content);
                  
                  
//                 }
//               }
              
//             }
//           })
//         }
//         config.url = data.next
//     }).catch(err => {
//         console.log('ERROR', err)
//     })
// },5000)

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
      if(mess.resource) {
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
client.login(configFile.BOT_TOKEN);




