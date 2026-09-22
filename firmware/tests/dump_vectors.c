/*
 * Emits the canonical wire vectors as JSON so the app's TypeScript codec can be
 * checked against this firmware byte for byte. Run by tools/check-codec-parity.mjs.
 */
#include "tagalong_protocol.h"

#include <stdio.h>

static void print_bytes(const char *name, const uint8_t *b, size_t n, bool last)
{
    printf("    \"%s\": [", name);
    for (size_t i = 0; i < n; i++) printf("%s%u", i ? ", " : "", b[i]);
    printf("]%s\n", last ? "" : ",");
}

int main(void)
{
    uint8_t buf[16];

    printf("{\n  \"config\": {\n");

    tag_config_t a = { 1, TAG_BAND_KID, TAG_THING_BOTTLE, TAG_PERSONALITY_BRAVE, 70,
                       true, 20 * 60, 7 * 60, TAG_LANG_EN,
                       TAG_FLAG_EVENT_BUFFER | TAG_FLAG_LED, 12, 9 * 60 + 5,
                       false, 0, 0, 0 };
    tag_config_encode(&a, buf, sizeof(buf));
    print_bytes("kid_bottle_brave", buf, TAGALONG_CONFIG_LEN, false);

    tag_config_t b = { 1, TAG_BAND_LITTLE, TAG_THING_TOOTHBRUSH, TAG_PERSONALITY_SWEET, 100,
                       false, 0, 0, TAG_LANG_EN,
                       TAG_FLAG_NUDGES | TAG_FLAG_NAME_CLIP, 30, 0,
                       true, 8 * 60 + 30, 15 * 60 + 30, 0x1F };
    tag_config_encode(&b, buf, sizeof(buf));
    print_bytes("little_toothbrush_sweet_no_quiet", buf, TAGALONG_CONFIG_LEN, false);

    tag_config_t c = { 1, TAG_BAND_BIG, TAG_THING_OTHER, TAG_PERSONALITY_SILLY, 0,
                       true, 0, 1430, TAG_LANG_EN, 0, 1, 1439,
                       false, 0, 0, 0 };
    tag_config_encode(&c, buf, sizeof(buf));
    print_bytes("big_other_silly_edges", buf, TAGALONG_CONFIG_LEN, true);

    printf("  },\n  \"event\": {\n");

    tag_event_frame_t e1 = { 1, TAG_EVT_DROP, 42u, 86, 35 };
    tag_event_encode(&e1, buf, sizeof(buf));
    print_bytes("drop", buf, TAGALONG_EVENT_LEN, false);

    tag_event_frame_t e2 = { 1, TAG_EVT_BRUSH_DONE, 123456u, 64, 60 };
    tag_event_encode(&e2, buf, sizeof(buf));
    print_bytes("brush_done", buf, TAGALONG_EVENT_LEN, true);

    printf("  },\n  \"info\": {\n");

    tag_info_t i1 = { 0, 9, 0, 1, 1, 1, 86, 1234, TAG_INFO_CHARGING };
    tag_info_encode(&i1, buf, sizeof(buf));
    print_bytes("charging", buf, TAGALONG_INFO_LEN, true);

    printf("  },\n  \"control\": {\n");

    tag_control_t k;
    k = (tag_control_t){ .op = TAG_CTRL_IDENTIFY };
    print_bytes("identify", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), false);
    k = (tag_control_t){ .op = TAG_CTRL_PREVIEW, .preview = TAG_EVT_FILLED };
    print_bytes("preview_filled", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), false);
    k = (tag_control_t){ .op = TAG_CTRL_MUTE, .arg = 60 };
    print_bytes("mute_60", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), false);
    k = (tag_control_t){ .op = TAG_CTRL_SET_TIME, .arg = 1439 };
    print_bytes("set_time_1439", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), false);
    k = (tag_control_t){ .op = TAG_CTRL_FACTORY_RESET };
    print_bytes("factory_reset", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), false);
    k = (tag_control_t){ .op = TAG_CTRL_ENTER_DFU };
    print_bytes("enter_dfu", buf, (size_t)tag_control_encode(&k, buf, sizeof(buf)), true);

    printf("  }\n}\n");
    return 0;
}
