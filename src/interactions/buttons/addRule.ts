import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";

const button: ButtonHandler = {
  customId: "addRule",
  owner: true,
  async execute(client, data, interaction) {
    interaction.showModal(
      new ModalBuilder()
        .setCustomId(`addRule:${interaction.customId.split(":")[1]}`)
        .setTitle("New Rule")
        .setLabelComponents(
          new LabelBuilder()
            .setLabel("Message Count")
            .setDescription("How many messages would need to be sent?")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("messages")
                .setMaxLength(3)
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
            ),

          new LabelBuilder()
            .setLabel("Interval")
            .setDescription("That amount of messages in how many seconds?")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("interval")
                .setMaxLength(3)
                .setRequired(true)
                .setStyle(TextInputStyle.Short)
            ),

          new LabelBuilder()
            .setLabel("Slowmode")
            .setDescription("What should the slowmode be set to if this rule is triggered?")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("slowmode")
                .setMaxLength(12)
                .setRequired(true)
                .setPlaceholder("Eg: 3h 2m 43s")
                .setStyle(TextInputStyle.Short)
            ),

          new LabelBuilder()
            .setLabel("Notify")
            .setDescription("Should Speedbump send a message when the slowmode is changed?")
            .setStringSelectMenuComponent(
              new StringSelectMenuBuilder()
                .setCustomId("notify")
                .setMaxValues(1)
                .setRequired(true)
                .setOptions([
                  {
                    label: "Yes",
                    value: "1",
                  },
                  {
                    label: "No",
                    value: "0",
                  },
                ])
            )
        )
    );
  },
};

export default button;
