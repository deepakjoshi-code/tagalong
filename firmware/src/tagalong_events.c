#include "tagalong_events.h"

#include <string.h>

/* ---------------------------------------------------------------- helpers */

/* Integer square root, so the engine needs no floating point or libm. */
static uint32_t isqrt32(uint32_t v)
{
    uint32_t rem = 0, root = 0;
    for (int i = 0; i < 16; i++) {
        root <<= 1;
        rem = (rem << 2) | (v >> 30);
        v <<= 2;
        if (root < rem) {
            rem -= root | 1u;
            root += 2u;
        }
    }
    return root >> 1;
}

uint16_t tag_accel_magnitude(const tag_accel_sample_t *s)
{
    int32_t x = s->x, y = s->y, z = s->z;
    uint32_t sq = (uint32_t)(x * x) + (uint32_t)(y * y) + (uint32_t)(z * z);
    uint32_t m = isqrt32(sq);
    return (uint16_t)(m > UINT16_MAX ? UINT16_MAX : m);
}

/*
 * Tilt from vertical, using a small lookup rather than acos(). Upright means the
 * gravity vector lies along +z; we compare |z| against the magnitude.
 */
int16_t tag_accel_tilt_degrees(const tag_accel_sample_t *s)
{
    uint16_t mag = tag_accel_magnitude(s);
    if (mag == 0u) return 0;
    int32_t az = s->z < 0 ? -s->z : s->z;
    uint32_t ratio = (uint32_t)((az * 100) / mag); /* cos(theta) x100 */
    /* cos table, 0..90 degrees in 5-degree steps, x100 */
    static const uint8_t cos5[19] = { 100, 99, 98, 96, 93, 90, 86, 81, 76, 70,
                                      64, 57, 50, 42, 34, 25, 17, 8, 0 };
    for (int i = 0; i < 19; i++) {
        if (ratio >= cos5[i]) return (int16_t)(i * 5);
    }
    return 90;
}

static void emit(tag_event_batch_t *out, tag_event_type_t type, uint8_t aux)
{
    if (out->count >= TAG_MAX_EVENTS_PER_BLOCK) return;
    out->items[out->count].type = type;
    out->items[out->count].aux = aux;
    out->count++;
}

static bool elapsed_at_least(uint32_t now, uint32_t since, uint32_t span)
{
    if (since == 0u) return true;
    return (uint32_t)(now - since) >= span;
}

/* ------------------------------------------------------------------- init */

void tag_events_set_time(tag_event_engine_t *e, uint16_t minute_of_day, uint32_t now_ms)
{
    if (!e || minute_of_day > 1439u) return;
    /* Time going backwards means a new day: reset the per-day allowances. */
    if (e->time_known && minute_of_day < e->minute_of_day) {
        e->brush_sessions_today = 0u;
        e->left_behind_today = false;
    }
    e->minute_of_day = minute_of_day;
    e->time_known = true;
    e->time_set_at_ms = now_ms;
}

/** Minute of day advanced by the elapsed milliseconds since the last sync. */
static uint16_t current_minute(const tag_event_engine_t *e, uint32_t now_ms)
{
    uint32_t elapsed_min = (now_ms - e->time_set_at_ms) / 60000u;
    return (uint16_t)((e->minute_of_day + elapsed_min) % 1440u);
}

void tag_events_init(tag_event_engine_t *e, tag_thing_t thing, uint32_t now_ms)
{
    memset(e, 0, sizeof(*e));
    e->thing = thing;
    e->motion = TAG_MOTION_STILL;
    e->state_since_ms = now_ms;
    e->last_motion_ms = now_ms;
    e->boot_ms = now_ms;
    e->last_lux = TAG_LUX_NONE;
    e->cap_low_pct = 100u;
}

/* ------------------------------------------------------------ block stats */

typedef struct {
    uint16_t mean_mag;
    uint32_t variance;
    uint16_t peak_mag;
    uint16_t min_mag;
    uint8_t crossings;    /* sign changes of (mag - mean), a proxy for oscillation */
    int16_t tilt_deg;     /* from the last sample */
} block_stats_t;

static void compute_stats(const tag_sensor_block_t *b, block_stats_t *st)
{
    memset(st, 0, sizeof(*st));
    if (b->n == 0u || b->samples == NULL) return;

    uint32_t sum = 0;
    uint16_t peak = 0, lo = UINT16_MAX;
    for (uint16_t i = 0; i < b->n; i++) {
        uint16_t m = tag_accel_magnitude(&b->samples[i]);
        sum += m;
        if (m > peak) peak = m;
        if (m < lo) lo = m;
    }
    uint16_t mean = (uint16_t)(sum / b->n);

    uint64_t var_acc = 0;
    uint8_t crossings = 0;
    int last_sign = 0;
    for (uint16_t i = 0; i < b->n; i++) {
        int32_t d = (int32_t)tag_accel_magnitude(&b->samples[i]) - (int32_t)mean;
        var_acc += (uint64_t)(d * d);
        int sign = d > 60 ? 1 : (d < -60 ? -1 : 0);
        if (sign != 0 && last_sign != 0 && sign != last_sign) crossings++;
        if (sign != 0) last_sign = sign;
    }

    st->mean_mag = mean;
    st->variance = (uint32_t)(var_acc / b->n);
    st->peak_mag = peak;
    st->min_mag = lo;
    st->crossings = crossings;
    st->tilt_deg = tag_accel_tilt_degrees(&b->samples[b->n - 1u]);
}

/* ------------------------------------------------------------ classifiers */

static void detect_drop(tag_event_engine_t *e, const tag_sensor_block_t *b,
                        const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->n == 0u) return;

    /* Stage 1: free-fall, every axis near zero for long enough. */
    if (st->min_mag < TAG_FREEFALL_MILLI_G) {
        if (!e->in_freefall) {
            e->in_freefall = true;
            e->freefall_started_ms = b->now_ms;
        }
        return; /* still falling; the impact cannot be in this block */
    }
    if (e->in_freefall) {
        e->in_freefall = false;
        uint32_t fall_ms = b->now_ms - e->freefall_started_ms;
        /* Too short is a fast lowering, not a fall. */
        e->freefall_ended_ms = fall_ms >= TAG_FREEFALL_MIN_MS ? b->now_ms : 0u;
    }

    /* Stage 2: an impact shortly after a real fall. Impact alone is just a firm putdown. */
    if (e->freefall_ended_ms == 0u) return;
    if ((uint32_t)(b->now_ms - e->freefall_ended_ms) > TAG_IMPACT_WINDOW_MS) {
        e->freefall_ended_ms = 0u;
        return;
    }
    if (st->peak_mag < TAG_IMPACT_MILLI_G) return;
    if (!elapsed_at_least(b->now_ms, e->last_drop_ms, 3000u)) return;

    uint32_t g_x10 = (uint32_t)st->peak_mag / 100u;
    emit(out, TAG_EVT_DROP, (uint8_t)(g_x10 > 255u ? 255u : g_x10));
    e->last_drop_ms = b->now_ms;
    e->freefall_ended_ms = 0u;
}

static void detect_motion(tag_event_engine_t *e, const tag_sensor_block_t *b,
                          const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->n == 0u) return;

    bool moving = st->variance > TAG_MOVING_VAR;
    bool still = st->variance < TAG_STILL_VAR;

    /*
     * "The room was busy" has to mean recently busy. Without decay the counter
     * only ever grows, so every backpack that has been picked up three times in
     * its life qualifies, and left-behind fires after any ordinary putdown.
     */
    if (e->recent_transitions > 0u &&
        (uint32_t)(b->now_ms - e->last_transition_ms) > TAG_TRANSITION_DECAY_MS) {
        e->recent_transitions = 0u;
    }

    /*
     * Vehicle rejection. Road vibration reads as movement by variance alone, so
     * the discriminator is regularity over time: a car oscillates steadily for
     * minutes, a child handling a bottle does not. Once transport is confirmed,
     * pickup/putdown/shake are suppressed until the tag is genuinely still again,
     * otherwise the tag chats for an entire journey.
     */
    bool oscillatory = st->crossings >= 6u && st->peak_mag < 2200;
    uint32_t block_ms = b->sample_rate_hz ? (uint32_t)((b->n * 1000u) / b->sample_rate_hz) : 320u;
    if (oscillatory) {
        uint32_t needed = block_ms ? (TAG_TRANSPORT_CONFIRM_MS / block_ms) : 32u;
        if (e->oscillatory_blocks < UINT16_MAX) e->oscillatory_blocks++;
        if (e->oscillatory_blocks >= needed) e->transport_suppressed = true;
    } else if (!moving) {
        e->oscillatory_blocks = 0u;
    }
    if (still) {
        e->transport_suppressed = false;
        e->oscillatory_blocks = 0u;
    }

    if (moving) e->last_motion_ms = b->now_ms;

    if (e->motion == TAG_MOTION_STILL) {
        if (moving) {
            if (e->state_since_ms == 0u) e->state_since_ms = b->now_ms;
            if ((uint32_t)(b->now_ms - e->state_since_ms) >= TAG_PICKUP_CONFIRM_MS) {
                e->motion = TAG_MOTION_HANDLED;
                e->state_since_ms = b->now_ms;
                if (e->recent_transitions < 255u) e->recent_transitions++;
                e->last_transition_ms = b->now_ms;
                /* A drop in the same breath already told the story; don't stack. */
                if (!e->transport_suppressed &&
                    elapsed_at_least(b->now_ms, e->last_drop_ms, 2000u)) {
                    emit(out, TAG_EVT_PICKUP, 0);
                }
            }
        } else {
            e->state_since_ms = b->now_ms;
        }
    } else { /* HANDLED */
        if (still) {
            if ((uint32_t)(b->now_ms - e->last_motion_ms) >= TAG_PUTDOWN_CONFIRM_MS) {
                e->motion = TAG_MOTION_STILL;
                e->state_since_ms = b->now_ms;
                if (e->recent_transitions < 255u) e->recent_transitions++;
                e->last_transition_ms = b->now_ms;
                if (!e->transport_suppressed) emit(out, TAG_EVT_PUTDOWN, 0);
            }
        } else {
            e->state_since_ms = b->now_ms;
        }
    }

    /*
     * Shake: a deliberate, energetic wiggle. Brushing is a strict superset of
     * this signature, so a toothbrush would shout "shake" all the way through a
     * two-minute clean and never reach the celebration. A toothbrush therefore
     * has no shake event at all; brushing is what shaking a toothbrush means.
     */
    if (e->thing != TAG_THING_TOOTHBRUSH && !e->brushing && !e->transport_suppressed &&
        st->crossings >= TAG_SHAKE_MIN_CROSSINGS && st->peak_mag > TAG_SHAKE_PEAK_MILLI_G &&
        elapsed_at_least(b->now_ms, e->last_shake_ms, TAG_SHAKE_DEBOUNCE_MS)) {
        emit(out, TAG_EVT_SHAKE, 0);
        e->last_shake_ms = b->now_ms;
    }

    /* Long still: curious, not nagging, and rate-limited hard. */
    if ((uint32_t)(b->now_ms - e->last_motion_ms) >= TAG_LONG_STILL_MS &&
        elapsed_at_least(b->now_ms, e->last_long_still_ms, 4u * 3600000u)) {
        emit(out, TAG_EVT_LONG_STILL, 0);
        e->last_long_still_ms = b->now_ms;
    }
}

static void detect_bottle(tag_event_engine_t *e, const tag_sensor_block_t *b,
                          const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->cap_raw == TAG_CAP_NONE) return;

    /* Learn the empty baseline and the full span from what we actually see. */
    if (e->cap_span == 0u) {
        if (e->cap_baseline == 0u || b->cap_raw < e->cap_baseline) e->cap_baseline = b->cap_raw;
        if (b->cap_raw > e->cap_baseline + 80u) e->cap_span = (uint16_t)(b->cap_raw - e->cap_baseline);
        return; /* no confident level yet */
    }
    if (b->cap_raw > (uint32_t)e->cap_baseline + e->cap_span) {
        e->cap_span = (uint16_t)(b->cap_raw - e->cap_baseline);
    }

    uint16_t level = 0u;
    if (b->cap_raw > e->cap_baseline) {
        uint32_t pct = ((uint32_t)(b->cap_raw - e->cap_baseline) * 100u) / e->cap_span;
        level = (uint16_t)(pct > 100u ? 100u : pct);
    }
    uint16_t previous = e->cap_level_pct;
    e->cap_level_pct = level;
    if (level < e->cap_low_pct) e->cap_low_pct = level;

    /* Fill: a clear rise, then stillness. Sloshing rises and keeps moving. */
    if (level > previous + TAG_FILL_RISE_PERCENT) {
        e->fill_armed = true;
        e->cap_rise_start_ms = b->now_ms;
        e->cap_rise_from_pct = previous;
    }
    if (e->fill_armed) {
        bool still = st->variance < TAG_STILL_VAR || b->n == 0u;
        bool settled = still && (uint32_t)(b->now_ms - e->cap_rise_start_ms) >= 2000u;
        bool expired = (uint32_t)(b->now_ms - e->cap_rise_start_ms) > 10000u;
        if (settled && level >= TAG_FILL_FULL_PERCENT && e->cap_low_pct < 40u &&
            elapsed_at_least(b->now_ms, e->last_fill_ms, 60000u)) {
            emit(out, TAG_EVT_FILLED, (uint8_t)level);
            e->last_fill_ms = b->now_ms;
            e->fill_armed = false;
            e->cap_low_pct = level;
        } else if (expired) {
            e->fill_armed = false;
        }
    }

    /* Empty: only once the bottle has actually been used since the last fill. */
    if (level <= TAG_EMPTY_PERCENT && previous > TAG_EMPTY_PERCENT && e->last_fill_ms != 0u) {
        emit(out, TAG_EVT_EMPTY, 0);
    }
}

static void detect_sip(tag_event_engine_t *e, const tag_sensor_block_t *b,
                       const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->n == 0u) return;

    if (!e->tilted) {
        if (st->tilt_deg >= TAG_SIP_TILT_DEG) {
            e->tilted = true;
            e->tilt_started_ms = b->now_ms;
            e->tilt_peak_deg = st->tilt_deg;
            e->tilt_start_level_pct = e->cap_level_pct;
        }
        return;
    }

    if (st->tilt_deg > e->tilt_peak_deg) e->tilt_peak_deg = st->tilt_deg;

    if (st->tilt_deg <= TAG_SIP_UPRIGHT_DEG) {
        uint32_t held = b->now_ms - e->tilt_started_ms;
        e->tilted = false;
        if (held < TAG_SIP_MIN_MS || held > TAG_SIP_MAX_MS) return;
        /* On a bottle with working cap sensing, require the level to actually drop. */
        if (e->cap_span != 0u && e->cap_level_pct + 3u > e->tilt_start_level_pct) return;
        uint8_t deg = (uint8_t)(e->tilt_peak_deg > 255 ? 255 : e->tilt_peak_deg);
        emit(out, TAG_EVT_SIP, deg);
    } else if ((uint32_t)(b->now_ms - e->tilt_started_ms) > TAG_SIP_MAX_MS * 3u) {
        e->tilted = false; /* stored on its side; not a sip */
    }
}

static void detect_toothbrush(tag_event_engine_t *e, const tag_sensor_block_t *b,
                              const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->n == 0u) return;

    /* Brushing is a narrowband oscillation with real energy behind it. */
    bool active = st->crossings >= 5u && st->peak_mag > 1150 && st->variance > 20000u;
    uint32_t block_ms = (uint32_t)((b->n * 1000u) / (b->sample_rate_hz ? b->sample_rate_hz : 200u));

    if (active) {
        if (!e->brushing) {
            bool new_session = e->brush_last_active_ms == 0u ||
                               (uint32_t)(b->now_ms - e->brush_last_active_ms) >
                                   TAG_BRUSH_SESSION_RESET_MS;
            if (new_session) {
                e->brush_session_start_ms = b->now_ms;
                e->brush_accum_ms = 0u;
                e->brush_announced_start = false;
                e->brush_announced_done = false;
            }
            e->brushing = true;
        }
        e->brush_accum_ms += block_ms;
        e->brush_last_active_ms = b->now_ms;

        /* Two announced sessions a day is a morning and an evening. Beyond that
         * the tag keeps counting but stops celebrating, so the brush cannot be
         * turned into a toy that pays out. */
        bool may_announce = e->brush_sessions_today < TAG_BRUSH_MAX_SESSIONS_PER_DAY;

        if (!e->brush_announced_start && e->brush_accum_ms >= 4000u) {
            if (may_announce) emit(out, TAG_EVT_BRUSH_START, 0);
            e->brush_announced_start = true;
        }
        if (!e->brush_announced_done && e->brush_accum_ms >= TAG_BRUSH_TARGET_MS) {
            if (may_announce) {
                uint32_t half = e->brush_accum_ms / 2000u;
                emit(out, TAG_EVT_BRUSH_DONE, (uint8_t)(half > 255u ? 255u : half));
                if (e->brush_sessions_today < 255u) e->brush_sessions_today++;
            }
            e->brush_announced_done = true;
        }
        return;
    }

    if (e->brushing) e->brushing = false;

    /* Session ends after a real pause. Under 15 s of brushing says nothing at all. */
    if (e->brush_last_active_ms != 0u &&
        (uint32_t)(b->now_ms - e->brush_last_active_ms) > 20000u) {
        if (!e->brush_announced_done && e->brush_accum_ms >= TAG_BRUSH_SHORT_MIN_MS &&
            e->brush_accum_ms < TAG_BRUSH_TARGET_MS &&
            e->brush_sessions_today < TAG_BRUSH_MAX_SESSIONS_PER_DAY) {
            uint32_t half = e->brush_accum_ms / 2000u;
            emit(out, TAG_EVT_BRUSH_SHORT, (uint8_t)(half > 255u ? 255u : half));
            if (e->brush_sessions_today < 255u) e->brush_sessions_today++;
        }
        e->brush_last_active_ms = 0u;
        e->brush_accum_ms = 0u;
        e->brush_announced_start = false;
        e->brush_announced_done = false;
    }
}

static void detect_lunchbox(tag_event_engine_t *e, const tag_sensor_block_t *b,
                            tag_event_batch_t *out)
{
    if (b->lux == TAG_LUX_NONE) return;

    uint16_t previous = e->last_lux;
    e->last_lux = b->lux;
    if (previous == TAG_LUX_NONE) {
        if (b->lux < TAG_LUX_DARK) e->dark_since_ms = b->now_ms;
        return;
    }

    if (b->lux < TAG_LUX_DARK) {
        if (previous >= TAG_LUX_DARK) e->dark_since_ms = b->now_ms;
    }

    /* Open: a step into the light after being shut for a while. */
    if (!e->lid_open && previous < TAG_LUX_DARK && b->lux > TAG_LUX_OPEN &&
        e->dark_since_ms != 0u && (uint32_t)(b->now_ms - e->dark_since_ms) >= 5u * 60000u &&
        elapsed_at_least(b->now_ms, e->last_lid_ms, 30000u)) {
        emit(out, TAG_EVT_OPENED, 0);
        e->lid_open = true;
        e->last_lid_ms = b->now_ms;
    } else if (e->lid_open && b->lux < TAG_LUX_DARK &&
               elapsed_at_least(b->now_ms, e->last_lid_ms, 3000u)) {
        emit(out, TAG_EVT_CLOSED, 0);
        e->lid_open = false;
        e->last_lid_ms = b->now_ms;
    }
}

static void detect_backpack(tag_event_engine_t *e, const tag_sensor_block_t *b,
                            const block_stats_t *st, tag_event_batch_t *out)
{
    if (b->n == 0u) return;

    /* Zip: a short, fine, fast burst — distinct from a shake's big swings. */
    if (st->crossings >= 6u && st->peak_mag < 800 && st->peak_mag > 250 &&
        st->variance > 4000u && st->variance < TAG_MOVING_VAR) {
        emit(out, TAG_EVT_ZIPPED, 0);
        return;
    }

    /*
     * Left behind is the most dangerous event in the product: get it wrong and
     * the tag becomes a nag that the parent switches off for good. Every guard
     * has to hold: the room was recently busy, it then went quiet for a long
     * time, the clock is known, it is a leaving-the-house hour, and it has not
     * already fired today.
     */
    if (!e->time_known) return;               /* never guess at the hour */
    if (e->left_behind_today) return;
    if (e->recent_transitions < 3u) return;
    if ((uint32_t)(b->now_ms - e->last_motion_ms) < TAG_LEFT_BEHIND_MS) return;
    if (!elapsed_at_least(b->now_ms, e->last_left_behind_ms, 3u * 3600000u)) return;

    uint16_t minute = current_minute(e, b->now_ms);
    bool leaving_hour =
        (minute >= TAG_LEFT_BEHIND_MORNING_START && minute < TAG_LEFT_BEHIND_MORNING_END) ||
        (minute >= TAG_LEFT_BEHIND_AFTERNOON_START && minute < TAG_LEFT_BEHIND_AFTERNOON_END);
    if (!leaving_hour) return;

    emit(out, TAG_EVT_LEFT_BEHIND, 0);
    e->last_left_behind_ms = b->now_ms;
    e->last_left_behind_day_min = minute;
    e->left_behind_today = true;
    e->recent_transitions = 0u;
}

/* ---------------------------------------------------------------- process */

void tag_events_process(tag_event_engine_t *e, const tag_sensor_block_t *block,
                        tag_event_batch_t *out)
{
    out->count = 0u;
    if (e == NULL || block == NULL) return;

    /* Baselines need a moment to settle; a tag must not shout as it boots. */
    if (!e->warm) {
        if ((uint32_t)(block->now_ms - e->boot_ms) < TAG_WARMUP_MS) {
            block_stats_t warm_stats;
            compute_stats(block, &warm_stats);
            if (block->cap_raw != TAG_CAP_NONE && e->cap_baseline == 0u) {
                e->cap_baseline = block->cap_raw;
            }
            if (block->lux != TAG_LUX_NONE) e->last_lux = block->lux;
            if (warm_stats.variance > TAG_MOVING_VAR) e->last_motion_ms = block->now_ms;
            return;
        }
        e->warm = true;
    }

    block_stats_t st;
    compute_stats(block, &st);

    /* Order matters: a drop must be classified before the pickup that follows it. */
    detect_drop(e, block, &st, out);
    detect_motion(e, block, &st, out);

    switch (e->thing) {
    case TAG_THING_BOTTLE:
        detect_bottle(e, block, &st, out);
        detect_sip(e, block, &st, out);
        break;
    case TAG_THING_TOOTHBRUSH:
        detect_toothbrush(e, block, &st, out);
        break;
    case TAG_THING_LUNCHBOX:
        detect_lunchbox(e, block, out);
        break;
    case TAG_THING_BACKPACK:
        detect_backpack(e, block, &st, out);
        break;
    default:
        break; /* generic things use the common events only */
    }
}
