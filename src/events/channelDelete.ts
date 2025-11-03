import { Event } from "../types/Event";
import pool from "../utils/database/db";

const event: Event<"channelDelete"> = {
  name: "channelDelete",
  async execute(client, data, channel) {
    await pool.query("DELETE FROM channel WHERE id = $1", [channel.id]);
  },
};

export default event;
