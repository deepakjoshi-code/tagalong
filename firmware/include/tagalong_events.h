/*
 * Event engine — turns raw sensor blocks into the events the app knows about.
 *
 * Thresholds come from docs/hardware/sensing-and-event-detection.md; the state
 * machines are specified in docs/firmware/event-engine-spec.md. Everything here
 * is pure C99 with no RTOS or clock dependency: the caller supplies a monotonic
 * millisecond timestamp with each block, so the whole engine runs against
 * recorded traces on a laptop.
 *
 * Design rule from the brief: a false positive is worse than a missed event. A
 * bottle that says "ouch" when nothing happened breaks the illusion; a bottle
 * that misses one drop in ten is forgivable. When a classifier is unsure it
 * emits nothing.
 */
#ifndef TAGALONG_EVENTS_H
#define TAGALONG_EVENTS_H

#include "tagalong_protocol.h"

/** Accelerometer sample in milli-g per axis (1000 = 1 g). */
typedef struct {
    int16_t x, y, z;
} tag_accel_sample_t;

/** Sentinel for a sensor that is absent or not sampled in this block. */
#define TAG_CAP_NONE UINT16_MAX
#define TAG_LUX_NONE UINT16_MAX

/** One accelerometer FIFO block plus whatever slow sensors were read with it. */
typedef struct {
    uint32_t now_ms;                   /* monotonic, at the END of the block */
    const tag_accel_sample_t *samples; /* may be NULL when n == 0 */
    uint16_t n;
    uint16_t sample_rate_hz;
    uint16_t cap_raw;                  /* 0..1023, or TAG_CAP_NONE */
    uint16_t lux;                      /* 0..65534, or TAG_LUX_NONE */
} tag_sensor_block_t;

#define TAG_MAX_EVENTS_PER_BLOCK 4u

typedef struct {
    tag_event_type_t type;
    uint8_t aux; /* per docs/protocol: impact g x10, tilt degrees, or seconds/2 */
} tag_detected_event_t;

typedef struct {
    tag_detected_event_t items[TAG_MAX_EVENTS_PER_BLOCK];
    uint8_t count;
} tag_event_batch_t;

/* ---- Tunables, exposed so tests and the calibration rig can read them ---- */
#define TAG_FREEFALL_MILLI_G 350      /* |a| below this counts as falling */
#define TAG_FREEFALL_MIN_MS 30u
#define TAG_IMPACT_MILLI_G 2500       /* peak that must follow a fall */
#define TAG_IMPACT_WINDOW_MS 600u
#define TAG_STILL_VAR 10000u          /* (milli-g)^2 of |a| — below this is still */
#define TAG_MOVING_VAR 40000u         /* above this is definitely being handled */
#define TAG_PICKUP_CONFIRM_MS 640u
#define TAG_PUTDOWN_CONFIRM_MS 1600u
#define TAG_SHAKE_PEAK_MILLI_G 1200
#define TAG_SHAKE_MIN_CROSSINGS 4u
#define TAG_LONG_STILL_MS (45u * 60u * 1000u)
#define TAG_SIP_TILT_DEG 45
#define TAG_SIP_UPRIGHT_DEG 25
#define TAG_SIP_MIN_MS 800u
#define TAG_SIP_MAX_MS 6000u
#define TAG_FILL_RISE_PERCENT 18u     /* cap rise, in percent of learned span */
#define TAG_FILL_FULL_PERCENT 60u
#define TAG_EMPTY_PERCENT 8u
#define TAG_BRUSH_TARGET_MS 120000u   /* the famous two minutes */
#define TAG_BRUSH_SHORT_MIN_MS 15000u
#define TAG_BRUSH_GAP_MS 15000u       /* pause allowed inside one session */
#define TAG_LUX_OPEN 50u
#define TAG_LUX_DARK 5u
#define TAG_LEFT_BEHIND_MS (20u * 60u * 1000u)
/*
 * A transition older than this no longer counts towards "the room was busy".
 * It must exceed TAG_LEFT_BEHIND_MS, because the whole signature is "busy, then
 * quiet for twenty minutes" — a decay shorter than the stillness requirement
 * would clear the counter before the event could ever fire.
 */
#define TAG_TRANSITION_DECAY_MS (TAG_LEFT_BEHIND_MS + 20u * 60u * 1000u)
/* Leaving something behind only matters around leaving the house or school. */
#define TAG_LEFT_BEHIND_MORNING_START (7u * 60u)
#define TAG_LEFT_BEHIND_MORNING_END (9u * 60u)
#define TAG_LEFT_BEHIND_AFTERNOON_START (14u * 60u)
#define TAG_LEFT_BEHIND_AFTERNOON_END (17u * 60u)
/* A pause longer than this ends a brushing session. */
#define TAG_BRUSH_SESSION_RESET_MS (5u * 60u * 1000u)
#define TAG_BRUSH_MAX_SESSIONS_PER_DAY 2u
/*
 * Regular oscillation for this long means a vehicle, not a child. Kept short
 * because every block before confirmation is a chance to say something wrong.
 */
#define TAG_TRANSPORT_CONFIRM_MS 3000u
/* The engine's own shake debounce, so one wiggle is one event, not thirty. */
#define TAG_SHAKE_DEBOUNCE_MS 2000u

typedef enum {
    TAG_MOTION_STILL = 0,
    TAG_MOTION_HANDLED,
} tag_motion_state_t;

typedef struct {
    tag_thing_t thing;

    /* Motion */
    tag_motion_state_t motion;
    uint32_t state_since_ms;
    uint32_t last_motion_ms;
    uint32_t last_long_still_ms;
    bool transport_suppressed;
    /* Consecutive blocks that look like regular vibration rather than handling. */
    uint16_t oscillatory_blocks;

    /* Drop */
    uint32_t freefall_started_ms;
    uint32_t freefall_ended_ms;
    bool in_freefall;
    uint32_t last_drop_ms;
    uint32_t last_shake_ms;

    /* Bottle */
    uint16_t cap_baseline;   /* learned empty reading */
    uint16_t cap_span;       /* learned empty..full range, 0 until learned */
    uint16_t cap_level_pct;  /* last computed level */
    uint16_t cap_low_pct;    /* lowest level seen since the last fill */
    uint32_t cap_rise_start_ms;
    uint16_t cap_rise_from_pct;
    bool fill_armed;         /* a rise was seen, waiting for stillness */
    uint32_t last_fill_ms;

    /* Sip */
    bool tilted;
    uint32_t tilt_started_ms;
    int16_t tilt_peak_deg;
    uint16_t tilt_start_level_pct;

    /* Toothbrush */
    bool brushing;
    uint32_t brush_session_start_ms;
    uint32_t brush_last_active_ms;
    uint32_t brush_accum_ms;
    bool brush_announced_start;
    bool brush_announced_done;
    /* At most two announced sessions a day, so a child cannot farm celebrations. */
    uint8_t brush_sessions_today;

    /* Lunchbox */
    uint16_t last_lux;
    uint32_t dark_since_ms;
    bool lid_open;
    uint32_t last_lid_ms;

    /* Backpack */
    uint8_t recent_transitions;
    uint32_t last_transition_ms;
    uint32_t last_left_behind_ms;
    uint16_t last_left_behind_day_min;
    bool left_behind_today;

    /* Time of day, supplied by the app (the tag has no clock). */
    uint16_t minute_of_day;
    bool time_known;
    uint32_t time_set_at_ms;

    /* Boot settling: no events for the first TAG_WARMUP_MS. */
    uint32_t boot_ms;
    bool warm;
} tag_event_engine_t;

#define TAG_WARMUP_MS 20000u

void tag_events_init(tag_event_engine_t *e, tag_thing_t thing, uint32_t now_ms);

/**
 * Tells the engine what time it is. The app sends this on every connection
 * (ControlOp 0x04). Until it is called, events that only make sense at certain
 * times of day stay suppressed rather than firing at the wrong moment.
 */
void tag_events_set_time(tag_event_engine_t *e, uint16_t minute_of_day, uint32_t now_ms);

/**
 * Feeds one sensor block and returns everything detected in it.
 * Never returns more than TAG_MAX_EVENTS_PER_BLOCK; extra detections are dropped
 * rather than queued, because stale reactions are worse than missing ones.
 */
void tag_events_process(tag_event_engine_t *e, const tag_sensor_block_t *block,
                        tag_event_batch_t *out);

/** Magnitude of a sample in milli-g. */
uint16_t tag_accel_magnitude(const tag_accel_sample_t *s);

/** Angle of the sample from vertical, in degrees (0 = upright). */
int16_t tag_accel_tilt_degrees(const tag_accel_sample_t *s);

#endif /* TAGALONG_EVENTS_H */
