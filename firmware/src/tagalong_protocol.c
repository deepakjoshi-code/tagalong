#include "tagalong_protocol.h"

static uint16_t rd16(const uint8_t *p) { return (uint16_t)(p[0] | ((uint16_t)p[1] << 8)); }
static void wr16(uint8_t *p, uint16_t v) { p[0] = (uint8_t)(v & 0xFFu); p[1] = (uint8_t)(v >> 8); }
static uint32_t rd32(const uint8_t *p)
{
    return (uint32_t)p[0] | ((uint32_t)p[1] << 8) | ((uint32_t)p[2] << 16) | ((uint32_t)p[3] << 24);
}
static void wr32(uint8_t *p, uint32_t v)
{
    p[0] = (uint8_t)(v & 0xFFu);
    p[1] = (uint8_t)((v >> 8) & 0xFFu);
    p[2] = (uint8_t)((v >> 16) & 0xFFu);
    p[3] = (uint8_t)((v >> 24) & 0xFFu);
}

static uint8_t clamp_u8(long v, long lo, long hi)
{
    if (v < lo) v = lo;
    if (v > hi) v = hi;
    return (uint8_t)v;
}

uint8_t tag_xor_checksum(const uint8_t *bytes, size_t len)
{
    uint8_t x = 0;
    for (size_t i = 0; i < len; i++) x ^= bytes[i];
    return x;
}

bool tag_event_is_known(uint8_t code)
{
    switch (code) {
    case TAG_EVT_PICKUP: case TAG_EVT_PUTDOWN: case TAG_EVT_DROP: case TAG_EVT_SHAKE:
    case TAG_EVT_TAP: case TAG_EVT_LONG_STILL: case TAG_EVT_GOOD_MORNING:
    case TAG_EVT_LOW_BATTERY: case TAG_EVT_CHARGING:
    case TAG_EVT_FILLED: case TAG_EVT_SIP: case TAG_EVT_EMPTY:
    case TAG_EVT_OPENED: case TAG_EVT_CLOSED: case TAG_EVT_PACKED:
    case TAG_EVT_LEFT_BEHIND: case TAG_EVT_ZIPPED:
    case TAG_EVT_BRUSH_START: case TAG_EVT_BRUSH_DONE: case TAG_EVT_BRUSH_SHORT:
        return true;
    default:
        return false;
    }
}

static bool thing_is_known(uint8_t code)
{
    return code <= TAG_THING_JACKET || code == TAG_THING_OTHER;
}

tag_status_t tag_config_encode(const tag_config_t *cfg, uint8_t *out, size_t out_len)
{
    if (!cfg || !out || out_len < TAGALONG_CONFIG_LEN) return TAG_ERR_LENGTH;
    if (cfg->age_band >= TAG_BAND_COUNT || cfg->personality >= TAG_PERSONALITY_COUNT) return TAG_ERR_VALUE;
    if (!thing_is_known((uint8_t)cfg->thing)) return TAG_ERR_VALUE;
    if (cfg->language > TAG_LANG_HI) return TAG_ERR_VALUE;

    out[0] = TAGALONG_PROTO_VERSION;
    out[1] = (uint8_t)cfg->age_band;
    out[2] = (uint8_t)cfg->thing;
    out[3] = (uint8_t)cfg->personality;
    out[4] = clamp_u8(cfg->volume, 0, 100);
    if (cfg->quiet_enabled) {
        /* Round to the 10-minute grid the wire format allows. */
        out[5] = clamp_u8((cfg->quiet_start_min + TAGALONG_QUIET_STEP / 2) / TAGALONG_QUIET_STEP, 0, 143);
        out[6] = clamp_u8((cfg->quiet_end_min + TAGALONG_QUIET_STEP / 2) / TAGALONG_QUIET_STEP, 0, 143);
    } else {
        out[5] = TAGALONG_QUIET_DISABLED;
        out[6] = TAGALONG_QUIET_DISABLED;
    }
    out[7] = (uint8_t)cfg->language;
    out[8] = cfg->flags;
    out[9] = clamp_u8(cfg->max_per_hour, 1, 30);
    wr16(&out[10], (uint16_t)(cfg->time_of_day_min > 1439 ? 1439 : cfg->time_of_day_min));
    if (cfg->school_enabled) {
        out[12] = clamp_u8((cfg->school_start_min + TAGALONG_QUIET_STEP / 2) / TAGALONG_QUIET_STEP, 0, 143);
        out[13] = clamp_u8((cfg->school_end_min + TAGALONG_QUIET_STEP / 2) / TAGALONG_QUIET_STEP, 0, 143);
    } else {
        out[12] = TAGALONG_QUIET_DISABLED;
        out[13] = TAGALONG_QUIET_DISABLED;
    }
    out[14] = (uint8_t)(cfg->school_days & 0x7Fu);
    out[15] = tag_xor_checksum(out, 15);
    return TAG_OK;
}

tag_status_t tag_config_decode(const uint8_t *in, size_t in_len, tag_config_t *out)
{
    if (!in || !out || in_len < TAGALONG_CONFIG_LEN) return TAG_ERR_LENGTH;
    if (in[0] != TAGALONG_PROTO_VERSION) return TAG_ERR_VERSION;
    if (tag_xor_checksum(in, 15) != in[15]) return TAG_ERR_CHECKSUM;
    if (in[1] >= TAG_BAND_COUNT || in[3] >= TAG_PERSONALITY_COUNT) return TAG_ERR_VALUE;
    if (!thing_is_known(in[2]) || in[7] > TAG_LANG_HI) return TAG_ERR_VALUE;

    out->version = in[0];
    out->age_band = (tag_age_band_t)in[1];
    out->thing = (tag_thing_t)in[2];
    out->personality = (tag_personality_t)in[3];
    out->volume = in[4];
    out->quiet_enabled = (in[5] != TAGALONG_QUIET_DISABLED) && (in[6] != TAGALONG_QUIET_DISABLED);
    out->quiet_start_min = out->quiet_enabled ? (uint16_t)(in[5] * TAGALONG_QUIET_STEP) : 0u;
    out->quiet_end_min = out->quiet_enabled ? (uint16_t)(in[6] * TAGALONG_QUIET_STEP) : 0u;
    out->language = (tag_language_t)in[7];
    out->flags = in[8];
    out->max_per_hour = in[9];
    out->time_of_day_min = rd16(&in[10]);
    out->school_enabled = (in[12] != TAGALONG_QUIET_DISABLED) && (in[13] != TAGALONG_QUIET_DISABLED);
    out->school_start_min = out->school_enabled ? (uint16_t)(in[12] * TAGALONG_QUIET_STEP) : 0u;
    out->school_end_min = out->school_enabled ? (uint16_t)(in[13] * TAGALONG_QUIET_STEP) : 0u;
    out->school_days = (uint8_t)(in[14] & 0x7Fu);
    return TAG_OK;
}

tag_status_t tag_info_encode(const tag_info_t *info, uint8_t *out, size_t out_len)
{
    if (!info || !out || out_len < TAGALONG_INFO_LEN) return TAG_ERR_LENGTH;
    out[0] = info->fw_major;
    out[1] = info->fw_minor;
    out[2] = info->fw_patch;
    out[3] = info->hw_rev;
    wr16(&out[4], info->pack_id);
    wr16(&out[6], info->pack_version);
    out[8] = clamp_u8(info->battery, 0, 100);
    wr16(&out[9], info->uptime_min);
    out[11] = info->flags;
    return TAG_OK;
}

tag_status_t tag_info_decode(const uint8_t *in, size_t in_len, tag_info_t *out)
{
    if (!in || !out || in_len < TAGALONG_INFO_LEN) return TAG_ERR_LENGTH;
    out->fw_major = in[0];
    out->fw_minor = in[1];
    out->fw_patch = in[2];
    out->hw_rev = in[3];
    out->pack_id = rd16(&in[4]);
    out->pack_version = rd16(&in[6]);
    out->battery = in[8] > 100 ? 100 : in[8];
    out->uptime_min = rd16(&in[9]);
    out->flags = in[11];
    return TAG_OK;
}

tag_status_t tag_event_encode(const tag_event_frame_t *ev, uint8_t *out, size_t out_len)
{
    if (!ev || !out || out_len < TAGALONG_EVENT_LEN) return TAG_ERR_LENGTH;
    if (!tag_event_is_known((uint8_t)ev->type)) return TAG_ERR_VALUE;
    out[0] = TAGALONG_PROTO_VERSION;
    out[1] = (uint8_t)ev->type;
    wr32(&out[2], ev->uptime_sec);
    out[6] = clamp_u8(ev->battery, 0, 100);
    out[7] = ev->aux;
    return TAG_OK;
}

tag_status_t tag_event_decode(const uint8_t *in, size_t in_len, tag_event_frame_t *out)
{
    if (!in || !out || in_len < TAGALONG_EVENT_LEN) return TAG_ERR_LENGTH;
    if (in[0] != TAGALONG_PROTO_VERSION) return TAG_ERR_VERSION;
    if (!tag_event_is_known(in[1])) return TAG_ERR_VALUE;
    out->version = in[0];
    out->type = (tag_event_type_t)in[1];
    out->uptime_sec = rd32(&in[2]);
    out->battery = in[6] > 100 ? 100 : in[6];
    out->aux = in[7];
    return TAG_OK;
}

int tag_control_encode(const tag_control_t *ctrl, uint8_t *out, size_t out_len)
{
    if (!ctrl || !out || out_len < 1) return TAG_ERR_LENGTH;
    switch (ctrl->op) {
    case TAG_CTRL_IDENTIFY:
        out[0] = TAG_CTRL_IDENTIFY;
        return 1;
    case TAG_CTRL_ENTER_DFU:
        out[0] = TAG_CTRL_ENTER_DFU;
        return 1;
    case TAG_CTRL_PREVIEW:
        if (out_len < 2) return TAG_ERR_LENGTH;
        if (!tag_event_is_known((uint8_t)ctrl->preview)) return TAG_ERR_VALUE;
        out[0] = TAG_CTRL_PREVIEW;
        out[1] = (uint8_t)ctrl->preview;
        return 2;
    case TAG_CTRL_FACTORY_RESET:
        if (out_len < 2) return TAG_ERR_LENGTH;
        out[0] = TAG_CTRL_FACTORY_RESET;
        out[1] = 0xA5;
        return 2;
    case TAG_CTRL_MUTE:
    case TAG_CTRL_SET_TIME: {
        if (out_len < 3) return TAG_ERR_LENGTH;
        uint16_t arg = ctrl->arg;
        if (ctrl->op == TAG_CTRL_SET_TIME && arg > 1439u) arg = 1439u;
        out[0] = (uint8_t)ctrl->op;
        wr16(&out[1], arg);
        return 3;
    }
    default:
        return TAG_ERR_VALUE;
    }
}

tag_status_t tag_control_decode(const uint8_t *in, size_t in_len, tag_control_t *out)
{
    if (!in || !out || in_len < 1) return TAG_ERR_LENGTH;
    out->arg = 0;
    out->preview = TAG_EVT_NONE;
    switch (in[0]) {
    case TAG_CTRL_IDENTIFY:
    case TAG_CTRL_ENTER_DFU:
        out->op = (tag_control_op_t)in[0];
        return TAG_OK;
    case TAG_CTRL_PREVIEW:
        if (in_len < 2) return TAG_ERR_LENGTH;
        if (!tag_event_is_known(in[1])) return TAG_ERR_VALUE;
        out->op = TAG_CTRL_PREVIEW;
        out->preview = (tag_event_type_t)in[1];
        return TAG_OK;
    case TAG_CTRL_FACTORY_RESET:
        if (in_len < 2 || in[1] != 0xA5) return TAG_ERR_VALUE;
        out->op = TAG_CTRL_FACTORY_RESET;
        return TAG_OK;
    case TAG_CTRL_MUTE:
    case TAG_CTRL_SET_TIME:
        if (in_len < 3) return TAG_ERR_LENGTH;
        out->op = (tag_control_op_t)in[0];
        out->arg = rd16(&in[1]);
        return TAG_OK;
    default:
        return TAG_ERR_VALUE;
    }
}

bool tag_minute_in_window(uint16_t minute_of_day, uint16_t start_min, uint16_t end_min)
{
    if (start_min == end_min) return false;
    if (start_min < end_min) return minute_of_day >= start_min && minute_of_day < end_min;
    /* Wraps past midnight. */
    return minute_of_day >= start_min || minute_of_day < end_min;
}

bool tag_in_quiet_hours(const tag_config_t *cfg, uint16_t minute_of_day, uint8_t day_of_week)
{
    if (!cfg) return false;

    if (cfg->quiet_enabled &&
        tag_minute_in_window(minute_of_day, cfg->quiet_start_min, cfg->quiet_end_min)) {
        return true;
    }

    if (cfg->school_enabled &&
        tag_minute_in_window(minute_of_day, cfg->school_start_min, cfg->school_end_min)) {
        /*
         * An empty mask means every day. When the tag does not know the weekday
         * it applies the window anyway: being quiet on a Saturday is a small
         * disappointment, talking in a classroom is what gets the product banned.
         */
        if (cfg->school_days == 0u) return true;
        if (day_of_week == TAG_DAY_UNKNOWN) return true;
        if (day_of_week < 7u && (cfg->school_days & (uint8_t)(1u << day_of_week))) return true;
    }
    return false;
}
