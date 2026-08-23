'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createBrowserSupabaseClient } from '../supabase/browserClient';
import type { OrderStatusEvent, DriverLocation, OrderStatus } from '../domain/types';

/**
 * Hook to subscribe to real-time order status updates via Supabase Realtime.
 * Returns the current status, status event timeline, and driver location.
 */
export function useOrderTracking(orderId: string | null) {
  const [status, setStatus] = useState<OrderStatus | null>(null);
  const [events, setEvents] = useState<OrderStatusEvent[]>([]);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [connected, setConnected] = useState(false);
  const channelRef = useRef<ReturnType<NonNullable<ReturnType<typeof createBrowserSupabaseClient>>['channel']> | null>(null);

  useEffect(() => {
    if (!orderId) return;

    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    setConnected(true);

    // Fetch initial status events
    supabase
      .from('order_status_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) {
          const mapped = data.map(mapStatusEvent);
          setEvents(mapped);
          if (mapped.length > 0) {
            setStatus(mapped[mapped.length - 1].status);
          }
        }
      });

    // Fetch driver location
    supabase
      .from('deliveries')
      .select('driver_latitude, driver_longitude, driver_name, driver_phone, updated_at')
      .eq('order_id', orderId)
      .single()
      .then(({ data }) => {
        if (data && data.driver_latitude && data.driver_longitude) {
          setDriverLocation({
            latitude: data.driver_latitude,
            longitude: data.driver_longitude,
            driverName: data.driver_name,
            driverPhone: data.driver_phone,
            updatedAt: data.updated_at,
          });
        }
      });

    // Subscribe to real-time updates on order status events
    const orderChannel = supabase
      .channel(`order-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'order_status_events',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const event = mapStatusEvent(payload.new as Record<string, unknown>);
          setEvents((prev) => [...prev, event]);
          setStatus(event.status);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown>;
          const newStatus = (newRow.status as string).toLowerCase() as OrderStatus;
          setStatus(newStatus);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'deliveries',
          filter: `order_id=eq.${orderId}`,
        },
        (payload) => {
          const newRow = payload.new as Record<string, unknown>;
          if (newRow.driver_latitude && newRow.driver_longitude) {
            setDriverLocation({
              latitude: newRow.driver_latitude as number,
              longitude: newRow.driver_longitude as number,
              driverName: newRow.driver_name as string | null,
              driverPhone: newRow.driver_phone as string | null,
              updatedAt: newRow.updated_at as string,
            });
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setConnected(true);
        } else if (status === 'CHANNEL_ERROR') {
          setConnected(false);
        }
      });

    channelRef.current = orderChannel;

    return () => {
      supabase.removeChannel(orderChannel);
      setConnected(false);
    };
  }, [orderId]);

  const refresh = useCallback(async () => {
    if (!orderId) return;
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const [{ data: eventsData }, { data: deliveryData }] = await Promise.all([
      supabase
        .from('order_status_events')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true }),
      supabase
        .from('deliveries')
        .select('driver_latitude, driver_longitude, driver_name, driver_phone, updated_at')
        .eq('order_id', orderId)
        .single(),
    ]);

    if (eventsData) {
      const mapped = eventsData.map(mapStatusEvent);
      setEvents(mapped);
      if (mapped.length > 0) setStatus(mapped[mapped.length - 1].status);
    }

    if (deliveryData && deliveryData.driver_latitude && deliveryData.driver_longitude) {
      setDriverLocation({
        latitude: deliveryData.driver_latitude,
        longitude: deliveryData.driver_longitude,
        driverName: deliveryData.driver_name,
        driverPhone: deliveryData.driver_phone,
        updatedAt: deliveryData.updated_at,
      });
    }
  }, [orderId]);

  return { status, events, driverLocation, connected, refresh };
}

function mapStatusEvent(row: Record<string, unknown>): OrderStatusEvent {
  return {
    id: String(row.id),
    orderId: String(row.order_id),
    status: (row.status as string).toLowerCase() as OrderStatus,
    previousStatus: row.previous_status ? (row.previous_status as string).toLowerCase() as OrderStatus : null,
    changedByName: row.changed_by_name as string | null,
    latitude: row.latitude as number | null,
    longitude: row.longitude as number | null,
    note: row.note as string | null,
    createdAt: String(row.created_at),
  };
}
