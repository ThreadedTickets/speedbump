import { appCommands } from "../handlers/interactionCommandHandler";
import { Event } from "../types/Event";
import { AutocompleteInteraction, Interaction, Client, MessageFlags } from "discord.js";
import { buttonHandlers, modalHandlers, selectMenuHandlers } from "../handlers/interactionHandlers";
import { EventData } from "../handlers/eventHandler";
import logger from "../utils/logger";

const event: Event<"interactionCreate"> = {
  name: "interactionCreate",
  once: false,
  async execute(client: Client, data, interaction: Interaction) {
    if (interaction.guildId && data?.blacklist?.active) {
      // We know the user is blacklisted, im gonna just use en as locale as this is per-user not server
      if (!interaction.isAutocomplete()) {
        return;
      } else return;
    }

    if (
      interaction.isChatInputCommand() ||
      interaction.isUserContextMenuCommand() ||
      interaction.isMessageContextMenuCommand()
    ) {
      const command = appCommands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(client as Client, data as EventData, interaction as any);
      } catch (err: any) {
        logger.error("Commands", "Error", `Error executing /${interaction.commandName}: ${err}`);
      }
    }

    if (interaction.isButton()) {
      const customId = interaction.customId.split(":")[0];
      const handler = buttonHandlers.get(customId);
      if (handler) {
        try {
          if (handler.owner && interaction.message.interactionMetadata.user.id !== interaction.user.id)
            return interaction.reply({
              flags: [MessageFlags.Ephemeral],
              content: `This doesn't belong to you`,
            });
          await handler.execute(client, data as EventData, interaction);
        } catch (err: any) {
          logger.error("Buttons", "Error", `Error in button ${interaction.customId}: ${err}`);
        }
      }
    }

    if (interaction.isModalSubmit()) {
      const customId = interaction.customId.split(":")[0];
      const handler = modalHandlers.get(customId);
      if (handler) {
        try {
          await handler.execute(client, data as EventData, interaction);
        } catch (err) {
          logger.error("Modals", "Error", `Error in modal ${interaction.customId}: ${err}`);
        }
      }
    }

    if (interaction.isAnySelectMenu()) {
      const customId = interaction.customId.split(":")[0];
      const handler = selectMenuHandlers.get(customId);
      if (handler) {
        try {
          if (handler.owner && interaction.message.interactionMetadata.user.id !== interaction.user.id)
            return interaction.reply({
              flags: [MessageFlags.Ephemeral],
              content: `This doesn't belong to you`,
            });

          await handler.execute(client, data as EventData, interaction);
        } catch (err) {
          logger.error("Select Menus", "Error", `Error in select menu ${interaction.customId}: ${err}`);
        }
      }
    }

    if (interaction.isAutocomplete()) {
      const command = appCommands.get(interaction.commandName);
      if (command?.type === "slash" && command.autocomplete) {
        try {
          await command.autocomplete(client as Client, interaction as AutocompleteInteraction);
        } catch (err) {
          logger.error("Commands", "Error", `Error executing autocomplete ${interaction.commandName}: ${err}`);
        }
      }
    }
  },
};

export default event;
