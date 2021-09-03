import { VoiceOnDemandMapping } from "@yes-theory-fam/database/client";
import { GuildMember, Message, User, VoiceChannel } from "discord.js";
import Tools from "../../common/tools";
import prisma from "../../prisma";

export const maxLimit = 10;
export const defaultLimit = 5;

class VoiceOnDemandTools {
  static stringToWords(inputStr: string): Array<string> {
    return <string[]>inputStr.split(" ");
  }

  static async handleLimitCommand(
    message: Message,
    requestedLimit: any,
    createCommand?: boolean
  ): Promise<number> {
    if (!requestedLimit && createCommand) return defaultLimit;

    if (isNaN(Number(Math.floor(requestedLimit)))) {
      await Tools.handleUserError(message, "The limit has to be a number");
      return;
    }

    if (Number(requestedLimit) < 2) {
      await Tools.handleUserError(message, "The limit has to be at least 2");
      return;
    }

    return Math.min(requestedLimit, maxLimit);
  }

  static async transferOwnership(
    mapping: VoiceOnDemandMapping,
    claimingUser: User,
    channel: VoiceChannel
  ) {
    await prisma.voiceOnDemandMapping.update({
      where: { channelId: channel.id },
      data: { userId: claimingUser.id },
    });

    const { emoji } = mapping;
    const newChannelName = await VoiceOnDemandTools.getChannelName(
      channel.guild.member(claimingUser),
      emoji
    );

    await channel.setName(newChannelName);
  }

  static async getVoiceChannel(member: GuildMember): Promise<VoiceChannel> {
    const guild = member.guild;
    const mapping = await prisma.voiceOnDemandMapping.findUnique({
      where: { userId: member.id },
    });
    return guild.channels.resolve(mapping?.channelId) as VoiceChannel;
  }

  static async updateLimit(memberVoiceChannel: VoiceChannel, limit: number) {
    await memberVoiceChannel.edit({
      userLimit: limit,
    });
  }

  static async getChannelName(m: GuildMember, e: string) {
    return `• ${e} ${m.displayName}'s Room`;
  }
}

export default VoiceOnDemandTools;