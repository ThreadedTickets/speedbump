import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";
import Server from "../../utils/classes/Server";
import { ruleCache } from "../..";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const button: ButtonHandler = {
  customId: "delete",
  owner: true,
  async execute(client, data, interaction) {
    interaction.message.delete();
  },
};

export default button;
