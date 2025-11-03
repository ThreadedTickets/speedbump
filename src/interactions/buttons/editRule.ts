import { LabelBuilder, ModalBuilder, StringSelectMenuBuilder, TextInputBuilder, TextInputStyle } from "discord.js";
import { ButtonHandler } from "../../types/Interactions";

const button: ButtonHandler = {
  customId: "editRule",
  owner: true,
  async execute(client, data, interaction) {
    const [, ruleId, channelId, messages, slowmode, interval, notify, page] = interaction.customId.split(":");

    interaction.showModal(
      new ModalBuilder()
        .setCustomId(`editRule:${ruleId}:${channelId}:${page}`)
        .setTitle("Edit Rule")
        .setLabelComponents(
          new LabelBuilder()
            .setLabel("Message Count")
            .setDescription("How many messages would need to be sent?")
            .setTextInputComponent(
              new TextInputBuilder()
                .setCustomId("messages")
                .setMaxLength(3)
                .setRequired(true)
                .setValue(messages)
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
                .setValue(interval)
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
                .setValue(`${slowmode}s`)
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
                    default: notify == "true",
                  },
                  {
                    label: "No",
                    value: "0",
                    default: notify == "false",
                  },
                ])
            )
        )
    );
  },
};

export default button;
