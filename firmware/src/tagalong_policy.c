#include "tagalong_policy.h"

#include <string.h>

#define MS_PER_HOUR 3600000u

uint32_t tag_event_debounce_ms(tag_event_type_t type)
{
    switch (type) {
    case TAG_EVT_DROP:         return 3000u;
    case TAG_EVT_SHAKE:        return 2000u;
    case TAG_EVT_TAP:          return 1000u;
    case TAG_EVT_PICKUP:
    case TAG_EVT_PUTDOWN:      return 2000u;
    case TAG_EVT_SIP:          return 20000u;
    case TAG_EVT_FILLED:       return 60000u;
    case TAG_EVT_EMPTY:        return 2u * 3600000u;
    case TAG_EVT_OPENED:
    case TAG_EVT_CLOSED:       return 30000u;
    case TAG_EVT_PACKED:       return 12u * 3600000u;
    case TAG_EVT_ZIPPED:       return 10000u;
    case TAG_EVT_LEFT_BEHIND:  return 3u * 3600000u;
    case TAG_EVT_LONG_STILL:   return 4u * 3600000u;
    case TAG_EVT_GOOD_MORNING: return 12u * 3600000u;
    case TAG_EVT_LOW_BATTERY:  return 24u * 3600000u;
    case TAG_EVT_CHARGING:     return 60000u;
    case TAG_EVT_BRUSH_START:
    case TAG_EVT_BRUSH_DONE:
    case TAG_EVT_BRUSH_SHORT:  return 5u * 60000u;
    default:                   return 1000u;
    }
}

bool tag_event_is_nudge(tag_event_type_t type)
{
    /* Events that ask the child for something. Off unless the parent opts in. */
    return type == TAG_EVT_EMPTY || type == TAG_EVT_LEFT_BEHIND || type == TAG_EVT_LONG_STILL;
}

static uint32_t max_tokens_milli(const tag_config_t *cfg)
{
    uint8_t per_hour = cfg->max_per_hour;
    if (per_hour < 1u) per_hour = 1u;
    if (per_hour > TAG_MAX_PER_HOUR_CAP) per_hour = TAG_MAX_PER_HOUR_CAP;
    return (uint32_t)per_hour * 1000u;
}

void tag_policy_init(tag_policy_t *p, const tag_config_t *cfg, uint32_t now_ms, uint32_t seed)
{
    memset(p, 0, sizeof(*p));
    p->tokens_milli = max_tokens_milli(cfg);
    p->tokens_updated_ms = now_ms;
    p->rng_state = seed ? seed : 0x9E3779B9u;
}

/** Tokens refill continuously: a full bucket per hour. */
static uint32_t tokens_now(const tag_policy_t *p, const tag_config_t *cfg, uint32_t now_ms)
{
    uint32_t cap = max_tokens_milli(cfg);
    uint32_t elapsed = now_ms - p->tokens_updated_ms; /* wraps correctly on uint32 */
    uint64_t refill = ((uint64_t)elapsed * cap) / MS_PER_HOUR;
    uint64_t tokens = (uint64_t)p->tokens_milli + refill;
    return tokens > cap ? cap : (uint32_t)tokens;
}

tag_speak_decision_t tag_policy_check(const tag_policy_t *p, const tag_config_t *cfg,
                                      const tag_policy_ctx_t *ctx, tag_event_type_t type)
{
    if (!tag_event_is_known((uint8_t)type)) return TAG_DENY_UNKNOWN_EVENT;

    /* Below 5% the tag stays silent but stays connectable, so the app can still warn. */
    if (ctx->battery <= 5u && type != TAG_EVT_CHARGING) return TAG_DENY_BATTERY_CRITICAL;

    if (ctx->muted) return TAG_DENY_MUTED;

    if (tag_in_quiet_hours(cfg, ctx->minute_of_day)) return TAG_DENY_QUIET_HOURS;

    if (tag_event_is_nudge(type) && !(cfg->flags & TAG_FLAG_NUDGES)) return TAG_DENY_NUDGES_OFF;

    /* Never talk over ourselves. */
    if (p->last_utterance_ms != 0u && (ctx->now_ms - p->last_utterance_ms) < TAG_MIN_GAP_MS) {
        return TAG_DENY_MIN_GAP;
    }

    uint32_t last = p->last_event_ms[(uint8_t)type];
    if (last != 0u && (ctx->now_ms - last) < tag_event_debounce_ms(type)) return TAG_DENY_DEBOUNCE;

    if (tokens_now(p, cfg, ctx->now_ms) < 1000u) return TAG_DENY_RATE_LIMIT;

    return TAG_SPEAK_ALLOW;
}

void tag_policy_commit(tag_policy_t *p, const tag_config_t *cfg, const tag_policy_ctx_t *ctx,
                       tag_event_type_t type)
{
    uint32_t tokens = tokens_now(p, cfg, ctx->now_ms);
    p->tokens_milli = tokens >= 1000u ? tokens - 1000u : 0u;
    p->tokens_updated_ms = ctx->now_ms;
    p->last_event_ms[(uint8_t)type] = ctx->now_ms ? ctx->now_ms : 1u;
    p->last_utterance_ms = ctx->now_ms ? ctx->now_ms : 1u;
}

uint32_t tag_policy_rand(tag_policy_t *p)
{
    uint32_t x = p->rng_state;
    x ^= x << 13;
    x ^= x >> 17;
    x ^= x << 5;
    p->rng_state = x;
    return x;
}

uint16_t tag_policy_pick_clip(tag_policy_t *p, uint16_t count)
{
    if (count == 0u) return 0u;

    /* Build the pool of clips not played recently, exactly like the app does. */
    uint16_t pool[256];
    uint16_t pool_len = 0u;
    uint16_t limit = count < 256u ? count : 256u;
    for (uint16_t i = 0u; i < limit; i++) {
        bool recent = false;
        for (uint8_t r = 0u; r < p->recent_count; r++) {
            if (p->recent[r] == i) { recent = true; break; }
        }
        if (!recent) pool[pool_len++] = i;
    }
    /* Everything was recent: fall back to the whole set rather than repeating the last one. */
    if (pool_len == 0u) {
        for (uint16_t i = 0u; i < limit; i++) pool[pool_len++] = i;
    }

    uint16_t chosen = pool[tag_policy_rand(p) % pool_len];

    if (p->recent_count < TAG_RECENT_MEMORY) {
        p->recent[p->recent_count++] = chosen;
    } else {
        for (uint8_t i = 1u; i < TAG_RECENT_MEMORY; i++) p->recent[i - 1u] = p->recent[i];
        p->recent[TAG_RECENT_MEMORY - 1u] = chosen;
    }
    return chosen;
}
