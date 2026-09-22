# Host build for the portable parts of the Tagalong firmware.
#
# The protocol and utterance policy are plain C99 with no RTOS dependency, so
# they can be unit-tested on any machine with a C compiler — no board, no
# toolchain, no Zephyr install. The Zephyr build lives in CMakeLists.txt.
#
#   make test     build and run every host test
#   make vectors  print the canonical wire vectors as JSON
#   make clean

CC      ?= gcc
CFLAGS  ?= -std=c99 -Wall -Wextra -Werror -Wshadow -Wconversion -O2
INCLUDES = -Iinclude -Itests
BUILD    = build

SRC      = src/tagalong_protocol.c src/tagalong_policy.c
TESTS    = tests/test_protocol.c tests/test_policy.c
BINS     = $(patsubst tests/%.c,$(BUILD)/%,$(TESTS))

.PHONY: all test vectors clean
all: test

$(BUILD):
	@mkdir -p $(BUILD)

$(BUILD)/%: tests/%.c $(SRC) | $(BUILD)
	$(CC) $(CFLAGS) $(INCLUDES) $(SRC) $< -o $@

test: $(BINS)
	@fail=0; for t in $(BINS); do ./$$t || fail=1; done; exit $$fail

vectors: | $(BUILD)
	@$(CC) $(CFLAGS) $(INCLUDES) src/tagalong_protocol.c tests/dump_vectors.c -o $(BUILD)/dump_vectors
	@./$(BUILD)/dump_vectors

clean:
	rm -rf $(BUILD)
