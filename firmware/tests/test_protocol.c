/*
 * Wire-protocol tests, including the byte vectors that the app's TypeScript
 * codec must produce identically. If these change, app/src/transport/codec.test.ts
 * has to change with them — that is the point.
 */
#include "tagalong_protocol.h"
#include "test_support.h"

static tag_config_t sample_config(void)
{
    tag_config_t c = {
        .version = 1,
        .age_band = TAG_BAND_KID,
        .thing = TAG_THING_BOTTLE,
        .personality = TAG_PERSONALITY_BRAVE,
        .volume = 70,
        .quiet_enabled = true,
        .quiet_start_min = 20 * 60,
        .quiet_end_min = 7 * 60,
        .language = TAG_LANG_EN,
        .flags = TAG_FLAG_EVENT_BUFFER | TAG_FLAG_LED,
        .max_per_hour = 12,
        .time_of_day_min = 9 * 60 + 5,
        .school_enabled = false,
        .school_start_min = 0,
        .school_end_min = 0,
        .school_days = 0,
    };
    return c;
}

TEST(config_encodes_the_documented_bytes)
{
    /* This vector is duplicated in app/src/transport/codec.test.ts. */
    const uint8_t expected[TAGALONG_CONFIG_LEN] = {
        1,    /* version */
        1,    /* kid */
        0,    /* bottle */
        2,    /* brave */
        70,   /* volume */
        120,  /* 20:00 / 10 */
        42,   /* 07:00 / 10 */
        0,    /* en */
        0x0A, /* eventBuffer | led */
        12,   /* maxPerHour */
        0x21, 0x02, /* 545 little-endian */
        255,  /* schoolStart: disabled */
        255,  /* schoolEnd: disabled */
        0,    /* schoolDays: every day */
        0     /* checksum, filled below */
    };
    uint8_t out[TAGALONG_CONFIG_LEN];
    tag_config_t cfg = sample_config();
    CHECK_EQ(tag_config_encode(&cfg, out, sizeof(out)), TAG_OK);

    uint8_t want[TAGALONG_CONFIG_LEN];
    memcpy(want, expected, sizeof(want));
    want[15] = tag_xor_checksum(want, 15);
    CHECK_BYTES(out, want, TAGALONG_CONFIG_LEN);
}

TEST(config_round_trips)
{
    uint8_t buf[TAGALONG_CONFIG_LEN];
    tag_config_t in = sample_config();
    tag_config_t out;
    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.age_band, in.age_band);
    CHECK_EQ(out.thing, in.thing);
    CHECK_EQ(out.personality, in.personality);
    CHECK_EQ(out.volume, in.volume);
    CHECK_EQ(out.quiet_enabled, in.quiet_enabled);
    CHECK_EQ(out.quiet_start_min, in.quiet_start_min);
    CHECK_EQ(out.quiet_end_min, in.quiet_end_min);
    CHECK_EQ(out.max_per_hour, in.max_per_hour);
    CHECK_EQ(out.time_of_day_min, in.time_of_day_min);
}

TEST(every_ten_minute_quiet_value_round_trips)
{
    /* The app snaps to a 10-minute grid precisely so this holds. */
    for (uint16_t m = 0; m <= 1430; m += 10) {
        tag_config_t in = sample_config();
        in.quiet_start_min = m;
        in.quiet_end_min = (uint16_t)(1430 - m);
        uint8_t buf[TAGALONG_CONFIG_LEN];
        tag_config_t out;
        CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
        CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_OK);
        CHECK_EQ(out.quiet_start_min, in.quiet_start_min);
        CHECK_EQ(out.quiet_end_min, in.quiet_end_min);
    }
}

TEST(disabled_quiet_hours_use_the_sentinel)
{
    tag_config_t in = sample_config();
    in.quiet_enabled = false;
    uint8_t buf[TAGALONG_CONFIG_LEN];
    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(buf[5], TAGALONG_QUIET_DISABLED);
    CHECK_EQ(buf[6], TAGALONG_QUIET_DISABLED);
    tag_config_t out;
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.quiet_enabled, false);
}

TEST(config_rejects_a_corrupt_frame)
{
    tag_config_t in = sample_config();
    uint8_t buf[TAGALONG_CONFIG_LEN];
    tag_config_t out;
    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    buf[4] ^= 0xFF; /* flip the volume without fixing the checksum */
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_ERR_CHECKSUM);

    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    buf[0] = 2;
    buf[15] = tag_xor_checksum(buf, 15);
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_ERR_VERSION);

    CHECK_EQ(tag_config_decode(buf, 4, &out), TAG_ERR_LENGTH);
}

TEST(other_thing_uses_code_255)
{
    tag_config_t in = sample_config();
    in.thing = TAG_THING_OTHER;
    uint8_t buf[TAGALONG_CONFIG_LEN];
    tag_config_t out;
    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(buf[2], 255);
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.thing, TAG_THING_OTHER);
}

TEST(event_frame_round_trips)
{
    tag_event_frame_t in = { 1, TAG_EVT_BRUSH_DONE, 123456u, 64, 60 };
    uint8_t buf[TAGALONG_EVENT_LEN];
    tag_event_frame_t out;
    CHECK_EQ(tag_event_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(buf[1], 65);
    CHECK_EQ(tag_event_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.type, TAG_EVT_BRUSH_DONE);
    CHECK_EQ(out.uptime_sec, 123456u);
    CHECK_EQ(out.battery, 64);
    CHECK_EQ(out.aux, 60);
}

TEST(event_frame_rejects_unknown_codes)
{
    uint8_t buf[TAGALONG_EVENT_LEN] = { 1, 200, 0, 0, 0, 0, 50, 0 };
    tag_event_frame_t out;
    CHECK_EQ(tag_event_decode(buf, sizeof(buf), &out), TAG_ERR_VALUE);
}

TEST(info_frame_round_trips)
{
    tag_info_t in = { 1, 2, 3, 1, 1, 7, 88, 4000, TAG_INFO_CHARGING | TAG_INFO_NAME_CLIP };
    uint8_t buf[TAGALONG_INFO_LEN];
    tag_info_t out;
    CHECK_EQ(tag_info_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(tag_info_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.fw_major, 1);
    CHECK_EQ(out.pack_version, 7);
    CHECK_EQ(out.battery, 88);
    CHECK_EQ(out.uptime_min, 4000);
    CHECK_EQ(out.flags, TAG_INFO_CHARGING | TAG_INFO_NAME_CLIP);
}

TEST(control_ops_match_the_protocol_table)
{
    uint8_t buf[4];
    tag_control_t c;

    c = (tag_control_t){ .op = TAG_CTRL_IDENTIFY };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 1);
    CHECK_EQ(buf[0], 0x01);

    c = (tag_control_t){ .op = TAG_CTRL_PREVIEW, .preview = TAG_EVT_FILLED };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 2);
    CHECK_EQ(buf[0], 0x02);
    CHECK_EQ(buf[1], 16);

    c = (tag_control_t){ .op = TAG_CTRL_MUTE, .arg = 60 };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 3);
    CHECK_EQ(buf[0], 0x03);
    CHECK_EQ(buf[1], 60);
    CHECK_EQ(buf[2], 0);

    /* Without a known weekday the frame stays 3 bytes, as older senders emit. */
    c = (tag_control_t){ .op = TAG_CTRL_SET_TIME, .arg = 1439 };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 3);
    CHECK_EQ(buf[0], 0x04);
    CHECK_EQ(buf[1], 0x9F);
    CHECK_EQ(buf[2], 0x05);

    c = (tag_control_t){ .op = TAG_CTRL_FACTORY_RESET };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 2);
    CHECK_EQ(buf[0], 0x05);
    CHECK_EQ(buf[1], 0xA5);

    c = (tag_control_t){ .op = TAG_CTRL_ENTER_DFU };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 1);
    CHECK_EQ(buf[0], 0x06);
}

TEST(set_time_carries_the_weekday_when_it_is_known)
{
    uint8_t buf[8];
    tag_control_t c = { .op = TAG_CTRL_SET_TIME, .arg = 12 * 60, .has_day_of_week = true,
                        .day_of_week = 2 /* Wednesday */ };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 4);
    CHECK_EQ(buf[0], 0x04);
    CHECK_EQ(buf[3], 2);

    tag_control_t out;
    CHECK_EQ(tag_control_decode(buf, 4, &out), TAG_OK);
    CHECK_EQ(out.has_day_of_week, true);
    CHECK_EQ(out.day_of_week, 2);

    /* A 3-byte frame from an older app decodes with no weekday, not Monday. */
    CHECK_EQ(tag_control_decode(buf, 3, &out), TAG_OK);
    CHECK_EQ(out.has_day_of_week, false);
    CHECK_EQ(out.day_of_week, TAG_DAY_UNKNOWN);
}

TEST(a_zero_initialised_control_never_claims_a_weekday)
{
    /* The wire uses 0 for Monday, so the struct must not default to it. */
    uint8_t buf[8];
    tag_control_t c = { .op = TAG_CTRL_SET_TIME, .arg = 60 };
    CHECK_EQ(tag_control_encode(&c, buf, sizeof(buf)), 3);
}

TEST(control_decode_rejects_a_bad_factory_reset)
{
    uint8_t bad[2] = { 0x05, 0x00 };
    tag_control_t out;
    CHECK_EQ(tag_control_decode(bad, sizeof(bad), &out), TAG_ERR_VALUE);
    uint8_t good[2] = { 0x05, 0xA5 };
    CHECK_EQ(tag_control_decode(good, sizeof(good), &out), TAG_OK);
    CHECK_EQ(out.op, TAG_CTRL_FACTORY_RESET);
}

TEST(a_degenerate_quiet_window_fails_safe_to_always_quiet)
{
    /*
     * start == end cannot express a duration. It must mean "always", not
     * "never": a silent tag disappoints, a tag talking through a lesson gets
     * the product thrown away. The app refuses to produce this config, so this
     * is the last line of defence.
     */
    CHECK_EQ(tag_minute_in_window(0, 600, 600), true);
    CHECK_EQ(tag_minute_in_window(720, 600, 600), true);
    CHECK_EQ(tag_minute_in_window(1439, 0, 0), true);

    tag_config_t c = sample_config();
    c.quiet_start_min = 8 * 60;
    c.quiet_end_min = 8 * 60;
    CHECK_EQ(tag_in_quiet_hours(&c, 15 * 60, TAG_DAY_UNKNOWN), true);
}

TEST(quiet_hours_wrap_past_midnight)
{
    tag_config_t c = sample_config(); /* 20:00 to 07:00 */
    CHECK_EQ(tag_in_quiet_hours(&c, 21 * 60, TAG_DAY_UNKNOWN), true);
    CHECK_EQ(tag_in_quiet_hours(&c, 2 * 60, TAG_DAY_UNKNOWN), true);
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, TAG_DAY_UNKNOWN), false);
    CHECK_EQ(tag_in_quiet_hours(&c, 20 * 60, TAG_DAY_UNKNOWN), true);  /* start is inclusive */
    CHECK_EQ(tag_in_quiet_hours(&c, 7 * 60, TAG_DAY_UNKNOWN), false);  /* end is exclusive */

    c.quiet_start_min = 9 * 60;
    c.quiet_end_min = 17 * 60;
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, TAG_DAY_UNKNOWN), true);
    CHECK_EQ(tag_in_quiet_hours(&c, 8 * 60, TAG_DAY_UNKNOWN), false);

    c.quiet_enabled = false;
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, TAG_DAY_UNKNOWN), false);
}

TEST(the_school_window_silences_the_tag_on_school_days)
{
    tag_config_t c = sample_config();       /* night window 20:00-07:00 */
    c.school_enabled = true;
    c.school_start_min = 8 * 60 + 30;
    c.school_end_min = 15 * 60 + 30;
    c.school_days = 0x1F;                   /* Monday to Friday */

    /* Wednesday lunchtime: silent. */
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, 2), true);
    /* Wednesday after school: talking again. */
    CHECK_EQ(tag_in_quiet_hours(&c, 16 * 60, 2), false);
    /* Saturday lunchtime: the mask excludes it. */
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, 5), false);
    /* Night still applies on any day. */
    CHECK_EQ(tag_in_quiet_hours(&c, 23 * 60, 5), true);

    /* Without a known weekday the tag errs towards silence. */
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, TAG_DAY_UNKNOWN), true);

    /* An empty mask means every day. */
    c.school_days = 0;
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, 5), true);

    c.school_enabled = false;
    CHECK_EQ(tag_in_quiet_hours(&c, 12 * 60, 2), false);
}

TEST(the_school_window_round_trips)
{
    tag_config_t in = sample_config();
    in.school_enabled = true;
    in.school_start_min = 8 * 60 + 30;
    in.school_end_min = 15 * 60 + 30;
    in.school_days = 0x1F;
    uint8_t buf[TAGALONG_CONFIG_LEN];
    tag_config_t out;
    CHECK_EQ(tag_config_encode(&in, buf, sizeof(buf)), TAG_OK);
    CHECK_EQ(tag_config_decode(buf, sizeof(buf), &out), TAG_OK);
    CHECK_EQ(out.school_enabled, true);
    CHECK_EQ(out.school_start_min, 8 * 60 + 30);
    CHECK_EQ(out.school_end_min, 15 * 60 + 30);
    CHECK_EQ(out.school_days, 0x1F);
}

int main(void)
{
    RUN(config_encodes_the_documented_bytes);
    RUN(config_round_trips);
    RUN(every_ten_minute_quiet_value_round_trips);
    RUN(disabled_quiet_hours_use_the_sentinel);
    RUN(config_rejects_a_corrupt_frame);
    RUN(other_thing_uses_code_255);
    RUN(event_frame_round_trips);
    RUN(event_frame_rejects_unknown_codes);
    RUN(info_frame_round_trips);
    RUN(control_ops_match_the_protocol_table);
    RUN(set_time_carries_the_weekday_when_it_is_known);
    RUN(a_zero_initialised_control_never_claims_a_weekday);
    RUN(control_decode_rejects_a_bad_factory_reset);
    RUN(a_degenerate_quiet_window_fails_safe_to_always_quiet);
    RUN(quiet_hours_wrap_past_midnight);
    RUN(the_school_window_silences_the_tag_on_school_days);
    RUN(the_school_window_round_trips);
    return test_report("protocol");
}
