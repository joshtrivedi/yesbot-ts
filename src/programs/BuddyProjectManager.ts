import { Message, TextChannel } from "discord.js";
import {
  buddyProjectMatch,
  checkEntry,
  removeEntry,
  checkEntries,
  sendQuestions,
} from "./BuddyProject";
import Tools from "../common/tools";

export default async function BuddyProjectManager(
  message: Message,
  action: string
) {
  switch (action) {
    case "match":
      const usersToMatch = message.mentions.users.array();
      if (usersToMatch.length === 2) {
        message.channel.send(
          `Force matching <@${usersToMatch[0]}> and <@${usersToMatch[1]}>`
        );
        message.channel.send(
          sendQuestions(usersToMatch[0], usersToMatch[1])
            ? `Sent messages.`
            : `Couldn't send messages.`
        );
        buddyProjectMatch(usersToMatch[0], usersToMatch[1], true).then(
          (result) => {
            message.channel.send(
              result ? `Successfully matched.` : `Error in setting match.`
            );
          }
        );
      }
      break;
    case "check":
      message.channel.send(await checkEntry(message.mentions.users.array()[0]));
      break;
    case "unmatch":
      const confirm = await message.reply(
        `Are you sure you would like to remove <@${
          message.mentions.users.array()[0]
        }>'s entry?`
      );
      Tools.addThumbs(confirm);
      const reaction = await Tools.getFirstReaction(confirm);
      if (reaction === "👍")
        message.channel.send(
          await removeEntry(message.mentions.users.array()[0])
        );
      break;
    case "clean":
      message.channel.send(await checkEntries());
      break;

    case "ghost":
      message.channel
        .send(
          `Do you think you've been ghosted?\nHave you gotten no reply from your Buddy? Have you tried contacting them multiple times? Have you been Buddies for longer than a week? If your answer to all those questions is yes, react to this message with :ghost: and I'll do my best to help you out! :yesbot_yf:\nWhile I get back to you, try contacting your buddy again. Who knows, maybe you'll get an answer :zany_face:`
        )
        .then((sentMsg) => sentMsg.react("👻"));
      break;
    case "retry":
      const bpChannel = <TextChannel>(
        //this will be buddy-project instead of buddy-project-launch when we have a message we like
        message.guild.channels.cache.find(
          (c) => c.name === "buddy-project-tools"
        )
      );
      bpChannel
        .send(
          //text to change
          "Hey guys, we're relaunching the buddy project! The relaunch is scheduled to happen on Monday. If you would like to receive a new match, react below."
        )
        .then((sentMsg) => sentMsg.react("🤓"));

    default:
      break;
  }
}
