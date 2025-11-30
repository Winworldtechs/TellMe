"""
Booking engine utilities: slot generation, collision detection, and unit tests.

This module is intentionally framework-agnostic: core functions accept plain
Python datetimes/times and a list of existing bookings. That makes it easy to
unit-test and integrate into Django views/serializers by converting DB bookings
into the expected list format.

Usage:
- generate_slots(date, open_time, close_time, duration_minutes, slot_interval_minutes, booked_intervals)
  returns a list of available slot start datetimes (timezone-naive — use timezone-aware datetimes in production).

- overlaps(a_start, a_end, b_start, b_end) -> bool

Example existing booking format expected by generate_slots:
    booked_intervals = [
        (datetime.datetime(2025,9,20,9,0), datetime.datetime(2025,9,20,9,30)),
        (datetime.datetime(2025,9,20,10,0), datetime.datetime(2025,9,20,10,45)),
    ]

This file includes pure-Python unit tests at the bottom (unittest).

"""
from __future__ import annotations

import datetime
from typing import List, Tuple

DateTime = datetime.datetime
Date = datetime.date
Time = datetime.time
Interval = Tuple[DateTime, DateTime]


def overlaps(a_start: DateTime, a_end: DateTime, b_start: DateTime, b_end: DateTime) -> bool:
    """Return True if intervals [a_start, a_end) and [b_start, b_end) overlap.

    Intervals are half-open: end is exclusive. Handles equality at boundaries by
    treating back-to-back slots as non-overlapping.
    """
    return not (a_end <= b_start or b_end <= a_start)


def normalize_intervals(booked: List[Interval]) -> List[Interval]:
    """Merge overlapping/adjacent booked intervals and sort them.

    This helps make collision checks faster and cleaner.
    """
    if not booked:
        return []
    # Sort by start
    booked_sorted = sorted(booked, key=lambda x: x[0])
    merged = [booked_sorted[0]]
    for start, end in booked_sorted[1:]:
        last_start, last_end = merged[-1]
        # If the next interval overlaps or touches (last_end >= start), merge them
        if last_end >= start:
            # Extend the last interval
            merged[-1] = (last_start, max(last_end, end))
        else:
            merged.append((start, end))
    return merged


def generate_slots(
    date: Date,
    open_time: Time,
    close_time: Time,
    duration_minutes: int,
    slot_interval_minutes: int,
    booked_intervals: List[Interval],
    tzinfo: datetime.tzinfo | None = None,
) -> List[DateTime]:
    """Generate available slot start datetimes for a provider on a given date.

    Parameters
    - date: the requested date (datetime.date)
    - open_time, close_time: provider opening and closing times (datetime.time)
    - duration_minutes: service duration
    - slot_interval_minutes: the step between candidate start times
    - booked_intervals: list of (start_datetime, end_datetime) pairs for that date
    - tzinfo: optional timezone to attach to produced datetimes

    Returns a list of datetime objects (start times) when a new booking can begin
    such that the booking fits entirely between open_time and close_time and does
    not overlap any booked_intervals.

    Notes
    - This function treats booked_intervals as closed-open [start, end) and so are
      candidate slots. Adjacent bookings (end == next_start) do not overlap.
    - All comparisons assume the booked_intervals are in the same timezone as
      the date/open/close times. Provide timezone-aware datetimes for production.
    """
    if duration_minutes <= 0:
        raise ValueError("duration_minutes must be > 0")
    if slot_interval_minutes <= 0:
        raise ValueError("slot_interval_minutes must be > 0")

    # Build naive datetimes for start and end bounds
    start_dt = datetime.datetime.combine(date, open_time)
    end_bound = datetime.datetime.combine(date, close_time)

    # Attach tzinfo if provided
    if tzinfo is not None:
        start_dt = start_dt.replace(tzinfo=tzinfo)
        end_bound = end_bound.replace(tzinfo=tzinfo)

    # Latest allowed start time so that (start + duration) <= close_time
    latest_start = end_bound - datetime.timedelta(minutes=duration_minutes)
    if latest_start < start_dt:
        # No slots fit in the opening window
        return []

    # Normalize bookings: only keep those that intersect the date window [start_dt, end_bound)
    filtered_bookings: List[Interval] = []
    for bstart, bend in booked_intervals:
        # Ensure tz alignment (if tzinfo provided assume booked datetimes are aligned already)
        if tzinfo is not None and bstart.tzinfo is None:
            bstart = bstart.replace(tzinfo=tzinfo)
        if tzinfo is not None and bend.tzinfo is None:
            bend = bend.replace(tzinfo=tzinfo)
        # If booking ends <= start_dt or starts >= end_bound, ignore
        if bend <= start_dt or bstart >= end_bound:
            continue
        # Clip booking to the day's window to avoid carrying multi-day bookings
        clipped_start = max(bstart, start_dt)
        clipped_end = min(bend, end_bound)
        filtered_bookings.append((clipped_start, clipped_end))

    merged_bookings = normalize_intervals(filtered_bookings)

    slots: List[DateTime] = []
    current = start_dt
    delta_step = datetime.timedelta(minutes=slot_interval_minutes)
    delta_duration = datetime.timedelta(minutes=duration_minutes)

    while current <= latest_start:
        candidate_end = current + delta_duration
        # Quick reject: if candidate_end > end_bound then break (shouldn't happen due to latest_start)
        if candidate_end > end_bound:
            break
        # Check overlaps vs merged bookings
        collision = False
        for bstart, bend in merged_bookings:
            if overlaps(current, candidate_end, bstart, bend):
                collision = True
                break
        if not collision:
            slots.append(current)
        current += delta_step

    return slots


# ----------------------- Unit tests (pure Python) -----------------------
import unittest


class TestBookingEngine(unittest.TestCase):
    def setUp(self):
        self.date = datetime.date(2025, 9, 20)
        self.open_time = datetime.time(9, 0)
        self.close_time = datetime.time(17, 0)

    def test_overlaps(self):
        a1 = datetime.datetime(2025, 9, 20, 9, 0)
        a2 = datetime.datetime(2025, 9, 20, 9, 30)
        b1 = datetime.datetime(2025, 9, 20, 9, 30)
        b2 = datetime.datetime(2025, 9, 20, 10, 0)
        # touching boundaries should not overlap
        self.assertFalse(overlaps(a1, a2, b1, b2))
        # overlapping
        self.assertTrue(overlaps(a1, datetime.datetime(2025, 9, 20, 9, 45), b1, b2))

    def test_generate_no_bookings(self):
        slots = generate_slots(
            date=self.date,
            open_time=self.open_time,
            close_time=self.close_time,
            duration_minutes=30,
            slot_interval_minutes=30,
            booked_intervals=[],
        )
        # From 9:00 to 17:00 with 30-min duration and 30-min interval => slots at 9:00..16:30 inclusive
        self.assertEqual(slots[0], datetime.datetime(2025, 9, 20, 9, 0))
        self.assertEqual(slots[-1], datetime.datetime(2025, 9, 20, 16, 30))
        self.assertEqual(len(slots), 16)

    def test_generate_with_bookings(self):
        booked = [
            (datetime.datetime(2025, 9, 20, 10, 0), datetime.datetime(2025, 9, 20, 10, 30)),
            (datetime.datetime(2025, 9, 20, 11, 0), datetime.datetime(2025, 9, 20, 12, 0)),
        ]
        slots = generate_slots(
            date=self.date,
            open_time=self.open_time,
            close_time=self.close_time,
            duration_minutes=30,
            slot_interval_minutes=30,
            booked_intervals=booked,
        )
        # Ensure no slot at 10:00 or 11:00
        self.assertNotIn(datetime.datetime(2025, 9, 20, 10, 0), slots)
        self.assertNotIn(datetime.datetime(2025, 9, 20, 11, 0), slots)

    def test_duration_longer_than_window(self):
        slots = generate_slots(
            date=self.date,
            open_time=datetime.time(9, 0),
            close_time=datetime.time(9, 15),
            duration_minutes=30,
            slot_interval_minutes=15,
            booked_intervals=[],
        )
        self.assertEqual(slots, [])

    def test_slot_interval_non_divisor(self):
        # duration 45, interval 30 -> candidate starts 9:00, 9:30, 10:00, ... latest_start = 16:15
        slots = generate_slots(
            date=self.date,
            open_time=self.open_time,
            close_time=self.close_time,
            duration_minutes=45,
            slot_interval_minutes=30,
            booked_intervals=[],
        )
        self.assertIn(datetime.datetime(2025, 9, 20, 9, 0), slots)
        self.assertIn(datetime.datetime(2025, 9, 20, 16, 0), slots)
        self.assertGreater(len(slots), 0)


# Ensure tests run correctly when executed directly
if __name__ in ("__main__", "utils.booking_engine"):
    unittest.main(argv=['first-arg-is-ignored'], verbosity=2, exit=False)
