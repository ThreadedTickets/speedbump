import { SelectMenuHandler } from "../../types/Interactions";
import ConfigMenu from "../../utils/classes/ConfigMenu";

const button: SelectMenuHandler = {
  customId: "channelSelector",
  async execute(client, data, interaction) {
    interaction.message.edit((await ConfigMenu.create(interaction.values[0])).message);
    interaction.deferUpdate();
  },
};

export default button;
