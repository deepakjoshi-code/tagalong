/*
 * Event engine tests, driven by synthetic sensor traces.
 *
 * Every test here asserts a promise the product makes to a parent: the tag
 * reacts when something really happened, and stays quiet when it did not.
 * The negative tests matter more than the positive ones.
 */
#include "tagalong_events.h"
#include "test_support.h"

#include <stdlib.h>

#define RATE_HZ 100u
#define BLOCK_N 32u
#define BLOCK_MS (BLOCK_N * 1000u / RATE_HZ) /* 320 ms */

static tag_accel_sample_t buf[BLOCK_N];
static uint32_t clock_ms;

/* A deterministic pseudo-random wobble, so traces are repeatable. */
static uint32_t rng = 12345u;
static int16_t noise(int16_t amplitude)
{
    rng = rng * 1103515245u + 12345u;
    if (amplitude == 0) return 0;
    return (int16_t)((int32_t)((rng >> 16) % (uint32_t)(amplitude * 2 + 1)) - amplitude);
}

/** Fills a block with a steady 1 g plus `wobble` of noise, tilted `tilt_z` toward horizontal. */
static tag_sensor_block_t make_block(int16_t wobble, int16_t z, int16_t x)
{
    for (uint16_t i = 0; i < BLOCK_N; i++) {
        buf[i].x = (int16_t)(x + noise(wobble));
        buf[i].y = noise(wobble);
        buf[i].z = (int16_t)(z + noise(wobble));
    }
    clock_ms += BLOCK_MS;
    tag_sensor_block_t b = { clock_ms, buf, BLOCK_N, RATE_HZ, TAG_CAP_NONE, TAG_LUX_NONE };
    return b;
}

/** An oscillating block: alternating magnitude, like brushing or shaking. */
static tag_sensor_block_t make_oscillation(int16_t amplitude)
{
    for (uint16_t i = 0; i < BLOCK_N; i++) {
        int16_t swing = (i % 2 == 0) ? amplitude : (int16_t)(-amplitude);
        buf[i].x = swing;
        buf[i].y = (int16_t)(swing / 2);
        buf[i].z = (int16_t)(1000 + swing / 2);
    }
    clock_ms += BLOCK_MS;
    tag_sensor_block_t b = { clock_ms, buf, BLOCK_N, RATE_HZ, TAG_CAP_NONE, TAG_LUX_NONE };
    return b;
}

static bool batch_has(const tag_event_batch_t *b, tag_event_type_t t)
{
    for (uint8_t i = 0; i < b->count; i++) {
        if (b->items[i].type == t) return true;
    }
    return false;
}

/** Runs `blocks` steady blocks, returning how many times `t` fired. */
static int run_steady(tag_event_engine_t *e, int blocks, int16_t wobble, tag_event_type_t t)
{
    int seen = 0;
    tag_event_batch_t out;
    for (int i = 0; i < blocks; i++) {
        tag_sensor_block_t b = make_block(wobble, 1000, 0);
        tag_events_process(e, &b, &out);
        if (batch_has(&out, t)) seen++;
    }
    return seen;
}

/** Warms the engine past the settling window with still blocks. */
static void warm_up(tag_event_engine_t *e)
{
    tag_event_batch_t out;
    for (int i = 0; i < 80; i++) { /* 80 x 320 ms = 25.6 s > TAG_WARMUP_MS */
        tag_sensor_block_t b = make_block(5, 1000, 0);
        tag_events_process(e, &b, &out);
    }
}

static void reset(tag_event_engine_t *e, tag_thing_t thing)
{
    clock_ms = 1000u;
    rng = 12345u;
    tag_events_init(e, thing, clock_ms);
    warm_up(e);
}

/* ------------------------------------------------------------------ tests */

TEST(a_still_bottle_says_nothing)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;
    int any = 0;
    for (int i = 0; i < 60; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        tag_events_process(&e, &b, &out);
        any += out.count;
    }
    CHECK_EQ(any, 0);
}

TEST(the_tag_is_silent_while_it_settles_after_boot)
{
    clock_ms = 1000u;
    rng = 12345u;
    tag_event_engine_t e;
    tag_events_init(&e, TAG_THING_BOTTLE, clock_ms);

    tag_event_batch_t out;
    int any = 0;
    /* Violent handling during the warm-up window must produce nothing. */
    for (int i = 0; i < 30; i++) {
        tag_sensor_block_t b = make_oscillation(2200);
        tag_events_process(&e, &b, &out);
        any += out.count;
    }
    CHECK_EQ(any, 0);
}

TEST(free_fall_then_impact_is_a_drop)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    /* Falling: near weightless. */
    tag_sensor_block_t fall = make_block(10, 80, 0);
    tag_events_process(&e, &fall, &out);
    CHECK_EQ(batch_has(&out, TAG_EVT_DROP), false);

    /* Landing: a hard spike. */
    for (uint16_t i = 0; i < BLOCK_N; i++) {
        buf[i].x = 0;
        buf[i].y = 0;
        buf[i].z = (i == 4) ? 4200 : 1000;
    }
    clock_ms += BLOCK_MS;
    tag_sensor_block_t hit = { clock_ms, buf, BLOCK_N, RATE_HZ, TAG_CAP_NONE, TAG_LUX_NONE };
    tag_events_process(&e, &hit, &out);
    CHECK_EQ(batch_has(&out, TAG_EVT_DROP), true);
}

TEST(a_firm_putdown_without_a_fall_is_not_a_drop)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    /* A hard impact with no preceding weightlessness. */
    for (uint16_t i = 0; i < BLOCK_N; i++) {
        buf[i].x = 0;
        buf[i].y = 0;
        buf[i].z = (i == 10) ? 3800 : 1000;
    }
    clock_ms += BLOCK_MS;
    tag_sensor_block_t hit = { clock_ms, buf, BLOCK_N, RATE_HZ, TAG_CAP_NONE, TAG_LUX_NONE };
    tag_events_process(&e, &hit, &out);
    CHECK_EQ(batch_has(&out, TAG_EVT_DROP), false);
}

TEST(a_fast_lowering_is_not_a_drop)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    /* Brief dip toward weightless, but shorter than the free-fall minimum, then a gentle land. */
    for (uint16_t i = 0; i < BLOCK_N; i++) {
        buf[i].x = 0;
        buf[i].y = 0;
        buf[i].z = (i < 2) ? 200 : 1000;
    }
    clock_ms += BLOCK_MS;
    tag_sensor_block_t dip = { clock_ms, buf, BLOCK_N, RATE_HZ, TAG_CAP_NONE, TAG_LUX_NONE };
    tag_events_process(&e, &dip, &out);
    tag_sensor_block_t land = make_block(40, 1000, 0);
    tag_events_process(&e, &land, &out);
    CHECK_EQ(batch_has(&out, TAG_EVT_DROP), false);
}

TEST(handling_then_stillness_is_pickup_then_putdown)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    int pickups = 0;
    for (int i = 0; i < 6; i++) {
        tag_sensor_block_t b = make_block(900, 1000, 0); /* being carried */
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_PICKUP)) pickups++;
    }
    CHECK_EQ(pickups, 1);

    int putdowns = 0;
    for (int i = 0; i < 12; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0); /* set down, still */
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_PUTDOWN)) putdowns++;
    }
    CHECK_EQ(putdowns, 1);
}

TEST(a_car_journey_does_not_make_the_tag_chat)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    /*
     * Road vibration strong enough to read as movement by variance alone. Without
     * transport rejection this would produce a stream of pickups and shakes for
     * the whole journey.
     *
     * The tag is allowed to react as the car pulls away — that first second is
     * genuinely indistinguishable from being picked up. What matters is that it
     * then falls silent and stays silent, which is what the second half asserts.
     */
    int early = 0, settled = 0;
    for (int i = 0; i < 200; i++) {
        tag_sensor_block_t b = make_oscillation(800);
        tag_events_process(&e, &b, &out);
        for (uint8_t k = 0; k < out.count; k++) {
            if (out.items[k].type == TAG_EVT_PICKUP || out.items[k].type == TAG_EVT_PUTDOWN ||
                out.items[k].type == TAG_EVT_SHAKE) {
                if (i < 30) early++;
                else settled++;
            }
        }
    }
    CHECK(early <= 3);   /* a brief reaction as motion starts */
    CHECK_EQ(settled, 0); /* then nothing for the rest of the journey */
}

TEST(a_car_journey_is_only_suppressed_while_it_lasts)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    for (int i = 0; i < 200; i++) {
        tag_sensor_block_t b = make_oscillation(800);
        tag_events_process(&e, &b, &out);
    }
    /* Arriving: the bag is set down and everything goes quiet. */
    for (int i = 0; i < 20; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        tag_events_process(&e, &b, &out);
    }
    /* Now a real pickup must work again. */
    int pickups = 0;
    for (int i = 0; i < 8; i++) {
        tag_sensor_block_t b = make_block(900, 1000, 0);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_PICKUP)) pickups++;
    }
    CHECK_EQ(pickups, 1);
}

TEST(a_deliberate_shake_is_detected)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    int shakes = 0;
    for (int i = 0; i < 4; i++) {
        tag_sensor_block_t b = make_oscillation(1800);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_SHAKE)) shakes++;
    }
    CHECK(shakes >= 1);
}

TEST(filling_a_bottle_needs_a_rise_and_then_stillness)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    /* Teach it empty, then full, so the span is learned. */
    for (int i = 0; i < 6; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 100;
        tag_events_process(&e, &b, &out);
    }
    for (int i = 0; i < 4; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 700; /* establishes the span */
        tag_events_process(&e, &b, &out);
    }
    /* Drain it so a later fill is a real empty-to-full transition. */
    for (int i = 0; i < 6; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 120;
        tag_events_process(&e, &b, &out);
    }

    /* Now fill it: cap jumps, then the bottle is set down and stays still. */
    int filled = 0;
    tag_sensor_block_t rise = make_block(600, 1000, 0);
    rise.cap_raw = 680;
    tag_events_process(&e, &rise, &out);
    for (int i = 0; i < 14; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 690;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_FILLED)) filled++;
    }
    CHECK_EQ(filled, 1);
}

TEST(sloshing_a_full_bottle_is_not_a_refill)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BOTTLE);
    tag_event_batch_t out;

    for (int i = 0; i < 6; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 100;
        tag_events_process(&e, &b, &out);
    }
    for (int i = 0; i < 4; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.cap_raw = 700;
        tag_events_process(&e, &b, &out);
    }

    /* The reading swings around while the bottle is carried, never settling. */
    int filled = 0;
    for (int i = 0; i < 40; i++) {
        tag_sensor_block_t b = make_block(900, 1000, 0);
        b.cap_raw = (uint16_t)(i % 2 ? 690 : 480);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_FILLED)) filled++;
    }
    CHECK_EQ(filled, 0);
}

TEST(two_minutes_of_brushing_earns_a_celebration)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_TOOTHBRUSH);
    tag_event_batch_t out;

    int starts = 0, dones = 0, shorts = 0;
    /* 120 s of brushing at 320 ms per block = 375 blocks. */
    for (int i = 0; i < 400; i++) {
        tag_sensor_block_t b = make_oscillation(1600);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_BRUSH_START)) starts++;
        if (batch_has(&out, TAG_EVT_BRUSH_DONE)) dones++;
        if (batch_has(&out, TAG_EVT_BRUSH_SHORT)) shorts++;
    }
    CHECK_EQ(starts, 1);
    CHECK_EQ(dones, 1);
    CHECK_EQ(shorts, 0);
}

TEST(stopping_early_gets_encouragement_not_a_celebration)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_TOOTHBRUSH);
    tag_event_batch_t out;

    /* ~30 s of brushing. */
    for (int i = 0; i < 95; i++) {
        tag_sensor_block_t b = make_oscillation(1600);
        tag_events_process(&e, &b, &out);
    }
    /* Then the brush is put down. */
    int dones = 0, shorts = 0;
    for (int i = 0; i < 100; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_BRUSH_DONE)) dones++;
        if (batch_has(&out, TAG_EVT_BRUSH_SHORT)) shorts++;
    }
    CHECK_EQ(dones, 0);
    CHECK_EQ(shorts, 1);
}

TEST(a_brush_knocked_in_a_drawer_stays_silent)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_TOOTHBRUSH);
    tag_event_batch_t out;

    /* Under 15 s of movement: not a brushing session, so nothing is said. */
    for (int i = 0; i < 20; i++) {
        tag_sensor_block_t b = make_oscillation(1600);
        tag_events_process(&e, &b, &out);
    }
    int said = 0;
    for (int i = 0; i < 100; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_BRUSH_SHORT) || batch_has(&out, TAG_EVT_BRUSH_DONE)) said++;
    }
    CHECK_EQ(said, 0);
}

TEST(a_lunchbox_lid_opening_is_detected_once)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_LUNCHBOX);
    tag_event_batch_t out;

    /* Shut and dark for well over five minutes. */
    for (int i = 0; i < 1100; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 1;
        tag_events_process(&e, &b, &out);
    }
    int opened = 0;
    for (int i = 0; i < 10; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 300;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_OPENED)) opened++;
    }
    CHECK_EQ(opened, 1);

    int closed = 0;
    for (int i = 0; i < 20; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 1;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_CLOSED)) closed++;
    }
    CHECK_EQ(closed, 1);
}

TEST(a_lunchbox_reopened_soon_after_does_not_re_announce)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_LUNCHBOX);
    tag_event_batch_t out;

    /* Packed in the morning: dark for a long time. */
    for (int i = 0; i < 1100; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 1;
        tag_events_process(&e, &b, &out);
    }
    int opened = 0;
    for (int i = 0; i < 6; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 300;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_OPENED)) opened++;
    }
    CHECK_EQ(opened, 1);

    /* Properly shut: long enough for the close to register. */
    int closed = 0;
    for (int i = 0; i < 30; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 1;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_CLOSED)) closed++;
    }
    CHECK_EQ(closed, 1);

    /*
     * Reopened about a minute later — a child going back for the other half of
     * a sandwich. Lunch is not announced twice.
     */
    for (int i = 0; i < 170; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 1;
        tag_events_process(&e, &b, &out);
    }
    int reopened = 0;
    for (int i = 0; i < 10; i++) {
        tag_sensor_block_t b = make_block(5, 1000, 0);
        b.lux = 300;
        tag_events_process(&e, &b, &out);
        if (batch_has(&out, TAG_EVT_OPENED)) reopened++;
    }
    CHECK_EQ(reopened, 0);
}

TEST(a_backpack_alone_in_a_quiet_room_says_nothing)
{
    tag_event_engine_t e;
    reset(&e, TAG_THING_BACKPACK);

    /* Never handled, so the "busy room went quiet" precondition is not met. */
    int nags = run_steady(&e, 4200, 5, TAG_EVT_LEFT_BEHIND); /* > 20 min of stillness */
    CHECK_EQ(nags, 0);
}

int main(void)
{
    RUN(a_still_bottle_says_nothing);
    RUN(the_tag_is_silent_while_it_settles_after_boot);
    RUN(free_fall_then_impact_is_a_drop);
    RUN(a_firm_putdown_without_a_fall_is_not_a_drop);
    RUN(a_fast_lowering_is_not_a_drop);
    RUN(handling_then_stillness_is_pickup_then_putdown);
    RUN(a_car_journey_does_not_make_the_tag_chat);
    RUN(a_car_journey_is_only_suppressed_while_it_lasts);
    RUN(a_deliberate_shake_is_detected);
    RUN(filling_a_bottle_needs_a_rise_and_then_stillness);
    RUN(sloshing_a_full_bottle_is_not_a_refill);
    RUN(two_minutes_of_brushing_earns_a_celebration);
    RUN(stopping_early_gets_encouragement_not_a_celebration);
    RUN(a_brush_knocked_in_a_drawer_stays_silent);
    RUN(a_lunchbox_lid_opening_is_detected_once);
    RUN(a_lunchbox_reopened_soon_after_does_not_re_announce);
    RUN(a_backpack_alone_in_a_quiet_room_says_nothing);
    return test_report("events");
}
