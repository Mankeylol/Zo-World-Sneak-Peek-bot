import {Client, Routes, SlashCommandBuilder, ChannelType} from "discord.js"
import {REST} from "@discordjs/rest"
import { config } from 'dotenv';
config();
import schedule from 'node-schedule';




const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.BOT_TOKEN;

console.log(TOKEN)
console.log(CLIENT_ID)

const client = new Client({intents: []});
const rest = new REST({version: "10"}).setToken(TOKEN);

client.on("ready",() => console.log("bot is aliveee"));

client.on("interactionCreate", async (interaction) => {
    if (interaction.commandName === 'schedule') {
        // handle all the logic for schedule command
        const message = interaction.options.getString('message');
        const time = interaction.options.getInteger('time');
        const timeUnit = interaction.options.getString('time_unit');
        const channel = interaction.options.getChannel('channel')
        console.log(interaction.options)

        let timeInMilliseconds = 0;
        if (timeUnit === 'seconds') {
          timeInMilliseconds = time * 1000;
        } else if (timeUnit === 'minutes') {
          timeInMilliseconds = time * 60000;
        } else if (timeUnit === 'hours') {
          timeInMilliseconds = time * 3600000;
        } else if (timeUnit === 'days') {
          timeInMilliseconds = time * 86400000;
        }

        const date = new Date(new Date().getTime() + timeInMilliseconds);
      interaction.reply({
        content: `Your message has been scheduled for ${date.toTimeString()}`,
      });
      console.log(date);
      schedule.scheduleJob(date, () => {
        channel.send({ content: message });
      });
    }
})

const commands = [
    new SlashCommandBuilder()
    .setName("schedule")
    .setDescription("schedules a message")
    .addStringOption((option)=> option.setName("message")
        .setDescription("the message to be scheduled")
        .setRequired(true))
    
    .addIntegerOption((option) =>
        option
          .setName('time')
          .setDescription('When to schedule the message in hours')
         
          .setRequired(true)
      ).addStringOption((option) =>
      option
          .setName('time_unit')
          .setDescription('The unit of time for scheduling')
          .setRequired(true)
          .setChoices(
            { name: 'Seconds', value:'seconds' },
            { name: 'Minute', value: 'minutes' },
            { name: 'Hour', value: 'hours' },
            { name: 'Day', value: 'days' },
          )
  ).addChannelOption((option) =>
      option
        .setName('channel')
        .setDescription('The channel the message should be sent to')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .toJSON(),
]

async function main(){
    try {
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID,GUILD_ID),{
            body: commands,
        });
        client.login(TOKEN);
    } catch (error) {
        console.log(error);
    }
}

main()