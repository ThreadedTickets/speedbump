import { InteractionContextType, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { AppCommand } from "../../types/Command";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("config")
    .setDescription("Setup the bot")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts(InteractionContextType.Guild),

  async execute(client, data, interaction) {
    interaction.reply({
      ...(await ConfigMenu.create(interaction.channelId)).message,
      flags: [MessageFlags.IsComponentsV2],
    });
  },
};

export default command;
