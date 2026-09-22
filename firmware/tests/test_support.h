/* Minimal host test harness — no framework, no dependencies, runs anywhere gcc does. */
#ifndef TEST_SUPPORT_H
#define TEST_SUPPORT_H

#include <stdio.h>
#include <string.h>

static int tests_run = 0;
static int tests_failed = 0;
static const char *current_test = "";

#define TEST(name)                                                                                 \
    static void name(void);                                                                        \
    static void run_##name(void) { current_test = #name; tests_run++; name(); }                    \
    static void name(void)

#define RUN(name) run_##name()

#define CHECK(cond)                                                                                \
    do {                                                                                           \
        if (!(cond)) {                                                                             \
            tests_failed++;                                                                        \
            printf("  FAIL %s:%d  %s\n    expected: %s\n", current_test, __LINE__, "", #cond);     \
            return;                                                                                \
        }                                                                                          \
    } while (0)

#define CHECK_EQ(actual, expected)                                                                 \
    do {                                                                                           \
        long _a = (long)(actual), _e = (long)(expected);                                           \
        if (_a != _e) {                                                                            \
            tests_failed++;                                                                        \
            printf("  FAIL %s:%d  %s\n    expected %ld, got %ld\n", current_test, __LINE__,        \
                   #actual, _e, _a);                                                               \
            return;                                                                                \
        }                                                                                          \
    } while (0)

#define CHECK_BYTES(actual, expected, len)                                                         \
    do {                                                                                           \
        if (memcmp((actual), (expected), (len)) != 0) {                                            \
            tests_failed++;                                                                        \
            printf("  FAIL %s:%d  bytes differ\n    expected:", current_test, __LINE__);           \
            for (size_t _i = 0; _i < (size_t)(len); _i++) printf(" %02X", (expected)[_i]);         \
            printf("\n    actual:  ");                                                             \
            for (size_t _i = 0; _i < (size_t)(len); _i++) printf(" %02X", (actual)[_i]);           \
            printf("\n");                                                                          \
            return;                                                                                \
        }                                                                                          \
    } while (0)

static int test_report(const char *suite)
{
    if (tests_failed == 0) {
        printf("PASS %s (%d tests)\n", suite, tests_run);
        return 0;
    }
    printf("FAIL %s (%d of %d tests failed)\n", suite, tests_failed, tests_run);
    return 1;
}

#endif /* TEST_SUPPORT_H */
