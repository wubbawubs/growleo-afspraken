import { onDocumentCreated, onDocumentUpdated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { CalendarEvent } from '../types/calendar';

export const onCalendarEventCreated = onDocumentCreated('calendar_events/{eventId}', async (event) => {
  const eventData = event.data?.data();
  if (!eventData) return;

  const calendarEvent: CalendarEvent = {
    id: event.params.eventId,
    ...eventData,
  } as CalendarEvent;

  // Handle calendar event creation
  console.log('Calendar event created:', calendarEvent.id);
});

export const onCalendarEventUpdated = onDocumentUpdated('calendar_events/{eventId}', async (event) => {
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();
  if (!beforeData || !afterData) return;

  const calendarEvent: CalendarEvent = {
    id: event.params.eventId,
    ...afterData,
  } as CalendarEvent;

  // Handle calendar event update
  console.log('Calendar event updated:', calendarEvent.id);
});

export const onCalendarEventDeleted = onDocumentDeleted('calendar_events/{eventId}', async (event) => {
  const eventData = event.data?.data();
  if (!eventData) return;

  const calendarEvent: CalendarEvent = {
    id: event.params.eventId,
    ...eventData,
  } as CalendarEvent;

  // Handle calendar event deletion
  console.log('Calendar event deleted:', calendarEvent.id);
}); 