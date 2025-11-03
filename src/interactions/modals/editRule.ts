import { MessageFlags } from "discord.js";
import { ruleCache } from "../..";
import { ModalHandler } from "../../types/Interactions";
import ConfigMenu from "../../utils/classes/ConfigMenu";
import Server from "../../utils/classes/Server";
import { parseDurationToMs } from "../../utils/formatters/duration";

const button: ModalHandler = {
  customId: "editRule",
  async execute(client, data, interaction) {
    const [, ruleId, channelId, page] = interaction.customId.split(":");
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
    await server.editRule(ruleId, {
      messages,
      interval,
      slowmode,
      notify,
    });
    ruleCache.delete(channelId);

    interaction.message.edit((await ConfigMenu.create(channelId, parseInt(page))).message);
  },
};

export default button;
