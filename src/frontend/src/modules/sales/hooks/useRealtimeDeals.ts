/**
 * useRealtimeDeals Hook
 * 
 * Provides real-time subscription to deals/opportunities table
 * for live updates to the pipeline kanban board.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { Deal } from '../services/deals.api';

export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  deal: Deal | null;
  oldDeal?: Deal | null;
  timestamp: Date;
}

interface UseRealtimeDealsOptions {
  enabled?: boolean;
  onInsert?: (deal: Deal) => void;
  onUpdate?: (deal: Deal, oldDeal: Deal | null) => void;
  onDelete?: (deal: Deal) => void;
  onAnyChange?: () => void;
}

export function useRealtimeDeals(options: UseRealtimeDealsOptions = {}) {
  const {
    enabled = true,
    onInsert,
    onUpdate,
    onDelete,
    onAnyChange,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Transform Supabase record to Deal type
  const transformToDeal = useCallback((record: any): Deal | null => {
    if (!record) return null;
    
    return {
      id: record.id,
      title: record.title,
      stage: record.stage,
      dealValueCents: record.amount_cents || record.deal_value_cents || 0,
      winProbability: record.probability || record.win_probability || 0,
      expectedCloseDate: record.expected_close_date,
      serviceType: record.service_type,
      propertyType: record.property_type,
      tags: record.tags || [],
      status: record.status,
      ownerId: record.owner_id,
      contactId: record.contact_id,
      accountId: record.account_id,
      contact: record.contact ? {
        id: record.contact.id,
        firstName: record.contact.first_name,
        lastName: record.contact.last_name,
        email: record.contact.email,
        phone: record.contact.phone,
      } : undefined,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }, []);

  // Handle incoming realtime events
  const handleRealtimeEvent = useCallback(
    (payload: RealtimePostgresChangesPayload<any>) => {
      const eventType = payload.eventType;
      const newRecord = payload.new;
      const oldRecord = payload.old;

      console.log(`[Realtime] ${eventType} event received:`, { newRecord, oldRecord });

      const deal = transformToDeal(newRecord);
      const oldDeal = transformToDeal(oldRecord);

      const event: RealtimeEvent = {
        type: eventType as 'INSERT' | 'UPDATE' | 'DELETE',
        deal,
        oldDeal,
        timestamp: new Date(),
      };

      setLastEvent(event);

      // Call specific handlers
      switch (eventType) {
        case 'INSERT':
          if (deal && onInsert) {
            onInsert(deal);
          }
          break;
        case 'UPDATE':
          if (deal && onUpdate) {
            onUpdate(deal, oldDeal);
          }
          break;
        case 'DELETE':
          if (oldDeal && onDelete) {
            onDelete(oldDeal);
          }
          break;
      }

      // Call general change handler
      if (onAnyChange) {
        onAnyChange();
      }
    },
    [onInsert, onUpdate, onDelete, onAnyChange, transformToDeal]
  );

  // Set up the subscription
  useEffect(() => {
    if (!enabled) {
      // Clean up if disabled
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create the channel
    const channel = supabase
      .channel('deals-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunities',
        },
        handleRealtimeEvent
      )
      .subscribe((status) => {
        console.log('[Realtime] Subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        } else if (status === 'CHANNEL_ERROR') {
          setIsConnected(false);
          setError('Failed to connect to real-time updates');
        } else if (status === 'TIMED_OUT') {
          setIsConnected(false);
          setError('Connection timed out');
        } else if (status === 'CLOSED') {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        console.log('[Realtime] Unsubscribing from deals channel');
        channelRef.current.unsubscribe();
        channelRef.current = null;
        setIsConnected(false);
      }
    };
  }, [enabled, handleRealtimeEvent]);

  // Manual reconnect function
  const reconnect = useCallback(async () => {
    if (channelRef.current) {
      await channelRef.current.unsubscribe();
    }
    
    const channel = supabase
      .channel('deals-realtime-' + Date.now()) // Unique channel name for reconnect
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'opportunities',
        },
        handleRealtimeEvent
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setError(null);
        }
      });

    channelRef.current = channel;
  }, [handleRealtimeEvent]);

  return {
    isConnected,
    lastEvent,
    error,
    reconnect,
  };
}

export default useRealtimeDeals;

