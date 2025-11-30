# bookings/utils.py
from datetime import datetime, timedelta

def overlaps_any(booked_slots, start, end):
    for slot in booked_slots:
        if slot['start'] < end and slot['end'] > start:
            return True
    return False

def generate_slots(date, open_time, close_time, duration_minutes, slot_interval, booked_slots):
    slots = []
    current = datetime.combine(date, open_time)
    end = datetime.combine(date, close_time) - timedelta(minutes=duration_minutes)
    while current <= end:
        slot_end = current + timedelta(minutes=duration_minutes)
        if not overlaps_any(booked_slots, current.time(), slot_end.time()):
            slots.append(current.time())  # Yahan aap chaho to format kar sakte ho
        current += timedelta(minutes=slot_interval)
    return slots

def get_available_slots(provider, service, date):
    """
    Generates available booking slots for a given provider, service, and date.
    
    Args:
        provider (ServiceProvider): The provider object.
        service (Service): The service object.
        date (date): The date for which to check availability.
    
    Returns:
        list: A list of available slots in "HH:MM AM/PM" format.
    """
    # Example data extraction (adjust based on your models)
    open_time = provider.open_time  # provider ka open time (time object)
    close_time = provider.close_time  # provider ka close time (time object)
    duration_minutes = service.duration_minutes  # service ki duration
    slot_interval = service.slot_interval  # slot interval in minutes
    
    # Fetch booked slots for this provider on the given date
    # booked_slots should be a list of dicts with 'start' and 'end' time objects, e.g.:
    # [{'start': datetime.time(10,0), 'end': datetime.time(10,30)}, ...]
    booked_slots = []
    bookings = provider.bookings.filter(date=date)  # example query, adjust according to your models
    for booking in bookings:
        booked_slots.append({
            'start': booking.start_time,
            'end': booking.end_time
        })

    # Generate available slots
    available_slots = generate_slots(date, open_time, close_time, duration_minutes, slot_interval, booked_slots)

    # Format slots to AM/PM string
    formatted_slots = [slot.strftime("%I:%M %p") for slot in available_slots]

    return formatted_slots
