# Zephyr application build for the Tagalong tag (nRF52840).
#
# This is the on-target build. The protocol and policy sources it pulls in are
# the same files the host tests in Makefile exercise, so what is tested is what
# ships. Requires nRF Connect SDK v2.6 or newer.
#
#   west build -b tagalong_nrf52840 tagalong/firmware
cmake_minimum_required(VERSION 3.20.0)

find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(tagalong)

target_include_directories(app PRIVATE include)

target_sources(app PRIVATE
  src/tagalong_protocol.c
  src/tagalong_policy.c
  # Board-dependent sources are added as they are written; see
  # docs/firmware/firmware-architecture.md for the intended module layout.
  # src/main.c
  # src/ble_service.c
  # src/event_engine.c
  # src/audio.c
  # src/power.c
)
