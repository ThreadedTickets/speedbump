import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";
import Server from "../../utils/classes/Server";
import { ruleCache } from "../..";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const button: ButtonHandler = {
  customId: "removeRule",
  owner: true,
  async execute(client, data, interaction) {
    const server = new Server();
    const [, ruleId, channelId] = interaction.customId.split(":");

    await server.removeRule(ruleId);
    ruleCache.delete(channelId);
    interaction.deferUpdate();
    interaction.message.edit((await ConfigMenu.create(channelId)).message);
  },
};

export default button;
