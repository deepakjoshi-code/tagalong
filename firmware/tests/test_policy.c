/*
 * Utterance policy tests. These encode the promises in the product brief:
 * calm by default, never nagging, never talking over itself, silent at night.
 */
#include "tagalong_policy.h"
#include "test_support.h"

static tag_config_t base_config(void)
{
    tag_config_t c = {
        .version = 1,
        .age_band = TAG_BAND_KID,
        .thing = TAG_THING_BOTTLE,
        .personality = TAG_PERSONALITY_SILLY,
        .volume = 70,
        .quiet_enabled = true,
        .quiet_start_min = 20 * 60,
        .quiet_end_min = 7 * 60,
        .language = TAG_LANG_EN,
        .flags = TAG_FLAG_EVENT_BUFFER | TAG_FLAG_LED,
        .max_per_hour = 12,
        .time_of_day_min = 12 * 60,
        .school_enabled = false,
        .school_start_min = 0,
        .school_end_min = 0,
        .school_days = 0,
    };
    return c;
}

static tag_policy_ctx_t ctx_at(uint32_t now_ms, uint16_t minute_of_day)
{
    tag_policy_ctx_t c = { now_ms, minute_of_day, TAG_DAY_UNKNOWN, false, 80 };
    return c;
}

TEST(a_normal_event_is_allowed)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);
    tag_policy_ctx_t ctx = ctx_at(10000, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_FILLED), TAG_SPEAK_ALLOW);
}

TEST(the_tag_never_talks_over_itself)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    tag_policy_ctx_t ctx = ctx_at(10000, 12 * 60);
    tag_policy_commit(&p, &cfg, &ctx, TAG_EVT_FILLED);

    /* A different event, 2 s later: too soon. */
    tag_policy_ctx_t soon = ctx_at(12000, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &soon, TAG_EVT_DROP), TAG_DENY_MIN_GAP);

    /* After the minimum gap it is fine. */
    tag_policy_ctx_t later = ctx_at(10000 + TAG_MIN_GAP_MS + 1, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &later, TAG_EVT_DROP), TAG_SPEAK_ALLOW);
}

TEST(each_event_has_its_own_debounce)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    tag_policy_ctx_t first = ctx_at(10000, 12 * 60);
    tag_policy_commit(&p, &cfg, &first, TAG_EVT_SIP);

    /* Sip debounces for 20 s; 10 s later it is still suppressed even though the gap passed. */
    tag_policy_ctx_t mid = ctx_at(20000, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &mid, TAG_EVT_SIP), TAG_DENY_DEBOUNCE);

    tag_policy_ctx_t after = ctx_at(10000 + 20001, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &after, TAG_EVT_SIP), TAG_SPEAK_ALLOW);
}

TEST(quiet_hours_silence_everything)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);
    tag_policy_ctx_t night = ctx_at(10000, 23 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &night, TAG_EVT_DROP), TAG_DENY_QUIET_HOURS);
    CHECK_EQ(tag_policy_check(&p, &cfg, &night, TAG_EVT_PICKUP), TAG_DENY_QUIET_HOURS);
}

TEST(school_hours_silence_the_tag_in_class)
{
    tag_config_t cfg = base_config();
    cfg.school_enabled = true;
    cfg.school_start_min = 8 * 60 + 30;
    cfg.school_end_min = 15 * 60 + 30;
    cfg.school_days = 0x1F; /* Monday to Friday */

    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    tag_policy_ctx_t wednesday_lunch = ctx_at(10000, 12 * 60);
    wednesday_lunch.day_of_week = 2;
    CHECK_EQ(tag_policy_check(&p, &cfg, &wednesday_lunch, TAG_EVT_FILLED), TAG_DENY_QUIET_HOURS);

    tag_policy_ctx_t after_school = ctx_at(10000, 16 * 60);
    after_school.day_of_week = 2;
    CHECK_EQ(tag_policy_check(&p, &cfg, &after_school, TAG_EVT_FILLED), TAG_SPEAK_ALLOW);

    tag_policy_ctx_t saturday = ctx_at(10000, 12 * 60);
    saturday.day_of_week = 5;
    CHECK_EQ(tag_policy_check(&p, &cfg, &saturday, TAG_EVT_FILLED), TAG_SPEAK_ALLOW);
}

TEST(mute_silences_everything)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);
    tag_policy_ctx_t ctx = ctx_at(10000, 12 * 60);
    ctx.muted = true;
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_FILLED), TAG_DENY_MUTED);
}

TEST(nudge_events_need_the_parent_to_opt_in)
{
    tag_config_t cfg = base_config(); /* nudges off */
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);
    tag_policy_ctx_t ctx = ctx_at(10000, 12 * 60);

    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_LEFT_BEHIND), TAG_DENY_NUDGES_OFF);
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_EMPTY), TAG_DENY_NUDGES_OFF);
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_LONG_STILL), TAG_DENY_NUDGES_OFF);
    /* A reaction to something the child did is never a nudge. */
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_DROP), TAG_SPEAK_ALLOW);

    cfg.flags |= TAG_FLAG_NUDGES;
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_LEFT_BEHIND), TAG_SPEAK_ALLOW);
}

TEST(the_rate_limit_holds_over_an_hour)
{
    tag_config_t cfg = base_config();
    cfg.max_per_hour = 12;
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    /* Spend the bucket with events spaced past the gap and the debounce. */
    uint32_t t = 10000;
    int spoken = 0;
    for (int i = 0; i < 40; i++) {
        tag_policy_ctx_t ctx = ctx_at(t, 12 * 60);
        /* alternate two events so per-event debounce is not what stops us */
        tag_event_type_t e = (i % 2 == 0) ? TAG_EVT_DROP : TAG_EVT_SHAKE;
        if (tag_policy_check(&p, &cfg, &ctx, e) == TAG_SPEAK_ALLOW) {
            tag_policy_commit(&p, &cfg, &ctx, e);
            spoken++;
        }
        t += 7000; /* just over the minimum gap */
    }
    /* 40 attempts over ~4.7 min: the bucket allows 12 plus a little refill. */
    CHECK(spoken >= 12);
    CHECK(spoken <= 14);
}

TEST(the_hard_cap_beats_a_silly_config)
{
    tag_config_t cfg = base_config();
    cfg.max_per_hour = 200; /* out of spec; the policy must clamp it */
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    const int attempts = 80;
    const uint32_t spacing_ms = 7000u;
    uint32_t t = 10000;
    int spoken = 0;
    for (int i = 0; i < attempts; i++) {
        tag_policy_ctx_t ctx = ctx_at(t, 12 * 60);
        tag_event_type_t e = (i % 2 == 0) ? TAG_EVT_DROP : TAG_EVT_SHAKE;
        if (tag_policy_check(&p, &cfg, &ctx, e) == TAG_SPEAK_ALLOW) {
            tag_policy_commit(&p, &cfg, &ctx, e);
            spoken++;
        }
        t += spacing_ms;
    }
    /*
     * The bucket starts full at the cap and refills continuously, so over a run of
     * this length the ceiling is cap + (elapsed / 1h) * cap, not cap alone.
     */
    uint32_t elapsed_ms = spacing_ms * (uint32_t)attempts;
    int ceiling = (int)TAG_MAX_PER_HOUR_CAP +
                  (int)((elapsed_ms * TAG_MAX_PER_HOUR_CAP) / 3600000u) + 1;
    CHECK(spoken <= ceiling);
    /* It must still be far below "say everything": the cap is doing real work. */
    CHECK(spoken < attempts / 2);
}

TEST(tokens_refill_over_time)
{
    tag_config_t cfg = base_config();
    cfg.max_per_hour = 2;
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);

    tag_policy_ctx_t a = ctx_at(10000, 12 * 60);
    tag_policy_commit(&p, &cfg, &a, TAG_EVT_DROP);
    tag_policy_ctx_t b = ctx_at(20000, 12 * 60);
    tag_policy_commit(&p, &cfg, &b, TAG_EVT_SHAKE);

    tag_policy_ctx_t c = ctx_at(30000, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &c, TAG_EVT_TAP), TAG_DENY_RATE_LIMIT);

    /* Half an hour later, one token is back. */
    tag_policy_ctx_t d = ctx_at(30000 + 1800000u, 12 * 60);
    CHECK_EQ(tag_policy_check(&p, &cfg, &d, TAG_EVT_TAP), TAG_SPEAK_ALLOW);
}

TEST(a_critically_flat_battery_stays_silent)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 1);
    tag_policy_ctx_t ctx = ctx_at(10000, 12 * 60);
    ctx.battery = 4;
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_FILLED), TAG_DENY_BATTERY_CRITICAL);
    /* Being put on the charger is still worth saying. */
    CHECK_EQ(tag_policy_check(&p, &cfg, &ctx, TAG_EVT_CHARGING), TAG_SPEAK_ALLOW);
}

TEST(clip_selection_avoids_recent_repeats)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 12345);

    uint16_t history[64];
    for (int i = 0; i < 64; i++) history[i] = tag_policy_pick_clip(&p, 5);

    /* With 5 clips and a memory of 3, no value may repeat within a window of 4. */
    for (int i = 3; i < 64; i++) {
        CHECK(history[i] != history[i - 1]);
        CHECK(history[i] != history[i - 2]);
        CHECK(history[i] != history[i - 3]);
    }
    for (int i = 0; i < 64; i++) CHECK(history[i] < 5);
}

TEST(clip_selection_survives_tiny_and_empty_sets)
{
    tag_config_t cfg = base_config();
    tag_policy_t p;
    tag_policy_init(&p, &cfg, 0, 7);

    CHECK_EQ(tag_policy_pick_clip(&p, 0), 0);
    CHECK_EQ(tag_policy_pick_clip(&p, 1), 0);
    /* Only one clip: it must keep working rather than deadlock on "everything is recent". */
    CHECK_EQ(tag_policy_pick_clip(&p, 1), 0);

    tag_policy_init(&p, &cfg, 0, 7);
    for (int i = 0; i < 20; i++) CHECK(tag_policy_pick_clip(&p, 4) < 4);
}

TEST(selection_is_deterministic_for_a_given_seed)
{
    tag_config_t cfg = base_config();
    tag_policy_t a, b;
    tag_policy_init(&a, &cfg, 0, 999);
    tag_policy_init(&b, &cfg, 0, 999);
    for (int i = 0; i < 32; i++) CHECK_EQ(tag_policy_pick_clip(&a, 6), tag_policy_pick_clip(&b, 6));
}

int main(void)
{
    RUN(a_normal_event_is_allowed);
    RUN(the_tag_never_talks_over_itself);
    RUN(each_event_has_its_own_debounce);
    RUN(quiet_hours_silence_everything);
    RUN(school_hours_silence_the_tag_in_class);
    RUN(mute_silences_everything);
    RUN(nudge_events_need_the_parent_to_opt_in);
    RUN(the_rate_limit_holds_over_an_hour);
    RUN(the_hard_cap_beats_a_silly_config);
    RUN(tokens_refill_over_time);
    RUN(a_critically_flat_battery_stays_silent);
    RUN(clip_selection_avoids_recent_repeats);
    RUN(clip_selection_survives_tiny_and_empty_sets);
    RUN(selection_is_deterministic_for_a_given_seed);
    return test_report("policy");
}
