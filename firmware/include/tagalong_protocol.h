/*
 * Tagalong BLE wire protocol — shared encode/decode.
 *
 * This is the C half of the contract in docs/protocol/tag-protocol.md. The app's
 * TypeScript implementation lives in app/src/transport/codec.ts and MUST produce
 * byte-identical frames; tests/test_protocol.c checks the vectors both sides agree on.
 *
 * Pure C99, no RTOS or libc dependencies beyond <stdint.h>/<stdbool.h>/<string.h>,
 * so it builds under Zephyr and runs in host unit tests unchanged.
 */
#ifndef TAGALONG_PROTOCOL_H
#define TAGALONG_PROTOCOL_H

#include <stdbool.h>
#include <stddef.h>
#include <stdint.h>

#define TAGALONG_PROTO_VERSION 1u
#define TAGALONG_CONFIG_LEN 16u
#define TAGALONG_INFO_LEN 12u
#define TAGALONG_EVENT_LEN 8u

/** Quiet hours are carried as minutes/10; 255 means disabled. */
#define TAGALONG_QUIET_DISABLED 255u
#define TAGALONG_QUIET_STEP 10u

typedef enum {
    TAG_BAND_LITTLE = 0,
    TAG_BAND_KID = 1,
    TAG_BAND_BIG = 2,
    TAG_BAND_COUNT = 3
} tag_age_band_t;

typedef enum {
    TAG_PERSONALITY_SILLY = 0,
    TAG_PERSONALITY_SWEET = 1,
    TAG_PERSONALITY_BRAVE = 2,
    TAG_PERSONALITY_COUNT = 3
} tag_personality_t;

typedef enum {
    TAG_THING_BOTTLE = 0,
    TAG_THING_LUNCHBOX = 1,
    TAG_THING_BACKPACK = 2,
    TAG_THING_TOOTHBRUSH = 3,
    TAG_THING_SHOES = 4,
    TAG_THING_PLUSH = 5,
    TAG_THING_HELMET = 6,
    TAG_THING_JACKET = 7,
    TAG_THING_OTHER = 255
} tag_thing_t;

typedef enum {
    TAG_LANG_EN = 0,
    TAG_LANG_ES = 1,
    TAG_LANG_HI = 2
} tag_language_t;

/* Event codes. Must match EVENT_META in app/src/domain/events.ts. */
typedef enum {
    TAG_EVT_PICKUP = 0,
    TAG_EVT_PUTDOWN = 1,
    TAG_EVT_DROP = 2,
    TAG_EVT_SHAKE = 3,
    TAG_EVT_TAP = 4,
    TAG_EVT_LONG_STILL = 5,
    TAG_EVT_GOOD_MORNING = 6,
    TAG_EVT_LOW_BATTERY = 7,
    TAG_EVT_CHARGING = 8,
    TAG_EVT_FILLED = 16,
    TAG_EVT_SIP = 17,
    TAG_EVT_EMPTY = 18,
    TAG_EVT_OPENED = 32,
    TAG_EVT_CLOSED = 33,
    TAG_EVT_PACKED = 34,
    TAG_EVT_LEFT_BEHIND = 48,
    TAG_EVT_ZIPPED = 49,
    TAG_EVT_BRUSH_START = 64,
    TAG_EVT_BRUSH_DONE = 65,
    TAG_EVT_BRUSH_SHORT = 66,
    TAG_EVT_NONE = 255
} tag_event_type_t;

/* Config flag bits (byte 8). */
#define TAG_FLAG_NUDGES (1u << 0)
#define TAG_FLAG_EVENT_BUFFER (1u << 1)
#define TAG_FLAG_NAME_CLIP (1u << 2)
#define TAG_FLAG_LED (1u << 3)

/* Info flag bits (byte 11). */
#define TAG_INFO_CHARGING (1u << 0)
#define TAG_INFO_MUTED (1u << 1)
#define TAG_INFO_NAME_CLIP (1u << 2)

typedef struct {
    uint8_t version;
    tag_age_band_t age_band;
    tag_thing_t thing;
    tag_personality_t personality;
    uint8_t volume;        /* 0..100 */
    bool quiet_enabled;
    uint16_t quiet_start_min; /* minutes since midnight, multiple of 10 */
    uint16_t quiet_end_min;
    tag_language_t language;
    uint8_t flags;
    uint8_t max_per_hour;  /* 1..30 */
    uint16_t time_of_day_min;
    /* Second, independent quiet window for the school day. */
    bool school_enabled;
    uint16_t school_start_min;
    uint16_t school_end_min;
    uint8_t school_days;   /* bit0 = Monday .. bit6 = Sunday; 0 = every day */
} tag_config_t;

typedef struct {
    uint8_t fw_major, fw_minor, fw_patch;
    uint8_t hw_rev;
    uint16_t pack_id;
    uint16_t pack_version;
    uint8_t battery;
    uint16_t uptime_min;
    uint8_t flags;
} tag_info_t;

typedef struct {
    uint8_t version;
    tag_event_type_t type;
    uint32_t uptime_sec;
    uint8_t battery;
    uint8_t aux;
} tag_event_frame_t;

typedef enum {
    TAG_CTRL_IDENTIFY = 0x01,
    TAG_CTRL_PREVIEW = 0x02,
    TAG_CTRL_MUTE = 0x03,
    TAG_CTRL_SET_TIME = 0x04,
    TAG_CTRL_FACTORY_RESET = 0x05,
    TAG_CTRL_ENTER_DFU = 0x06
} tag_control_op_t;

typedef struct {
    tag_control_op_t op;
    uint16_t arg;               /* minutes for MUTE/SET_TIME */
    tag_event_type_t preview;   /* for PREVIEW */
} tag_control_t;

typedef enum {
    TAG_OK = 0,
    TAG_ERR_LENGTH = -1,
    TAG_ERR_VERSION = -2,
    TAG_ERR_CHECKSUM = -3,
    TAG_ERR_VALUE = -4
} tag_status_t;

/** XOR of the first `len` bytes — the config frame's integrity check. */
uint8_t tag_xor_checksum(const uint8_t *bytes, size_t len);

/** Writes TAGALONG_CONFIG_LEN bytes. Returns TAG_OK or TAG_ERR_VALUE. */
tag_status_t tag_config_encode(const tag_config_t *cfg, uint8_t *out, size_t out_len);
tag_status_t tag_config_decode(const uint8_t *in, size_t in_len, tag_config_t *out);

tag_status_t tag_info_encode(const tag_info_t *info, uint8_t *out, size_t out_len);
tag_status_t tag_info_decode(const uint8_t *in, size_t in_len, tag_info_t *out);

tag_status_t tag_event_encode(const tag_event_frame_t *ev, uint8_t *out, size_t out_len);
tag_status_t tag_event_decode(const uint8_t *in, size_t in_len, tag_event_frame_t *out);

/** Returns the number of bytes written (1..3), or a negative tag_status_t. */
int tag_control_encode(const tag_control_t *ctrl, uint8_t *out, size_t out_len);
tag_status_t tag_control_decode(const uint8_t *in, size_t in_len, tag_control_t *out);

/** True if `event` is a code this firmware knows. */
bool tag_event_is_known(uint8_t code);

/** True when `minute_of_day` is inside a window, handling wrap past midnight. */
bool tag_minute_in_window(uint16_t minute_of_day, uint16_t start_min, uint16_t end_min);

/**
 * True when the tag must stay silent: inside the night window, or inside the
 * school window on a day the school mask covers.
 * `day_of_week` is 0 for Monday .. 6 for Sunday; pass TAG_DAY_UNKNOWN when the
 * tag has not been told the day, in which case the school mask is ignored.
 */
#define TAG_DAY_UNKNOWN 0xFFu
bool tag_in_quiet_hours(const tag_config_t *cfg, uint16_t minute_of_day, uint8_t day_of_week);

#endif /* TAGALONG_PROTOCOL_H */
