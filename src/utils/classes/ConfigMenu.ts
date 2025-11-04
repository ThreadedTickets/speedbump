import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
  ChannelType,
  ContainerBuilder,
  InteractionEditReplyOptions,
  SectionBuilder,
  SeparatorBuilder,
  TextDisplayBuilder,
} from "discord.js";
import Server from "./Server";
import config from "../../config";

type Rule = {
  id: number;
  messages: number;
  slowmode: number;
  interval: number;
  notify: boolean;
};

export default class ConfigMenu {
  public selectedChannelId: string;
  public message: InteractionEditReplyOptions;
  private selectedRule?: Rule;
  private rules: Rule[];
  private page: number;

  private constructor(selectedChannelId: string, rules: Rule[], page: number = 0) {
    this.selectedChannelId = selectedChannelId;
    this.rules = rules;
    this.page = page;
  }

  static async create(selectedChannelId: string, page: number = 0): Promise<ConfigMenu> {
    const server = new Server();
    const rules = await server.loadRulesOnSingleChannel(selectedChannelId);
    const menu = new ConfigMenu(selectedChannelId, rules, Math.min(Math.max(0, page), rules.length - 1));
    await menu.buildMessage();
    return menu;
  }

  private async buildMessage() {
    this.selectedRule = this.rules[this.page];

    this.message = {
      components: [
        new ContainerBuilder()
          .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(`# Slowmode Rules: <#${this.selectedChannelId}>`)
          )
          .addActionRowComponents(
            new ActionRowBuilder<ChannelSelectMenuBuilder>().addComponents(
              new ChannelSelectMenuBuilder()
                .setChannelTypes(ChannelType.GuildText)
                .setMaxValues(1)
                .setMinValues(1)
                .setDefaultChannels(this.selectedChannelId)
                .setRequired(true)
                .setPlaceholder("Select a channel to manage")
                .setCustomId(`channelSelector`)
            )
          )
          .addSeparatorComponents(new SeparatorBuilder())
          .addSectionComponents(
            this.selectedRule
              ? new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `If \`${this.selectedRule.messages}\` messages have been sent in the last \`${this.selectedRule.interval} seconds\`,\nset the slowmode to \`${this.selectedRule.slowmode} seconds\``
                    ),
                    new TextDisplayBuilder().setContent(
                      `> :speech_balloon: ${this.selectedRule.messages} Messages\n> :clock2: ${
                        this.selectedRule.interval
                      } Seconds\n> :zzz: ${this.selectedRule.slowmode} Seconds\n> :bell: ${
                        this.selectedRule.notify ? "Yes" : "No"
                      }` +
                        (this.rules.length < 2
                          ? "\n**At least 2 rules are needed for Speedbump to change the slowmode**"
                          : "")
                    )
                  )
                  .setButtonAccessory(
                    new ButtonBuilder()
                      .setCustomId(
                        `editRule:${this.selectedRule?.id ?? "none"}:${this.selectedChannelId}:${
                          this.selectedRule.messages
                        }:${this.selectedRule.slowmode}:${this.selectedRule.interval}:${this.selectedRule.notify}:${
                          this.page
                        }`
                      )
                      .setLabel("Edit")
                      .setStyle(ButtonStyle.Secondary)
                  )
              : new SectionBuilder()
                  .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                      `There are no rules on this channel.\n` +
                        `Create a base rule (your default slowmode) then create a second one that will make Speedbump to increase the slowmode on high activity\n\n` +
                        `-# You need at least 2 rules for Speedbump to work on this channel`
                    )
                  )
                  .setButtonAccessory(
                    new ButtonBuilder()
                      .setCustomId(`addRule:${this.selectedChannelId}:BASE`)
                      .setStyle(ButtonStyle.Success)
                      .setLabel("Create a base rule")
                      .setDisabled(this.rules.length >= config.maxRulesPerChannel)
                  )
          )
          .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(`addRule:${this.selectedChannelId}`)
                .setStyle(ButtonStyle.Primary)
                .setLabel("New rule"),
              new ButtonBuilder()
                .setCustomId(`removeRule:${this.selectedRule?.id ?? "none"}:${this.selectedChannelId}`)
                .setDisabled(this.rules.length == 0)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Remove rule"),
              new ButtonBuilder()
                .setCustomId(`clearRules:${this.selectedChannelId}`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel("Clear channel rules")
                .setDisabled(this.rules.length == 0)
            )
          )
          .addActionRowComponents(
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder()
                .setCustomId(`page:${Math.max(this.page - 1, 0)}:${this.selectedChannelId}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.page == 0 || this.rules.length == 0)
                .setLabel("<<"),
              new ButtonBuilder()
                .setCustomId(`balls`)
                .setStyle(ButtonStyle.Secondary)
                .setLabel(`Rule ${this.page + 1}/${this.rules.length}`)
                .setDisabled(true),
              new ButtonBuilder().setCustomId("delete").setStyle(ButtonStyle.Secondary).setLabel("Exit"),
              new ButtonBuilder()
                .setCustomId(`page:${Math.min(this.page + 1, this.rules.length - 1)}:${this.selectedChannelId}:`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.page == this.rules.length - 1)
                .setLabel(">>")
            )
          ),
      ],
    };
  }
}
