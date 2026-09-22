/*
 * Utterance policy — the layer between "an event happened" and "make a sound".
 *
 * This is where a talking object becomes tolerable to live with: rate limiting,
 * quiet hours, mute, per-event debounce, a minimum gap so the tag never talks
 * over itself, and no-repeat phrase selection.
 *
 * Pure C99 with no time source of its own: callers pass a monotonic millisecond
 * clock, which makes every rule testable on the host.
 */
#ifndef TAGALONG_POLICY_H
#define TAGALONG_POLICY_H

#include "tagalong_protocol.h"

/** Minimum gap between two utterances. The tag never interrupts itself. */
#define TAG_MIN_GAP_MS 6000u

/** A pending event is held this long waiting for the gap, then dropped (still logged). */
#define TAG_PENDING_HOLD_MS 3000u

/** Utterances are never allowed above this, whatever the config says. */
#define TAG_MAX_PER_HOUR_CAP 30u

/** How many recently played clips to remember per cell, so lines don't repeat. */
#define TAG_RECENT_MEMORY 3u

typedef enum {
    TAG_SPEAK_ALLOW = 0,
    TAG_DENY_MUTED,
    TAG_DENY_QUIET_HOURS,
    TAG_DENY_RATE_LIMIT,
    TAG_DENY_DEBOUNCE,
    TAG_DENY_MIN_GAP,
    TAG_DENY_BATTERY_CRITICAL,
    TAG_DENY_NUDGES_OFF,
    TAG_DENY_UNKNOWN_EVENT
} tag_speak_decision_t;

typedef struct {
    /* Token bucket for the hourly rate limit, in milli-tokens for precision. */
    uint32_t tokens_milli;
    uint32_t tokens_updated_ms;
    /* When each event type last produced an utterance. 0 means never. */
    uint32_t last_event_ms[TAG_MAX_PER_HOUR_CAP > 0 ? 256 : 256];
    uint32_t last_utterance_ms;
    /* Recently played clip indices, newest last. */
    uint16_t recent[TAG_RECENT_MEMORY];
    uint8_t recent_count;
    /* Deterministic PRNG so tests are repeatable and the tag needs no entropy source. */
    uint32_t rng_state;
} tag_policy_t;

typedef struct {
    uint32_t now_ms;            /* monotonic since boot */
    uint16_t minute_of_day;     /* 0..1439, from the last app sync + RTC */
    bool muted;
    uint8_t battery;            /* 0..100 */
} tag_policy_ctx_t;

/** Per-event debounce in milliseconds; see docs/hardware/sensing-and-event-detection.md. */
uint32_t tag_event_debounce_ms(tag_event_type_t type);

/** True for events that are only allowed when the parent has enabled nudges. */
bool tag_event_is_nudge(tag_event_type_t type);

void tag_policy_init(tag_policy_t *p, const tag_config_t *cfg, uint32_t now_ms, uint32_t seed);

/**
 * Decides whether `type` may be spoken now. Pure: it does not mutate `p`.
 * Call tag_policy_commit() only when the clip actually starts playing.
 */
tag_speak_decision_t tag_policy_check(const tag_policy_t *p, const tag_config_t *cfg,
                                      const tag_policy_ctx_t *ctx, tag_event_type_t type);

/** Records that an utterance for `type` started at ctx->now_ms. */
void tag_policy_commit(tag_policy_t *p, const tag_config_t *cfg, const tag_policy_ctx_t *ctx,
                       tag_event_type_t type);

/**
 * Picks a clip index in [0, count) avoiding the last TAG_RECENT_MEMORY choices.
 * Mirrors pickPhrase() in app/src/content/pickPhrase.ts. Returns 0 if count == 0.
 */
uint16_t tag_policy_pick_clip(tag_policy_t *p, uint16_t count);

/** Exposed for tests: xorshift32. */
uint32_t tag_policy_rand(tag_policy_t *p);

#endif /* TAGALONG_POLICY_H */
