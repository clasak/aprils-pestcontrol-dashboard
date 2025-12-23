# Feature Specifications - April's Pest Control Dashboard

**Version**: 1.0 MVP
**Last Updated**: December 22, 2025

---

## Table of Contents

1. [Pipeline Visualization](#1-pipeline-visualization)
2. [Route Optimization Algorithm](#2-route-optimization-algorithm)
3. [Recurring Service Automation](#3-recurring-service-automation)
4. [Mobile Offline Sync Strategy](#4-mobile-offline-sync-strategy)
5. [Lead Scoring Criteria](#5-lead-scoring-criteria)

---

## 1. Pipeline Visualization

### Overview

Interactive Kanban-style board for visualizing sales pipeline with drag-and-drop deal management, real-time updates, and customizable stages.

### Business Requirements

**Goal**: Provide sales reps and managers with clear visibility into deal status and pipeline health

**Success Metrics**:
- 100% deal visibility (all deals tracked in pipeline)
- <2s pipeline load time for 500 deals
- >80% user adoption (reps use daily)
- Forecast accuracy >70% within 20%

### Functional Specifications

#### 1.1 Pipeline Stages

**Default Stages** (Customizable in Phase 2):

| Stage | Description | Probability | Avg Duration | Actions Available |
|-------|-------------|-------------|--------------|-------------------|
| Lead | Initial inquiry, not qualified | 10% | 1-2 days | Qualify, Schedule Inspection |
| Inspection Scheduled | Appointment booked | 25% | 2-5 days | Complete Inspection |
| Quote Sent | Proposal delivered | 50% | 3-7 days | Follow Up, Revise Quote |
| Negotiation | Active discussion on terms | 75% | 2-5 days | Accept, Revise, Discount |
| Won | Deal closed, customer onboarded | 100% | N/A | Schedule Service |
| Lost | Deal lost to competitor or declined | 0% | N/A | Log Reason |

**Stage Transitions**:
- Linear progression: Lead → Inspection → Quote → Negotiation → Won
- Can skip stages (e.g., Lead → Quote if no inspection needed)
- Cannot move backward (regression indicates problem)
- Lost deals can be revived (create new deal)

#### 1.2 Deal Card Design

**Card Layout** (Compact View):
```
┌─────────────────────────────────┐
│ [$8,500] ABC Commercial         │ ← Value + Customer Name
│ 🏢 Office Pest Control           │ ← Service Type Icon
│ 📅 Close: Jan 15 (5 days)        │ ← Close Date (relative)
│ 👤 Sarah                         │ ← Assigned Rep
│ ⚠️ Overdue                       │ ← Status Badge (if at-risk)
└─────────────────────────────────┘
```

**Card Data**:
- **Deal Value**: $1,000 - $50,000+ (bold, prominent)
- **Customer Name**: Company or person name
- **Service Type**: Icon + label (residential, commercial, termite, etc.)
- **Close Date**: Target close date with days remaining
- **Assigned Rep**: Avatar or initials
- **Status Indicator**:
  - 🟢 On Track (activity within 3 days)
  - 🟡 At Risk (no activity 4-7 days)
  - 🔴 Overdue (past close date)
  - ⏸️ Stalled (no activity >7 days)

**Card Actions** (Click or Hover):
- Drag-and-drop to move stages
- Click to expand deal details (modal)
- Quick actions menu (edit, delete, add note, assign)
- Pin to top (priority deals)

#### 1.3 Drag-and-Drop Functionality

**User Interaction**:
1. User clicks and holds deal card
2. Card lifts with shadow effect (visual feedback)
3. User drags card to target stage column
4. Drop zones highlight (green border)
5. User releases card
6. Card animates into position
7. System updates deal stage (API call)
8. Real-time update to other users viewing pipeline

**Technical Implementation**:
- Library: `react-beautiful-dnd` or `dnd-kit`
- Drag handle: Entire card is draggable
- Drop zones: Stage columns
- Optimistic UI: Update immediately, rollback on error
- Conflict resolution: Last write wins

**Validation**:
- Cannot drag Won/Lost deals to other stages (frozen)
- Warning if moving deal backward (e.g., Quote → Lead)
- Confirmation modal for stage changes >1 stage skip

**Performance**:
- Drag response: <50ms
- API update: <200ms
- Re-render: <100ms

#### 1.4 Filtering and Sorting

**Filter Options**:

| Filter | Options | Default |
|--------|---------|---------|
| Assigned To | All, Me, Team Member Name | All |
| Service Type | All, Residential, Commercial, Termite, Bed Bug, Rodent | All |
| Value Range | All, <$1k, $1k-$5k, $5k-$10k, >$10k | All |
| Close Date | All, This Week, This Month, Overdue | All |
| Status | All, On Track, At Risk, Stalled, Overdue | All |
| Lead Source | All, Website, Referral, Google, Partner | All |

**Sort Options**:

| Sort By | Order | Use Case |
|---------|-------|----------|
| Value | High to Low | Focus on biggest deals |
| Close Date | Soonest First | Prioritize urgent deals |
| Last Activity | Most Recent | Identify stale deals |
| Probability | High to Low | Focus on likely wins |
| Created Date | Newest First | Review new leads |

**Filter Persistence**:
- Saved per user in local storage
- "Reset Filters" button
- Filter presets (e.g., "My High-Value Deals")

#### 1.5 Deal Detail View

**Modal Layout** (Click deal card to open):

**Header**:
- Customer name + company (if applicable)
- Deal value (editable)
- Current stage (dropdown to change)
- Close date (date picker)
- Probability % (auto or manual)
- Assigned rep (dropdown)

**Tabs**:

**1. Overview Tab**:
- Contact information (phone, email, address)
- Service type and details
- Property size and pest type
- Lead source
- Created date
- Last activity date
- Custom fields (Phase 2)

**2. Activity Tab** (Timeline):
- Chronological list of all activities:
  - ✉️ Email sent (timestamp, subject)
  - 📞 Call logged (timestamp, outcome, notes)
  - 📝 Note added (timestamp, text)
  - 📄 Quote sent (timestamp, value, status)
  - 📅 Meeting scheduled (timestamp, location)
  - 🔄 Stage changed (timestamp, from → to)
- "Log Activity" button (call, email, note, meeting)
- Filter by activity type

**3. Quote Tab**:
- All quotes for this deal (version history)
- Quote status (Draft, Sent, Viewed, Accepted, Rejected, Expired)
- "Create New Quote" button
- View/edit/send quote

**4. Files Tab** (Phase 2):
- Attachments (photos, inspection reports, contracts)
- Upload button

**Quick Actions** (Footer buttons):
- Send Email
- Log Call
- Create Quote
- Schedule Meeting
- Add Note
- Mark Won
- Mark Lost

#### 1.6 Pipeline Summary Metrics

**Above Pipeline Board** (Dashboard-style cards):

**Total Pipeline Value**:
- Sum of all deals in pipeline (excluding Won/Lost)
- Example: $87,500

**Weighted Pipeline Value**:
- Sum of (deal value × stage probability)
- Example: $52,500 (realistic forecast)

**Deal Count by Stage**:
- Lead: 17 ($42,500)
- Inspection: 8 ($19,000)
- Quote Sent: 12 ($28,750)
- Negotiation: 5 ($18,500)

**Conversion Metrics**:
- Overall win rate: 62%
- Average deal size: $3,200
- Average sales cycle: 16 days

**At-Risk Deals**:
- Count of deals overdue or stalled
- Total value at risk
- Click to filter pipeline to at-risk only

#### 1.7 Real-Time Collaboration

**Multi-User Updates**:
- WebSocket connection to server
- Real-time deal updates when other users make changes
- Visual indicator when deal is being edited by another user
- Conflict resolution:
  - If two users edit same deal simultaneously:
    - Show notification: "Sarah is editing this deal"
    - Allow both to save (last write wins)
    - Option to refresh and see latest changes

**Activity Feed** (Sidebar):
- Live feed of pipeline activity:
  - "Sarah moved ABC Commercial to Quote Sent"
  - "Mike won a $4,200 deal!"
  - "Lisa created a new lead: Johnson Residence"
- Filter by team member
- Celebrate wins (confetti animation 🎉)

#### 1.8 Mobile View

**Responsive Design**:
- Desktop: Multi-column Kanban (all stages visible)
- Tablet: 2-3 columns, scroll horizontally
- Mobile: Single column, tabs for each stage

**Mobile Optimizations**:
- Card height: Compact (3-4 lines)
- Tap to expand details
- Swipe actions (swipe right = move to next stage)
- Bottom nav for quick filters
- Thumb-friendly touch targets (min 44x44px)

### Technical Specifications

#### 1.9 Frontend Architecture

**Component Hierarchy**:
```
PipelineBoard
├── PipelineFilters (filters, sort, search)
├── PipelineSummary (metrics cards)
├── PipelineColumns (Kanban columns)
│   ├── StageColumn (one per stage)
│   │   ├── StageHeader (title, count, value)
│   │   ├── DealCard (individual deal)
│   │   │   └── DealCardMenu (quick actions)
│   │   └── AddDealButton
│   └── DragDropContext (react-beautiful-dnd)
├── DealDetailModal (deal details)
│   ├── DealHeader
│   ├── DealTabs (Overview, Activity, Quote, Files)
│   └── QuickActions
└── ActivityFeed (real-time updates)
```

**State Management**:
- **Redux Store** (or Zustand):
  - `deals`: Array of all deals
  - `stages`: Array of stage definitions
  - `filters`: Current filter state
  - `sort`: Current sort option
  - `selectedDeal`: Deal ID for detail view
  - `activityFeed`: Recent activities
- **WebSocket**: Real-time updates from server
- **Local Storage**: Persist filters and preferences

**API Endpoints**:

```
GET /api/v1/deals
  Query: ?stage=quote&assignedTo=user123&sort=value&order=desc
  Response: { deals: [...], total: 45, summary: {...} }

GET /api/v1/deals/:id
  Response: { id, customerId, value, stage, probability, ... }

POST /api/v1/deals
  Body: { customerId, value, stage, closeDate, ... }
  Response: { id, ... }

PATCH /api/v1/deals/:id
  Body: { stage: "quote_sent", probability: 50 }
  Response: { id, ... }

DELETE /api/v1/deals/:id
  Response: { success: true }

GET /api/v1/deals/:id/activities
  Response: { activities: [...] }

POST /api/v1/deals/:id/activities
  Body: { type: "call", notes: "...", timestamp: "..." }
  Response: { id, ... }
```

**WebSocket Events**:

```javascript
// Client subscribes to pipeline updates
socket.emit('subscribe', { room: 'pipeline' });

// Server broadcasts deal updates
socket.on('deal:updated', (dealId, updates) => {
  // Update Redux store with new deal data
});

socket.on('deal:created', (deal) => {
  // Add new deal to pipeline
});

socket.on('deal:deleted', (dealId) => {
  // Remove deal from pipeline
});
```

#### 1.10 Database Schema

```sql
-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  stage VARCHAR(50) NOT NULL DEFAULT 'lead',
  value DECIMAL(10,2) NOT NULL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100),
  close_date DATE,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  service_type VARCHAR(50),
  pest_type VARCHAR(50),
  property_size INTEGER,
  lead_source VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active', -- active, won, lost
  lost_reason TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);

-- Indexes for performance
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deals_assigned_to ON deals(assigned_to);
CREATE INDEX idx_deals_close_date ON deals(close_date);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deals_value ON deals(value DESC);

-- Deal activities table (timeline)
CREATE TABLE deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  type VARCHAR(50) NOT NULL, -- call, email, note, meeting, stage_change, quote_sent
  description TEXT,
  metadata JSONB, -- { emailSubject, callDuration, oldStage, newStage, etc. }
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_timestamp ON deal_activities(timestamp DESC);
```

#### 1.11 Performance Optimizations

**Loading Strategy**:
- Initial load: Fetch deals for current stage + adjacent stages (lazy load others)
- Pagination: 100 deals per stage (load more on scroll)
- Virtual scrolling: Only render visible cards (react-window)
- Debounced search: Wait 300ms after typing before filtering

**Caching**:
- Redis cache for frequently accessed pipelines
- Cache TTL: 5 minutes
- Invalidate cache on deal update (specific user or global)

**Optimistic UI Updates**:
- Update UI immediately on drag-drop (don't wait for API)
- Show loading spinner on card
- Rollback if API call fails (with error message)

**Real-Time Update Strategy**:
- Throttle WebSocket updates to max 1 per second per deal
- Batch multiple updates if rapid changes
- Debounce activity feed (group rapid changes)

### User Experience Specifications

#### 1.12 Visual Design

**Color-Coded Stages**:
- Lead: Light blue (#E3F2FD)
- Inspection: Light green (#E8F5E9)
- Quote Sent: Light yellow (#FFF9C4)
- Negotiation: Light orange (#FFE0B2)
- Won: Green (#4CAF50)
- Lost: Red (#F44336)

**Deal Card States**:
- Default: White background, subtle border
- Hover: Slight shadow, lift effect
- Dragging: Strong shadow, opacity 0.8
- Selected: Blue border, highlight
- At-Risk: Red left border (4px)
- Pinned: Star icon, always at top

**Animations**:
- Card drag: Smooth follow cursor
- Stage transition: Slide animation (300ms ease-out)
- Won deal: Confetti animation (celebrate-react)
- New deal: Fade in from top

#### 1.13 Accessibility

**Keyboard Navigation**:
- Tab: Navigate between cards
- Enter: Open deal detail
- Arrow keys: Move between stages (with Shift)
- Esc: Close detail modal
- Space: Select/deselect card

**Screen Reader Support**:
- ARIA labels for drag-drop
- Announce stage changes: "Deal moved to Quote Sent stage"
- Card labels: "Deal: ABC Commercial, value $8,500, close date January 15"

**Color Contrast**:
- WCAG AA compliance (4.5:1 text contrast)
- Status indicators use icons + color (not color alone)

### Testing Requirements

#### 1.14 Unit Tests

- Deal card rendering (all data fields display correctly)
- Drag-drop logic (stage transitions)
- Filter and sort functions
- Deal detail modal (tabs, forms, validation)
- Real-time update handlers (WebSocket events)

**Coverage Target**: >80%

#### 1.15 Integration Tests

- API calls (GET, POST, PATCH, DELETE deals)
- WebSocket connection and events
- Redux state updates
- Optimistic UI with rollback on error

#### 1.16 E2E Tests (Cypress)

**Test Scenarios**:
1. Load pipeline board, verify all stages display
2. Drag deal from Lead to Inspection, verify stage updates
3. Open deal detail, edit value, save, verify update
4. Filter by assigned rep, verify only matching deals show
5. Create new deal, verify appears in pipeline
6. Mark deal as Won, verify moves to Won stage and triggers celebration

**Target**: 100% coverage of critical user paths

---

## 2. Route Optimization Algorithm

### Overview

Automated route planning algorithm that minimizes technician drive time while respecting customer time windows, service durations, and technician availability.

### Business Requirements

**Goal**: Reduce drive time by 20-40%, saving fuel costs and increasing technician productivity

**Success Metrics**:
- Drive time reduction >20% vs manual planning
- Route planning time <30 minutes (vs 120 minutes manual)
- On-time arrival rate >85% (within 30-min window)
- Fuel cost savings >$10,000/year (for 5 technicians)

### MVP Approach: Geographic Clustering

**Justification for Basic Algorithm**:
- Full-featured routing (traveling salesman, traffic integration) is complex (2-3 weeks dev time)
- MVP timeline is 3 months (need quick wins)
- Basic clustering delivers 15-25% improvement (good enough for MVP)
- Phase 2: Advanced algorithm with traffic, historical data, machine learning

**MVP Algorithm**: Geographic clustering with nearest-neighbor sequencing

### Functional Specifications

#### 2.1 Algorithm Overview

**Input**:
- List of appointments for a specific date and technician
- Each appointment includes:
  - Customer address (lat/lng via geocoding)
  - Time window (e.g., 9-11am, or flexible)
  - Service duration estimate (minutes)
  - Priority (emergency > recurring > one-time)

**Output**:
- Optimized sequence of appointments
- Estimated drive time between each stop
- Estimated arrival time for each appointment
- Total route metrics (drive time, work time, end time)

**Constraints**:
- Technician shift hours (8am-5pm)
- Customer time windows (must arrive within window)
- Lunch break (12-12:30pm, flexible location)
- Service durations (cannot overlap)
- Travel time between locations (Google Maps API)

**Optimization Goal**: Minimize total drive time

#### 2.2 Algorithm Steps (MVP)

**Step 1: Geocoding** (Pre-processing)
- Convert all customer addresses to lat/lng coordinates
- Use Google Maps Geocoding API
- Cache geocoded addresses (don't re-geocode same address)
- Fallback: If geocoding fails, use ZIP code centroid

**Step 2: Priority Sorting**
- Group appointments by priority:
  - P0: Emergency (must be first or specific time)
  - P1: Fixed time window (9-11am, 1-3pm)
  - P2: Flexible (anytime during shift)
- Sort within each group by time window start time

**Step 3: Geographic Clustering**
- Use K-means clustering (or DBSCAN) to group appointments by location
- Number of clusters = Total appointments / 4 (max ~4 appointments per cluster)
- Cluster centers = Geographic midpoints
- Result: Appointments grouped by area (North, South, East, West)

**Step 4: Intra-Cluster Sequencing**
- Within each cluster, use nearest-neighbor algorithm:
  - Start with earliest time window appointment
  - Next appointment = Closest unvisited appointment
  - Repeat until cluster complete
- Calculate drive time between each pair (Google Maps Distance Matrix API)

**Step 5: Inter-Cluster Sequencing**
- Sequence clusters to minimize travel between clusters:
  - Start with cluster closest to technician's home/office (start location)
  - Next cluster = Closest to last appointment in current cluster
  - Repeat until all clusters visited
- Insert lunch break:
  - Identify midpoint of day (around 12pm)
  - Insert 30-min break before appointment closest to noon

**Step 6: Time Validation**
- Simulate route start to finish:
  - Start time: 8:00 AM
  - For each appointment:
    - Add drive time from previous location
    - Add service duration
    - Check: Arrival within time window? (if not, flag warning)
  - Add lunch break
  - Calculate end time
- If any appointments violate time windows:
  - Swap adjacent appointments
  - Re-run validation
  - If still invalid, flag for dispatcher manual review

**Step 7: Output Results**
- Return optimized sequence with:
  - Appointment order (1, 2, 3, ...)
  - Estimated arrival time for each
  - Drive time between each pair
  - Total drive time (sum)
  - Total work time (service duration sum)
  - Estimated end time
- Compare to current sequence:
  - Current drive time: 120 minutes
  - Optimized drive time: 85 minutes
  - Savings: 35 minutes (29% reduction)

#### 2.3 Technical Implementation (MVP)

**Geocoding** (One-time per address):
```javascript
async function geocodeAddress(address) {
  // Check cache first
  const cached = await redis.get(`geocode:${address}`);
  if (cached) return JSON.parse(cached);

  // Call Google Maps Geocoding API
  const response = await googleMaps.geocode({ address });
  const { lat, lng } = response.results[0].geometry.location;

  // Cache for 1 year (addresses don't change)
  await redis.set(`geocode:${address}`, JSON.stringify({ lat, lng }), 'EX', 31536000);

  return { lat, lng };
}
```

**K-Means Clustering**:
```javascript
function clusterAppointments(appointments, numClusters) {
  const points = appointments.map(a => [a.lat, a.lng]);

  // Use kmeans library (npm: ml-kmeans)
  const clusters = kmeans(points, numClusters);

  // Group appointments by cluster
  return clusters.clusters.map((clusterIdx, i) => {
    return appointments[i];
  }).reduce((acc, appt, i) => {
    const clusterIdx = clusters.clusters[i];
    acc[clusterIdx] = acc[clusterIdx] || [];
    acc[clusterIdx].push(appt);
    return acc;
  }, {});
}
```

**Nearest-Neighbor Sequencing**:
```javascript
function nearestNeighborRoute(appointments, startLocation) {
  const route = [];
  const unvisited = [...appointments];
  let current = startLocation;

  while (unvisited.length > 0) {
    // Find nearest unvisited appointment
    let nearest = null;
    let minDistance = Infinity;

    for (const appt of unvisited) {
      const distance = haversineDistance(current, { lat: appt.lat, lng: appt.lng });
      if (distance < minDistance) {
        minDistance = distance;
        nearest = appt;
      }
    }

    route.push(nearest);
    current = { lat: nearest.lat, lng: nearest.lng };
    unvisited.splice(unvisited.indexOf(nearest), 1);
  }

  return route;
}

function haversineDistance(point1, point2) {
  // Calculate great-circle distance between two lat/lng points
  const R = 6371; // Earth radius in km
  const dLat = (point2.lat - point1.lat) * Math.PI / 180;
  const dLng = (point2.lng - point1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(point1.lat * Math.PI / 180) * Math.cos(point2.lat * Math.PI / 180) *
            Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in km
}
```

**Drive Time Calculation** (Google Maps Distance Matrix API):
```javascript
async function calculateDriveTimes(route) {
  // Build origin-destination pairs
  const origins = route.slice(0, -1).map(a => `${a.lat},${a.lng}`);
  const destinations = route.slice(1).map(a => `${a.lat},${a.lng}`);

  // Call Google Maps Distance Matrix API (batch request)
  const response = await googleMaps.distanceMatrix({
    origins,
    destinations,
    mode: 'driving',
    departure_time: 'now', // Use current traffic (MVP: no future traffic)
  });

  // Extract drive times (in seconds)
  const driveTimes = response.rows.map((row, i) => row.elements[i].duration.value);

  return driveTimes.map(seconds => Math.round(seconds / 60)); // Convert to minutes
}
```

**Complete Optimization Function**:
```javascript
async function optimizeRoute(technician, date) {
  // Step 1: Fetch appointments for technician and date
  const appointments = await db.query(`
    SELECT id, customer_id, address, lat, lng, time_window_start, time_window_end, service_duration, priority
    FROM appointments
    WHERE technician_id = $1 AND date = $2 AND status = 'scheduled'
    ORDER BY time_window_start ASC
  `, [technician.id, date]);

  // Step 2: Geocode addresses (if not already cached)
  for (const appt of appointments) {
    if (!appt.lat || !appt.lng) {
      const coords = await geocodeAddress(appt.address);
      appt.lat = coords.lat;
      appt.lng = coords.lng;
    }
  }

  // Step 3: Sort by priority and time windows
  const priority0 = appointments.filter(a => a.priority === 0); // Emergency
  const priority1 = appointments.filter(a => a.priority === 1); // Fixed window
  const priority2 = appointments.filter(a => a.priority === 2); // Flexible

  // Step 4: Cluster flexible appointments by geography
  const numClusters = Math.ceil(priority2.length / 4);
  const clusters = clusterAppointments(priority2, numClusters);

  // Step 5: Sequence within each cluster (nearest-neighbor)
  const sequencedClusters = clusters.map(cluster => {
    return nearestNeighborRoute(cluster, { lat: technician.home_lat, lng: technician.home_lng });
  });

  // Step 6: Sequence clusters (nearest-neighbor)
  const route = [
    ...priority0, // Emergency first
    ...priority1, // Fixed windows next (sorted by time)
    ...sequencedClusters.flat(), // Flexible appointments (clustered & sequenced)
  ];

  // Step 7: Calculate drive times
  const driveTimes = await calculateDriveTimes(route);

  // Step 8: Validate time windows and calculate arrival times
  let currentTime = new Date(`${date}T08:00:00`); // Start at 8am
  const schedule = route.map((appt, i) => {
    // Add drive time from previous location
    if (i > 0) {
      currentTime = new Date(currentTime.getTime() + driveTimes[i-1] * 60000);
    }

    const arrivalTime = new Date(currentTime);

    // Check time window violation
    const windowStart = appt.time_window_start ? new Date(`${date}T${appt.time_window_start}`) : null;
    const windowEnd = appt.time_window_end ? new Date(`${date}T${appt.time_window_end}`) : null;
    const withinWindow = !windowStart || (arrivalTime >= windowStart && arrivalTime <= windowEnd);

    // Add service duration
    currentTime = new Date(currentTime.getTime() + appt.service_duration * 60000);

    return {
      appointmentId: appt.id,
      sequence: i + 1,
      arrivalTime: arrivalTime.toISOString(),
      driveTimeFromPrevious: i > 0 ? driveTimes[i-1] : 0,
      serviceDuration: appt.service_duration,
      withinTimeWindow: withinWindow,
      warning: !withinWindow ? 'Arrival outside time window' : null,
    };
  });

  // Insert lunch break (around noon)
  const noonIndex = schedule.findIndex(s => new Date(s.arrivalTime).getHours() >= 12);
  if (noonIndex > 0) {
    schedule.splice(noonIndex, 0, {
      type: 'break',
      sequence: noonIndex + 0.5,
      startTime: schedule[noonIndex - 1].arrivalTime,
      duration: 30,
    });
  }

  // Step 9: Calculate metrics
  const totalDriveTime = driveTimes.reduce((sum, time) => sum + time, 0);
  const totalServiceTime = appointments.reduce((sum, a) => sum + a.service_duration, 0);
  const endTime = new Date(currentTime.getTime() + 30 * 60000); // Add lunch

  return {
    schedule,
    metrics: {
      totalAppointments: appointments.length,
      totalDriveTime, // minutes
      totalServiceTime, // minutes
      totalWorkTime: totalDriveTime + totalServiceTime + 30, // include lunch
      endTime: endTime.toISOString(),
      warnings: schedule.filter(s => s.warning).length,
    },
  };
}
```

#### 2.4 API Endpoint

```javascript
// POST /api/v1/routes/optimize
router.post('/routes/optimize', async (req, res) => {
  const { technicianId, date } = req.body;

  // Validate inputs
  if (!technicianId || !date) {
    return res.status(400).json({ error: 'technicianId and date required' });
  }

  // Fetch technician
  const technician = await db.query('SELECT * FROM users WHERE id = $1', [technicianId]);
  if (!technician) {
    return res.status(404).json({ error: 'Technician not found' });
  }

  // Run optimization
  const result = await optimizeRoute(technician, date);

  // Return optimized route
  res.json({
    technicianId,
    date,
    optimized: true,
    schedule: result.schedule,
    metrics: result.metrics,
  });
});
```

#### 2.5 Database Updates

After optimization approved by dispatcher:
```javascript
// Update appointment sequences in database
async function applyOptimizedRoute(schedule) {
  const transaction = await db.beginTransaction();

  try {
    for (const item of schedule) {
      if (item.type === 'break') continue;

      await db.query(`
        UPDATE appointments
        SET sequence = $1, estimated_arrival = $2, estimated_drive_time = $3
        WHERE id = $4
      `, [item.sequence, item.arrivalTime, item.driveTimeFromPrevious, item.appointmentId]);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

### Phase 2 Enhancements

**Advanced Routing**:
- Traveling Salesman Problem (TSP) solver (OR-Tools)
- Real-time traffic integration (Google Maps Traffic API)
- Historical traffic patterns (predict rush hour delays)
- Multi-technician optimization (balance workload across team)
- Dynamic re-routing (adjust for delays, cancellations, emergencies)

**Machine Learning**:
- Predict service durations (based on historical data per pest type, property size)
- Predict traffic delays (time of day, day of week, weather)
- Recommend optimal appointment times (maximize on-time arrivals)

**Customer Preferences**:
- Same technician preference (route continuity)
- Preferred time windows (learn from customer history)
- Avoid certain times (customer unavailable)

### Testing Requirements

#### 2.6 Unit Tests

- Geocoding function (mocked API responses)
- Haversine distance calculation (known lat/lng pairs)
- K-means clustering (verify grouping logic)
- Nearest-neighbor sequencing (verify order)
- Time window validation (edge cases)

#### 2.7 Integration Tests

- Google Maps API calls (geocoding, distance matrix)
- Database queries (appointments, technicians)
- Route optimization end-to-end (sample data)

#### 2.8 Performance Tests

- Optimize 50 appointments in <10 seconds
- Handle 10 concurrent optimization requests
- Cache hit rate >80% for geocoding

---

## 3. Recurring Service Automation

### Overview

Automated system for creating, managing, and executing recurring service appointments with minimal manual intervention.

### Business Requirements

**Goal**: Automate 70-80% of appointment scheduling (recurring services are the primary revenue source)

**Success Metrics**:
- >60% of customers on recurring plans
- <3% no-show rate for recurring appointments
- >95% automated reminder delivery
- Zero missed recurring appointments due to system failure

### Functional Specifications

#### 3.1 Recurring Service Setup

**User Input** (Dispatcher or Sales Rep):
- Customer ID
- Service type (general pest, termite annual, rodent monthly, etc.)
- Frequency:
  - Weekly (rare)
  - Bi-weekly
  - Monthly (most common)
  - Quarterly
  - Annual
- Start date (first service date)
- End date (optional: contract expiration, or ongoing indefinitely)
- Preferred day of week (e.g., "First Tuesday of month")
- Preferred time window (Morning 9-12, Afternoon 1-5, Flexible)
- Preferred technician (optional)
- Auto-schedule window (default: 8 weeks ahead)

**System Processing**:
1. Validate inputs (frequency valid for service type)
2. Calculate next 12 service dates based on frequency
3. Create recurring series record (master record)
4. Generate initial appointments (next 8 weeks)
5. Assign technician (preferred or territory default)
6. Send confirmation email to customer

#### 3.2 Appointment Generation Logic

**Algorithm**:

**For Monthly Frequency**:
```javascript
function generateMonthlyAppointments(series) {
  const appointments = [];
  let currentDate = new Date(series.startDate);
  const endDate = series.endDate ? new Date(series.endDate) : null;
  const autoScheduleWeeks = series.autoScheduleWindow || 8;
  const cutoffDate = addWeeks(new Date(), autoScheduleWeeks);

  while (currentDate <= cutoffDate && (!endDate || currentDate <= endDate)) {
    // Adjust to preferred day of week
    if (series.preferredDayOfWeek) {
      currentDate = getFirstDayOfWeekInMonth(currentDate, series.preferredDayOfWeek);
    }

    // Skip holidays
    if (isHoliday(currentDate)) {
      currentDate = getNextBusinessDay(currentDate);
    }

    // Create appointment
    appointments.push({
      customerId: series.customerId,
      serviceType: series.serviceType,
      date: currentDate,
      timeWindow: series.preferredTimeWindow,
      technicianId: series.preferredTechnicianId,
      recurringSeriesId: series.id,
      status: 'scheduled',
    });

    // Advance to next month
    currentDate = addMonths(currentDate, 1);
  }

  return appointments;
}

function getFirstDayOfWeekInMonth(date, dayOfWeek) {
  // dayOfWeek: 0=Sunday, 1=Monday, 2=Tuesday, etc.
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstDayOfWeek = firstOfMonth.getDay();
  const daysToAdd = (dayOfWeek - firstDayOfWeek + 7) % 7;
  return new Date(firstOfMonth.getTime() + daysToAdd * 86400000);
}
```

**For Quarterly Frequency**:
```javascript
function generateQuarterlyAppointments(series) {
  // Similar to monthly, but advance by 3 months (12 weeks)
  currentDate = addMonths(currentDate, 3);
}
```

**For Annual Frequency**:
```javascript
function generateAnnualAppointments(series) {
  // Advance by 12 months (52 weeks)
  currentDate = addYears(currentDate, 1);
}
```

#### 3.3 Rolling Window Auto-Generation

**Cron Job** (Runs Daily at 2:00 AM):
```javascript
// Daily job: Generate new appointments to maintain 8-week rolling window
async function autoGenerateRecurringAppointments() {
  // Fetch all active recurring series
  const series = await db.query(`
    SELECT * FROM recurring_series
    WHERE status = 'active' AND (end_date IS NULL OR end_date >= CURRENT_DATE)
  `);

  for (const s of series) {
    // Check how far ahead we've scheduled
    const lastScheduledAppt = await db.query(`
      SELECT MAX(date) as last_date
      FROM appointments
      WHERE recurring_series_id = $1
    `, [s.id]);

    const lastDate = lastScheduledAppt ? new Date(lastScheduledAppt.last_date) : new Date(s.start_date);
    const targetDate = addWeeks(new Date(), s.auto_schedule_window || 8);

    // If we need more appointments, generate them
    if (lastDate < targetDate) {
      const newAppointments = generateAppointments(s, lastDate, targetDate);
      await db.bulkInsert('appointments', newAppointments);

      console.log(`Generated ${newAppointments.length} appointments for series ${s.id}`);
    }
  }
}
```

#### 3.4 Recurring Series Management

**Edit Recurring Series**:
- Change frequency (affects future appointments only)
- Change preferred technician (reassign future appointments)
- Change preferred time window (update future appointments)
- Change end date (cancel appointments beyond new end date)

**Implementation**:
```javascript
async function updateRecurringSeries(seriesId, updates) {
  // Update master series record
  await db.query(`
    UPDATE recurring_series
    SET frequency = $1, preferred_technician_id = $2, preferred_time_window = $3, end_date = $4, updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
  `, [updates.frequency, updates.technicianId, updates.timeWindow, updates.endDate, seriesId]);

  // Update future appointments (not yet completed)
  await db.query(`
    UPDATE appointments
    SET technician_id = $1, time_window_start = $2, time_window_end = $3
    WHERE recurring_series_id = $4 AND date >= CURRENT_DATE AND status = 'scheduled'
  `, [updates.technicianId, updates.timeWindowStart, updates.timeWindowEnd, seriesId]);

  // Cancel appointments beyond new end date
  if (updates.endDate) {
    await db.query(`
      UPDATE appointments
      SET status = 'cancelled', cancellation_reason = 'Contract ended'
      WHERE recurring_series_id = $1 AND date > $2 AND status = 'scheduled'
    `, [seriesId, updates.endDate]);
  }
}
```

**Pause Recurring Series**:
- Customer going on vacation or temporarily suspends service
- Pause start and end dates
- Cancel appointments in pause window
- Resume after pause ends

**Cancel Recurring Series**:
- Customer terminates contract
- Cancel all future appointments
- Mark series as inactive
- Notify sales rep (potential churn)

#### 3.5 Exception Handling

**Rescheduling Single Occurrence**:
- Customer requests to reschedule next appointment only
- Move appointment to new date/time
- Leave rest of series unchanged
- Update customer: "This change affects only your next appointment on [date]"

**Skipping Single Occurrence**:
- Customer requests to skip next appointment (e.g., traveling)
- Mark appointment as cancelled
- Do NOT regenerate (maintain interval)
- Example: Monthly on 1st Tuesday → Skip March → Resume April

**Permanent Change from Specific Date**:
- Customer requests permanent change (e.g., switch from Tuesday to Thursday)
- Update series effective date: "Starting April 1, all appointments on Thursday"
- Cancel future Tuesday appointments after April 1
- Generate new Thursday appointments

### Technical Specifications

#### 3.6 Database Schema

```sql
-- Recurring series master table
CREATE TABLE recurring_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  service_type VARCHAR(50) NOT NULL,
  frequency VARCHAR(20) NOT NULL, -- weekly, biweekly, monthly, quarterly, annual
  start_date DATE NOT NULL,
  end_date DATE, -- NULL = ongoing indefinitely
  preferred_day_of_week INTEGER CHECK (preferred_day_of_week >= 0 AND preferred_day_of_week <= 6), -- 0=Sun, 1=Mon, etc.
  preferred_time_window VARCHAR(20), -- 'morning', 'afternoon', 'flexible'
  preferred_technician_id UUID REFERENCES users(id) ON DELETE SET NULL,
  auto_schedule_window INTEGER DEFAULT 8, -- Weeks to schedule ahead
  status VARCHAR(20) DEFAULT 'active', -- active, paused, cancelled
  pause_start_date DATE,
  pause_end_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES users(id)
);

-- Appointments table (links to recurring series)
ALTER TABLE appointments
ADD COLUMN recurring_series_id UUID REFERENCES recurring_series(id) ON DELETE SET NULL,
ADD COLUMN is_recurring BOOLEAN DEFAULT FALSE;

-- Index for efficient queries
CREATE INDEX idx_recurring_series_customer ON recurring_series(customer_id);
CREATE INDEX idx_recurring_series_status ON recurring_series(status);
CREATE INDEX idx_appointments_recurring_series ON appointments(recurring_series_id);
```

#### 3.7 API Endpoints

```javascript
// POST /api/v1/recurring-series
router.post('/recurring-series', async (req, res) => {
  const { customerId, serviceType, frequency, startDate, endDate, preferredDayOfWeek, preferredTimeWindow, preferredTechnicianId } = req.body;

  // Validate inputs
  // Create recurring series
  const series = await db.query(`
    INSERT INTO recurring_series (customer_id, service_type, frequency, start_date, end_date, preferred_day_of_week, preferred_time_window, preferred_technician_id, created_by)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `, [customerId, serviceType, frequency, startDate, endDate, preferredDayOfWeek, preferredTimeWindow, preferredTechnicianId, req.user.id]);

  // Generate initial appointments
  const appointments = generateAppointments(series, new Date(startDate), addWeeks(new Date(), 8));
  await db.bulkInsert('appointments', appointments);

  // Send confirmation email
  await sendRecurringServiceConfirmation(customerId, series, appointments);

  res.status(201).json({ series, appointments });
});

// PATCH /api/v1/recurring-series/:id
router.patch('/recurring-series/:id', async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  await updateRecurringSeries(id, updates);

  res.json({ success: true });
});

// POST /api/v1/recurring-series/:id/pause
router.post('/recurring-series/:id/pause', async (req, res) => {
  const { id } = req.params;
  const { pauseStartDate, pauseEndDate } = req.body;

  await db.query(`
    UPDATE recurring_series
    SET status = 'paused', pause_start_date = $1, pause_end_date = $2
    WHERE id = $3
  `, [pauseStartDate, pauseEndDate, id]);

  // Cancel appointments in pause window
  await db.query(`
    UPDATE appointments
    SET status = 'cancelled', cancellation_reason = 'Customer paused service'
    WHERE recurring_series_id = $1 AND date >= $2 AND date <= $3 AND status = 'scheduled'
  `, [id, pauseStartDate, pauseEndDate]);

  res.json({ success: true });
});

// POST /api/v1/recurring-series/:id/cancel
router.post('/recurring-series/:id/cancel', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  await db.query(`
    UPDATE recurring_series
    SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [id]);

  // Cancel all future appointments
  await db.query(`
    UPDATE appointments
    SET status = 'cancelled', cancellation_reason = $1
    WHERE recurring_series_id = $2 AND date >= CURRENT_DATE AND status = 'scheduled'
  `, [reason, id]);

  // Notify sales rep (potential churn)
  await notifySalesRepOfCancellation(id, reason);

  res.json({ success: true });
});
```

### Testing Requirements

#### 3.8 Unit Tests

- Appointment generation logic (monthly, quarterly, annual)
- Preferred day of week calculation (edge cases: month with 5 Tuesdays)
- Holiday skip logic
- Pause/resume logic
- End date handling

#### 3.9 Integration Tests

- Create recurring series, verify appointments generated
- Edit series, verify future appointments updated
- Pause series, verify appointments cancelled
- Cancel series, verify all future appointments cancelled

#### 3.10 E2E Tests

- Dispatcher sets up recurring service, customer receives confirmation email
- Cron job runs, new appointments generated automatically
- Customer reschedules single occurrence, series unchanged

---

## 4. Mobile Offline Sync Strategy

### Overview

Offline-first Progressive Web App (PWA) that allows field technicians to work without internet connectivity and sync data when connection is restored.

### Business Requirements

**Goal**: 100% reliable offline functionality (zero data loss, even in basements with no signal)

**Success Metrics**:
- Offline reliability: 100% (no failed syncs)
- Data loss incidents: Zero
- Sync success rate: >99%
- Offline mode activation: <1 second

### Functional Specifications

#### 4.1 Offline-First Architecture

**Core Principle**: App works offline by default, syncs as enhancement

**Key Features**:
- Cache all static assets (HTML, CSS, JS, images)
- Cache today's schedule on app open (while online)
- Store service completion forms locally (IndexedDB)
- Queue API calls when offline (background sync)
- Auto-sync when connection restored
- Conflict resolution (server wins)

#### 4.2 Service Worker Strategy

**Caching Strategies**:

**Static Assets** (Cache-First):
- HTML, CSS, JavaScript bundles
- UI images, icons, fonts
- Cache version: Update on new app deployment
- Fallback: Show offline page if cache miss

**API Calls** (Network-First with Fallback):
- Try network first (fresh data)
- If network fails, serve from cache (stale data acceptable)
- Update cache on successful network response

**Service Forms** (Offline Queue):
- Store submissions in IndexedDB
- Retry when online (background sync)
- Mark as "synced" when server confirms

**Photos** (Offline Queue):
- Store blobs in IndexedDB (or Local Storage for small images)
- Compress before storing (reduce size)
- Upload in batch when online (background sync)

#### 4.3 Service Worker Implementation

**File**: `service-worker.js`

```javascript
const CACHE_VERSION = 'v1.2.3'; // Update on each deployment
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DATA_CACHE = `data-${CACHE_VERSION}`;

// Install event: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/static/css/main.css',
        '/static/js/main.js',
        '/static/images/logo.png',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DATA_CACHE) {
            return caches.delete(cacheName); // Delete old versions
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control immediately
});

// Fetch event: Serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Static assets: Cache-first
  if (request.destination === 'document' || request.destination === 'script' || request.destination === 'style' || request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return cachedResponse || fetch(request).then((response) => {
          return caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, response.clone());
            return response;
          });
        });
      }).catch(() => {
        // Offline fallback
        if (request.destination === 'document') {
          return caches.match('/offline.html');
        }
      })
    );
  }

  // API calls: Network-first with cache fallback
  else if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then((response) => {
        // Cache successful responses
        if (response.ok) {
          caches.open(DATA_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      }).catch(() => {
        // Fallback to cache if offline
        return caches.match(request);
      })
    );
  }
});

// Background sync: Retry failed requests when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-service-forms') {
    event.waitUntil(syncServiceForms());
  } else if (event.tag === 'sync-photos') {
    event.waitUntil(syncPhotos());
  }
});

async function syncServiceForms() {
  // Retrieve queued forms from IndexedDB
  const db = await openDB('offline-queue', 1);
  const forms = await db.getAll('service-forms');

  for (const form of forms) {
    try {
      // POST to server
      const response = await fetch('/api/v1/service-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form.data),
      });

      if (response.ok) {
        // Success: Remove from queue
        await db.delete('service-forms', form.id);
        console.log(`Synced service form ${form.id}`);
      } else {
        // Server error: Keep in queue, retry later
        console.error(`Failed to sync form ${form.id}: ${response.status}`);
      }
    } catch (error) {
      // Network error: Keep in queue, retry later
      console.error(`Failed to sync form ${form.id}:`, error);
    }
  }
}

async function syncPhotos() {
  const db = await openDB('offline-queue', 1);
  const photos = await db.getAll('photos');

  for (const photo of photos) {
    try {
      // Upload photo as multipart/form-data
      const formData = new FormData();
      formData.append('file', photo.blob, photo.filename);
      formData.append('serviceReportId', photo.serviceReportId);
      formData.append('locationTag', photo.locationTag);

      const response = await fetch('/api/v1/photos/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await db.delete('photos', photo.id);
        console.log(`Synced photo ${photo.id}`);
      }
    } catch (error) {
      console.error(`Failed to sync photo ${photo.id}:`, error);
    }
  }
}
```

#### 4.4 IndexedDB Schema

**Database**: `offline-queue`

**Object Stores**:

**1. service-forms** (Service completion forms awaiting sync):
```javascript
{
  id: 'uuid-1',
  appointmentId: 'appt-123',
  data: {
    customerId: 'cust-456',
    technicianId: 'tech-789',
    pestType: 'ants',
    severity: 'medium',
    treatmentMethod: 'perimeter spray',
    productsUsed: [...],
    recommendations: '...',
    signature: 'data:image/png;base64,...',
    completedAt: '2025-01-15T09:47:00Z',
  },
  createdAt: '2025-01-15T09:50:00Z',
  syncAttempts: 0,
  lastSyncAttempt: null,
}
```

**2. photos** (Photos awaiting upload):
```javascript
{
  id: 'uuid-2',
  serviceReportId: 'report-123', // Temporary ID until synced
  blob: Blob, // Compressed image blob
  filename: 'photo-1-front-yard.jpg',
  locationTag: 'front',
  gpsCoords: { lat: 34.05, lng: -118.25 },
  createdAt: '2025-01-15T09:30:00Z',
  size: 245678, // bytes
}
```

**3. schedule-cache** (Today's schedule, refreshed on app open):
```javascript
{
  id: 'schedule-2025-01-15',
  date: '2025-01-15',
  appointments: [
    {
      id: 'appt-1',
      customerId: 'cust-1',
      customerName: 'John Smith',
      address: '123 Main St',
      serviceType: 'General Pest Control',
      timeWindow: '9:00 AM - 11:00 AM',
      duration: 60,
      specialInstructions: 'Gate code 1234',
      customerHistory: [...],
    },
    // ... more appointments
  ],
  cachedAt: '2025-01-15T07:30:00Z',
  expiresAt: '2025-01-15T23:59:59Z',
}
```

#### 4.5 Client-Side Offline Queue (React/Redux)

**File**: `src/utils/offlineQueue.js`

```javascript
import { openDB } from 'idb';

const DB_NAME = 'offline-queue';
const DB_VERSION = 1;

// Initialize IndexedDB
export async function initOfflineQueue() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('service-forms')) {
        db.createObjectStore('service-forms', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('photos')) {
        db.createObjectStore('photos', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('schedule-cache')) {
        db.createObjectStore('schedule-cache', { keyPath: 'id' });
      }
    },
  });
}

// Add service form to offline queue
export async function queueServiceForm(appointmentId, formData) {
  const db = await initOfflineQueue();
  const id = `form-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const record = {
    id,
    appointmentId,
    data: formData,
    createdAt: new Date().toISOString(),
    syncAttempts: 0,
    lastSyncAttempt: null,
  };

  await db.put('service-forms', record);

  // Trigger background sync (if supported)
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-service-forms');
  } else {
    // Fallback: Sync immediately if background sync not supported
    await syncServiceForms();
  }

  return id;
}

// Add photo to offline queue
export async function queuePhoto(serviceReportId, photoBlob, locationTag, gpsCoords) {
  const db = await initOfflineQueue();
  const id = `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Compress photo before storing
  const compressedBlob = await compressImage(photoBlob, 0.8); // 80% quality

  const record = {
    id,
    serviceReportId,
    blob: compressedBlob,
    filename: `photo-${id}.jpg`,
    locationTag,
    gpsCoords,
    createdAt: new Date().toISOString(),
    size: compressedBlob.size,
  };

  await db.put('photos', record);

  // Trigger background sync
  if ('serviceWorker' in navigator && 'sync' in navigator.serviceWorker) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-photos');
  } else {
    await syncPhotos();
  }

  return id;
}

// Cache today's schedule
export async function cacheSchedule(date, appointments) {
  const db = await initOfflineQueue();
  const id = `schedule-${date}`;

  const record = {
    id,
    date,
    appointments,
    cachedAt: new Date().toISOString(),
    expiresAt: `${date}T23:59:59Z`,
  };

  await db.put('schedule-cache', record);
}

// Retrieve cached schedule
export async function getCachedSchedule(date) {
  const db = await initOfflineQueue();
  const id = `schedule-${date}`;
  return db.get('schedule-cache', id);
}

// Get queued items count (for UI indicator)
export async function getQueuedItemsCount() {
  const db = await initOfflineQueue();
  const forms = await db.count('service-forms');
  const photos = await db.count('photos');
  return { forms, photos, total: forms + photos };
}

// Image compression utility
async function compressImage(blob, quality) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    img.onload = () => {
      // Resize to max 1920x1080 (maintain aspect ratio)
      const maxWidth = 1920;
      const maxHeight = 1080;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((compressedBlob) => {
        resolve(compressedBlob);
      }, 'image/jpeg', quality);
    };

    img.src = URL.createObjectURL(blob);
  });
}
```

#### 4.6 Sync Conflict Resolution

**Scenario**: Technician completes service offline, syncs later, but dispatcher already rescheduled appointment

**Resolution Strategy**: Server Wins (Last Write Wins with Notification)

**Implementation**:
1. Client submits service completion offline (queued)
2. Dispatcher reschedules appointment (server updated)
3. Client comes online, attempts sync
4. Server detects conflict:
   - Appointment status changed from "scheduled" to "rescheduled"
   - Service completion is for old appointment
5. Server response: `409 Conflict`
   - Message: "This appointment was rescheduled. Your service completion has been saved separately."
6. Client handles conflict:
   - Show notification to technician: "Appointment was rescheduled, but your work has been saved."
   - Mark queued item as "needs review"
   - Alert dispatcher to reconcile

**Conflict Types**:

| Conflict | Client Action | Server Action | Resolution |
|----------|---------------|---------------|------------|
| Appointment rescheduled | Service completed offline | Appointment moved to new date | Save service completion, link to old appointment, notify dispatcher |
| Appointment cancelled | Service completed offline | Appointment cancelled | Save service completion anyway (customer may have been serviced), flag for review |
| Service already completed | Service completed offline (duplicate) | Service already marked complete by another tech | Reject duplicate, notify technician of error |

#### 4.7 Offline Indicator UI

**Network Status Banner**:
```javascript
function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queuedItems, setQueuedItems] = useState({ forms: 0, photos: 0 });

  useEffect(() => {
    // Listen for online/offline events
    window.addEventListener('online', () => setIsOnline(true));
    window.addEventListener('offline', () => setIsOnline(false));

    // Poll queued items count
    const interval = setInterval(async () => {
      const count = await getQueuedItemsCount();
      setQueuedItems(count);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  if (isOnline && queuedItems.total === 0) {
    return null; // No indicator when online and synced
  }

  return (
    <div className={`offline-banner ${isOnline ? 'syncing' : 'offline'}`}>
      {!isOnline && (
        <span>📡 Offline - Your data will sync when connection is restored</span>
      )}
      {isOnline && queuedItems.total > 0 && (
        <span>🔄 Syncing {queuedItems.total} items...</span>
      )}
    </div>
  );
}
```

### Testing Requirements

#### 4.8 Offline Simulation Tests

**Manual Testing**:
1. Enable airplane mode on device
2. Complete service form with photos
3. Verify saved to IndexedDB
4. Disable airplane mode
5. Verify auto-sync within 30 seconds
6. Verify data appears on server

**Automated Tests** (Puppeteer):
```javascript
test('Service form submission works offline', async () => {
  // Simulate offline
  await page.setOfflineMode(true);

  // Fill out service form
  await page.fill('#pest-type', 'ants');
  await page.fill('#severity', 'medium');
  await page.click('#submit-form');

  // Verify queued in IndexedDB
  const queuedForms = await page.evaluate(() => {
    return indexedDB.open('offline-queue').then(db => {
      return db.getAll('service-forms');
    });
  });
  expect(queuedForms.length).toBe(1);

  // Simulate back online
  await page.setOfflineMode(false);

  // Wait for sync
  await page.waitForTimeout(5000);

  // Verify synced to server
  const syncedForms = await page.evaluate(() => {
    return indexedDB.open('offline-queue').then(db => {
      return db.getAll('service-forms');
    });
  });
  expect(syncedForms.length).toBe(0); // Queue should be empty
});
```

#### 4.9 Performance Tests

- Cache hit rate >80% for schedule data
- Offline form submission <500ms (write to IndexedDB)
- Photo compression <3s per image
- Sync 50 queued items in <60s

---

## 5. Lead Scoring Criteria

### Overview

Point-based lead scoring system that prioritizes leads based on likelihood to convert and customer value.

### Business Requirements

**Goal**: Help sales reps focus on highest-value, most likely-to-convert leads first

**Success Metrics**:
- Lead conversion rate >30% for high-scoring leads (vs 15% baseline)
- Sales rep satisfaction >4/5 with lead quality
- 80% of sales reps use lead score to prioritize daily work

### Functional Specifications

#### 5.1 Scoring Criteria (MVP)

**Total Score Range**: 0-100 points

**Category 1: Demographic Fit** (Max 40 points)

| Criterion | Points | Reasoning |
|-----------|--------|-----------|
| Property size >3,000 sq ft | +15 | Larger properties = higher service value |
| Property size 1,500-3,000 sq ft | +10 | Average properties |
| Property size <1,500 sq ft | +5 | Smaller properties = lower value |
| Commercial property | +15 | Higher contract value, recurring revenue |
| Residential property | +5 | Standard value |
| In service area (ZIP match) | +10 | Easy to service, no travel premium |
| Outside service area | -10 | May decline or charge extra for travel |

**Category 2: Urgency/Pest Type** (Max 30 points)

| Criterion | Points | Reasoning |
|-----------|--------|-----------|
| Termites or bed bugs | +20 | High urgency, high value, immediate action |
| Rodents | +15 | Urgent, health hazard, quick close |
| Ants or roaches | +10 | Common, moderate urgency |
| Wasps or spiders | +10 | Seasonal, moderate urgency |
| General preventative | +5 | Low urgency, may delay decision |
| Emergency service requested | +10 | Immediate need, likely to close fast |

**Category 3: Engagement/Responsiveness** (Max 20 points)

| Criterion | Points | Reasoning |
|-----------|--------|-----------|
| Responded within 4 hours | +10 | Highly engaged, urgent need |
| Requested specific service date | +5 | Serious intent, ready to buy |
| Filled out detailed form | +5 | Invested time, serious interest |
| Referral from existing customer | +10 | Trust established, high conversion |
| Repeat customer (reactivation) | +15 | Previous customer, easy close |
| Email opened (quote or follow-up) | +5 | Engaged with communications |

**Category 4: Lead Source** (Max 10 points)

| Criterion | Points | Reasoning |
|-----------|--------|-----------|
| Referral (word-of-mouth) | +10 | Highest conversion rate |
| Google search (organic or paid) | +7 | High intent, actively searching |
| Website contact form | +5 | Moderate intent |
| Social media | +3 | Lower intent, may be browsing |
| Cold outreach | +0 | Low intent, harder to convert |

**Negative Modifiers** (Deductions)

| Criterion | Points | Reasoning |
|-----------|--------|-----------|
| No contact attempt in 7 days | -10 | Stale lead, lower priority |
| Voicemail not returned (2+ attempts) | -5 | Low responsiveness |
| Price shopper (asked for quote from 3+ companies) | -5 | Low loyalty, harder to close |
| Previous customer who churned | -10 | High risk, may churn again |

#### 5.2 Scoring Calculation Logic

**Algorithm**:
```javascript
function calculateLeadScore(lead) {
  let score = 0;

  // Category 1: Demographic fit
  if (lead.propertySize > 3000) score += 15;
  else if (lead.propertySize >= 1500) score += 10;
  else score += 5;

  if (lead.propertyType === 'commercial') score += 15;
  else score += 5;

  if (isInServiceArea(lead.zipCode)) score += 10;
  else score -= 10;

  // Category 2: Urgency/Pest type
  if (['termites', 'bed_bugs'].includes(lead.pestType)) score += 20;
  else if (lead.pestType === 'rodents') score += 15;
  else if (['ants', 'roaches'].includes(lead.pestType)) score += 10;
  else if (['wasps', 'spiders'].includes(lead.pestType)) score += 10;
  else score += 5;

  if (lead.emergencyService) score += 10;

  // Category 3: Engagement
  const responseTime = (new Date(lead.firstContactedAt) - new Date(lead.createdAt)) / (1000 * 60 * 60);
  if (responseTime <= 4) score += 10;

  if (lead.requestedServiceDate) score += 5;
  if (lead.formCompleteness === 'detailed') score += 5;
  if (lead.source === 'referral') score += 10;
  if (lead.isReturningCustomer) score += 15;
  if (lead.emailOpened) score += 5;

  // Category 4: Lead source
  if (lead.source === 'referral') score += 10;
  else if (lead.source === 'google') score += 7;
  else if (lead.source === 'website') score += 5;
  else if (lead.source === 'social') score += 3;

  // Negative modifiers
  const daysSinceContact = (new Date() - new Date(lead.lastContactedAt)) / (1000 * 60 * 60 * 24);
  if (daysSinceContact > 7) score -= 10;

  if (lead.voicemailAttempts >= 2 && !lead.responded) score -= 5;
  if (lead.priceShopperFlag) score -= 5;
  if (lead.previouslyChurned) score -= 10;

  // Clamp score to 0-100
  return Math.max(0, Math.min(100, score));
}
```

#### 5.3 Score Interpretation

**Score Ranges**:

| Score | Category | Priority | Expected Conversion Rate | Actions |
|-------|----------|----------|--------------------------|---------|
| 80-100 | Hot Lead | P0 - Immediate | >40% | Call within 1 hour, prioritize for inspection |
| 60-79 | Warm Lead | P1 - High | 25-40% | Call within 4 hours, schedule inspection ASAP |
| 40-59 | Qualified Lead | P2 - Medium | 15-25% | Call within 24 hours, nurture with follow-ups |
| 20-39 | Cold Lead | P3 - Low | 5-15% | Email campaign, low-priority follow-up |
| 0-19 | Unqualified | P4 - Disqualify | <5% | Mark as "Not a Fit" or long-term nurture |

#### 5.4 Database Implementation

```sql
-- Add lead_score column to leads table
ALTER TABLE leads
ADD COLUMN lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
ADD COLUMN score_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for sorting by score
CREATE INDEX idx_leads_score ON leads(lead_score DESC);

-- Trigger to recalculate score on lead update
CREATE OR REPLACE FUNCTION recalculate_lead_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Call scoring function (simplified here, full logic in application layer)
  NEW.lead_score := calculate_lead_score_sql(NEW);
  NEW.score_updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_recalculate_lead_score
BEFORE INSERT OR UPDATE ON leads
FOR EACH ROW
EXECUTE FUNCTION recalculate_lead_score();
```

#### 5.5 API Endpoint

```javascript
// GET /api/v1/leads?sort=score&order=desc
router.get('/leads', async (req, res) => {
  const { sort = 'score', order = 'desc', assignedTo, minScore } = req.query;

  let query = `
    SELECT * FROM leads
    WHERE status = 'active'
  `;

  const params = [];

  if (assignedTo) {
    params.push(assignedTo);
    query += ` AND assigned_to = $${params.length}`;
  }

  if (minScore) {
    params.push(minScore);
    query += ` AND lead_score >= $${params.length}`;
  }

  query += ` ORDER BY ${sort} ${order}`;

  const leads = await db.query(query, params);

  res.json({ leads });
});

// PATCH /api/v1/leads/:id/recalculate-score
router.patch('/leads/:id/recalculate-score', async (req, res) => {
  const { id } = req.params;

  // Fetch lead
  const lead = await db.query('SELECT * FROM leads WHERE id = $1', [id]);
  if (!lead) return res.status(404).json({ error: 'Lead not found' });

  // Recalculate score
  const newScore = calculateLeadScore(lead);

  // Update database
  await db.query('UPDATE leads SET lead_score = $1, score_updated_at = CURRENT_TIMESTAMP WHERE id = $2', [newScore, id]);

  res.json({ id, score: newScore });
});
```

#### 5.6 UI Display

**Lead List View**:
```
┌────────────────────────────────────────────────────────┐
│ Leads (Sorted by Score)                                │
├────────────────────────────────────────────────────────┤
│ 🔥 92   ABC Commercial - Termites              $8,500  │
│        3,500 sq ft | Urgent | In service area          │
│        [Call Now] [Schedule Inspection]                │
├────────────────────────────────────────────────────────┤
│ 🔥 85   Johnson Residence - Bed Bugs           $2,400  │
│        2,200 sq ft | Emergency | Referral              │
│        [Call Now] [Schedule Inspection]                │
├────────────────────────────────────────────────────────┤
│ ⚡ 68   Smith Home - Rodents                   $1,800  │
│        1,800 sq ft | Responded quickly                 │
│        [Call] [Send Quote]                             │
├────────────────────────────────────────────────────────┤
│ 📋 52   Davis Property - General Pest          $1,200  │
│        1,500 sq ft | Website form                      │
│        [Call] [Email]                                  │
├────────────────────────────────────────────────────────┤
│ 📋 38   Martinez Home - Ants                   $800    │
│        1,200 sq ft | No response to voicemail          │
│        [Email] [Mark Unqualified]                      │
└────────────────────────────────────────────────────────┘
```

**Score Badge**:
- 80-100: 🔥 Red badge (Hot Lead)
- 60-79: ⚡ Orange badge (Warm Lead)
- 40-59: 📋 Blue badge (Qualified Lead)
- 20-39: ❄️ Gray badge (Cold Lead)
- 0-19: ❌ No badge (Unqualified)

### Phase 2 Enhancements: Machine Learning

**ML-Based Lead Scoring**:
- Train model on historical lead data (features → conversion outcome)
- Features: All demographic, engagement, and source data
- Algorithm: Logistic regression or random forest classifier
- Output: Probability of conversion (0-100%)
- Retrain model monthly with new data

**Predictive Insights**:
- "This lead is similar to 12 past customers who converted in 5 days"
- "Leads from this source have a 42% conversion rate"
- "Recommended next action: Call between 2-4pm (highest answer rate)"

### Testing Requirements

#### 5.7 Unit Tests

- Score calculation logic (various lead profiles)
- Edge cases (missing data, negative scores clamped to 0)
- Score recalculation on lead update

#### 5.8 Integration Tests

- API endpoint returns leads sorted by score
- Lead update triggers score recalculation
- Score persisted to database correctly

---

## Summary

This feature specification document provides detailed technical and functional requirements for the five most complex features in the MVP:

1. **Pipeline Visualization**: Interactive Kanban board for sales pipeline management
2. **Route Optimization**: Geographic clustering algorithm for minimizing drive time
3. **Recurring Service Automation**: Automated appointment generation for recurring contracts
4. **Mobile Offline Sync**: Offline-first PWA with IndexedDB and background sync
5. **Lead Scoring**: Point-based system for prioritizing high-value leads

Each specification includes business requirements, functional details, technical implementation, API endpoints, database schemas, and testing requirements.

**Next Steps**:
1. Review with Technical Lead for implementation feasibility
2. Validate assumptions with UX Designer (UI/UX flows)
3. Create database migration scripts
4. Assign features to developers
5. Begin development Sprint 1

**Approval**:
- [ ] Product Manager
- [ ] Technical Lead
- [ ] Software Architect
- [ ] UX Designer
