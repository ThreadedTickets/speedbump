import {
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  FileBuilder,
  FileComponent,
  InteractionContextType,
  MessageFlags,
  PermissionFlagsBits,
  SeparatorBuilder,
  SlashCommandBuilder,
  TextDisplayBuilder,
} from "discord.js";
import { AppCommand } from "../../types/Command";
import debugLogManager from "../../utils/classes/GuildDebugLogger";

const command: AppCommand = {
  type: "slash",
  data: new SlashCommandBuilder()
    .setName("debug")
    .setDescription("Launch a debug session")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .setContexts(InteractionContextType.Guild),

  async execute(client, data, interaction) {
    const active = debugLogManager.getActive(interaction.guildId);
    if (!active) {
      debugLogManager.register(interaction.guildId);

      return interaction.reply({
        flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
        components: [
          new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent("# Speedbump Assistance: Debugger"))
            .addSeparatorComponents(new SeparatorBuilder())
            .addTextDisplayComponents(
              new TextDisplayBuilder().setContent(
                "I have launched a debugger session for you. Run </debug:1436690885155885097> again in the next 30 minutes to get the output log and see what might be going wrong. If you don't understand the log, feel free to share it in the support server"
              )
            )
            .addActionRowComponents(
              new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                  .setLabel("Join the support server!")
                  .setStyle(ButtonStyle.Link)
                  .setURL("https://discord.gg/9jFqS5H43Q")
              )
            ),
        ],
      });
    }

    const file = new AttachmentBuilder(active).setName("debug.txt");

    interaction.reply({
      flags: [MessageFlags.IsComponentsV2, MessageFlags.Ephemeral],
      files: [file],
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(new TextDisplayBuilder().setContent("# Speedbump Assistance: Debugger"))
          .addSeparatorComponents(new SeparatorBuilder())
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
              "Here is the log file from your debug session, feel free to share it to the support server for help!"
            )
          )
          .addFileComponents(new FileBuilder().setURL(`attachment://${file.name}`))
          .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setLabel("Join the support server!")
                .setStyle(ButtonStyle.Link)
                .setURL("https://discord.gg/9jFqS5H43Q")
            )
          ),
      ],
    });

    debugLogManager.unregister(interaction.guildId);
  },
};

export default command;
