import { LRUCache } from "lru-cache";

type Rule = {
  id: number;
  messages: number;
  slowmode: number;
  interval: number;
  notify: boolean;
};

export default class RuleCache {
  private cache: LRUCache<string, Rule[]>;

  constructor(ttlSeconds: number) {
    this.cache = new LRUCache({
      max: 1000,
      ttl: ttlSeconds * 1000,
      updateAgeOnGet: true,
      updateAgeOnHas: true,
    });
  }

  add(channelId: string, rule: Rule) {
    const existing = this.cache.get(channelId) || [];
    existing.push(rule);

    this.cache.set(channelId, existing);
  }

  set(channelId: string, rules: Rule[]) {
    this.cache.set(channelId, rules);
  }

  get(channelId: string): Rule[] | undefined {
    return this.cache.get(channelId);
  }

  has(channelId: string): boolean {
    return this.cache.has(channelId);
  }

  delete(channelId: string) {
    this.cache.delete(channelId);
  }

  size(): number {
    return this.cache.size;
  }
}
