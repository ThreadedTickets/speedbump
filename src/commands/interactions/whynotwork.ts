import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { AppCommand } from "../../types/Command";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts(InteractionContextType.Guild),

  async execute(client, data, interaction) {
    interaction.reply({
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("# Speedbump Assistance"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "## Speedbump isn't updating slowmodes\n" +
                "> For Speedbump to update rules on a channel, you should have at least 2 rules configured. We recommend one of these to be a 'base' (something like 1 message in 10 seconds -> set slowmode to 0 (or low) seconds) and the other to be an activity threshhold to increase slowmode.\n\n" +
                "> This issue may also occur when Speedbump has updated the slowmode in the last minute, if you don't think this is the case, you may not have notifications enabled for a rule\n\n" +
                "## My config is gone!\n" +
                "> Speedbump will delete the config of servers when it is kicked. This happens automatically and so if you want to wipe your config I suppose you could kick and re-add Speedbump\n\n" +
                "## Still not working?\n" +
                "> You can either join the support server or use the </debug:1436690885155885097> command\n" +
                "You may also want to make sure Speedbump has the following permissions: `Manage Channels`, `Manage Threads`, `Send Messages`, `Embeded Links`, `Read Message History`"
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Still need help? Join the support server!")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.gg/9jFqS5H43Q")
            )
          ),
      ],
    });
  },
};

export default command;
