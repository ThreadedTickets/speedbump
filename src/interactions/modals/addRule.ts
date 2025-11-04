import { MessageFlags } from "discord.js";
import { ruleCache } from "../..";
import { ModalHandler } from "../../types/Interactions";
import ConfigMenu from "../../utils/classes/ConfigMenu";
import Server from "../../utils/classes/Server";
import { parseDurationToMs } from "../../utils/formatters/duration";
import config from "../../config";

const button: ModalHandler = {
  customId: "addRule",
  async execute(client, data, interaction) {
    const [, channelId] = interaction.customId.split(":");
    const messages = Math.max(parseInt(interaction.fields.getTextInputValue("messages")), 0);
    const interval = Math.max(parseInt(interaction.fields.getTextInputValue("interval")), 1);
    const slowmode = Math.max(
      Math.round(parseDurationToMs(interaction.fields.getTextInputValue("slowmode")) / 1000),
      0
    );
    const notify = interaction.fields.getStringSelectValues("notify")[0] === "1";

    if (messages == null || interval == null || slowmode == null) {
      return interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `Something is wrong with your input`,
      });
    }

    interaction.deferUpdate();

    const server = new Server(interaction.guildId);
    if ((await server.loadRulesOnSingleChannel(channelId)).length >= config.maxRulesPerChannel)
      return interaction.reply({
        flags: [MessageFlags.Ephemeral],
        content: `Max rules for this channel reached`,
      });

    await server.addRule(channelId, {
      messages,
      interval,
      slowmode,
      notify,
    });
    ruleCache.delete(channelId);

    interaction.message.edit((await ConfigMenu.create(channelId)).message);
  },
};

export default button;
