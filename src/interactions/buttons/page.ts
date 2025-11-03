import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";
import Server from "../../utils/classes/Server";
import { ruleCache } from "../..";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const button: ButtonHandler = {
  customId: "page",
  owner: true,
  async execute(client, data, interaction) {
    const server = new Server();
    const [, page, channelId] = interaction.customId.split(":");

    interaction.deferUpdate();
    interaction.message.edit((await ConfigMenu.create(channelId, parseInt(page))).message);
  },
};

export default button;
