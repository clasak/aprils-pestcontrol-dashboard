# User Flows - April's Pest Control Dashboard

**Version**: 1.0 MVP
**Last Updated**: December 22, 2025

---

## Table of Contents

1. [Lead to Customer Flow](#1-lead-to-customer-flow)
2. [Quote Creation and Approval](#2-quote-creation-and-approval)
3. [Service Scheduling (One-Time and Recurring)](#3-service-scheduling-one-time-and-recurring)
4. [Daily Technician Workflow](#4-daily-technician-workflow)
5. [Service Completion and Follow-Up](#5-service-completion-and-follow-up)
6. [Dashboard Review (Sales Manager Perspective)](#6-dashboard-review-sales-manager-perspective)

---

## 1. Lead to Customer Flow

**Primary User**: Sales Representative (April)
**Duration**: 7-21 days (target <18 days)
**Frequency**: Daily
**Success Metric**: >25% lead-to-customer conversion rate

### Flow Steps

#### Step 1: Lead Capture

**Trigger**: Customer inquiry via website form, phone call, or referral

**Actions**:
1. Lead enters system automatically (web form) or manually (phone/referral)
   - **Auto Entry**: Web form submission creates lead record
   - **Manual Entry**: Sales rep opens "New Lead" form
2. System captures:
   - Contact information (name, phone, email, address)
   - Lead source (website, Google, referral, partner)
   - Property type (residential/commercial)
   - Pest issue (ants, termites, rodents, bed bugs, general)
   - Urgency (emergency, urgent, routine)
3. System auto-assigns lead:
   - Check lead address ZIP code
   - Match to sales rep territory
   - If no match, round-robin to available reps
   - Send notification to assigned rep

**Screen**: Lead Capture Form
**Fields**: Name*, Phone*, Email, Address*, Property Type*, Pest Issue*, Lead Source*, Special Notes

**Auto-Actions**:
- Duplicate detection (check phone/email against existing leads/customers)
- Lead scoring calculation (based on urgency, property size, pest type)
- Assignment notification (email + in-app to sales rep)
- First follow-up task created (call within 4 hours)

**Alternative Paths**:
- **Duplicate Found**: Show matching record, option to merge or create new
- **Outside Service Area**: Flag for rejection or transfer to partner

---

#### Step 2: Initial Contact & Qualification

**Trigger**: Sales rep receives lead assignment notification

**Actions**:
1. Sales rep views lead on dashboard (sorted by score, new leads first)
2. Click lead to view details:
   - Contact info (click-to-call phone number)
   - Property details
   - Pest issue description
   - Lead source
   - Any notes from lead form
3. Sales rep calls customer (system logs call activity)
4. During call, rep updates lead:
   - Qualify: Is this a real opportunity? (Yes/No)
   - Property size (sq ft)
   - Budget range
   - Timeline (when do they want service?)
   - Additional notes
5. Rep schedules inspection appointment (if qualified)
   - Select date/time (next available slots)
   - Assign technician (default to rep if licensed, or field tech)
   - Add calendar notes
6. System sends confirmation:
   - Email to customer with appointment details
   - SMS reminder (24 hours before)
   - Calendar invite

**Screen**: Lead Detail View → Schedule Inspection Modal

**Status Updates**:
- New → Contacted → Qualified (or Unqualified)
- Create task: "Inspection scheduled for [date]"

**Alternative Paths**:
- **Unqualified**: Mark as "Not a Fit" with reason (outside area, price shopper, not serious)
- **Voicemail**: Mark "Attempted Contact", schedule follow-up call task
- **Customer Requests Quote First**: Skip inspection, go to Step 3

---

#### Step 3: Inspection

**Trigger**: Scheduled inspection date arrives

**Actions**:
1. Technician (or sales rep) receives appointment on mobile app
2. Navigate to customer property (one-tap to Google Maps)
3. Conduct inspection:
   - Identify pest type and severity
   - Inspect interior and exterior
   - Take photos (evidence of infestation, entry points, damage)
   - Measure property (if needed)
   - Note treatment recommendations
4. Complete inspection form on mobile:
   - Pest type confirmed
   - Severity (low, medium, high)
   - Treatment recommended (one-time, recurring, specialized)
   - Photos attached
   - Estimated property size
   - Notes for quote
5. Submit inspection report
   - Auto-syncs to lead record
   - Notifies sales rep "Inspection complete, ready for quote"

**Screen**: Mobile App → Inspection Form

**Auto-Actions**:
- Create task for sales rep: "Generate quote for [Customer Name]"
- Inspection report auto-attached to lead record
- Photos uploaded to customer file

**Alternative Paths**:
- **No Infestation Found**: Mark inspection "No Service Needed", close lead
- **Emergency Treatment Needed**: Technician performs immediate treatment (if authorized)

---

#### Step 4: Quote Generation

**Trigger**: Sales rep receives "Inspection complete" notification

**Actions**:
1. Sales rep opens lead record
2. Click "Create Quote" button
3. Quote builder pre-populates from inspection:
   - Customer info
   - Property size
   - Pest type
   - Recommended treatment
4. Rep selects service package:
   - **One-Time Treatment**: Single visit, one-time fee
   - **Recurring Service**: Monthly/Quarterly/Annual, discounted rate
   - **Specialized Treatment**: Multi-visit protocol (termites, bed bugs)
5. System calculates pricing:
   - Base price from property size and service type
   - Adjustments for pest type (termites higher)
   - Frequency discount (annual = 15% off)
   - Any custom adjustments by rep
6. Rep customizes quote:
   - Add/remove line items
   - Apply discount (with approval if >10%)
   - Add special terms or notes
   - Set expiration date (default 30 days)
7. Preview quote (branded PDF)
8. Send to customer:
   - Email with embedded signature link
   - Option to text link
   - Track sent status

**Screen**: Quote Builder → Preview → Send Modal

**Time Target**: <5 minutes from opening quote to sending

**Auto-Actions**:
- Create deal in pipeline (Stage: "Quote Sent")
- Set follow-up task (3 days: "Follow up on quote")
- Email notification to customer with quote PDF
- Track quote views (when customer opens email/link)

**Alternative Paths**:
- **Custom Pricing Needed**: Flag for manager approval if discount >10%
- **Quote Needs Revision**: Save as draft, update later

---

#### Step 5: Quote Follow-Up & Negotiation

**Trigger**: Quote sent to customer

**Actions**:
1. Sales rep monitors quote status:
   - Sent (email delivered)
   - Viewed (customer opened link)
   - Signed (e-signature captured)
   - Expired (past expiration date)
2. Rep receives notification:
   - "Quote viewed by customer" (shows interest)
   - "Quote expiring in 7 days" (urgency reminder)
3. Rep follows up (task reminder):
   - Call customer: "Did you have a chance to review?"
   - Address questions or objections
   - Negotiate if needed (price, terms, service frequency)
4. If changes needed:
   - Edit quote (creates new version)
   - Resend updated quote
   - Note reason for change
5. Customer signs quote:
   - Customer clicks signature link
   - Reviews quote details
   - Signs digitally (finger/stylus on phone or mouse on desktop)
   - Submits signature
6. System processes signature:
   - Marks quote as "Accepted"
   - Auto-creates customer record (converts lead)
   - Moves deal to "Won" stage
   - Triggers onboarding workflow

**Screen**: Pipeline View (Kanban) → Deal Detail → Quote Status

**Auto-Actions on Signature**:
- Convert lead to customer
- Create customer account with service agreement
- Move deal to "Won" stage
- Create task: "Schedule first service"
- Send welcome email to customer
- Notify dispatcher to schedule service

**Alternative Paths**:
- **Customer Declines**: Mark deal as "Lost" with reason (price, competitor, timing, not interested)
- **Quote Expires**: Follow up one last time, or close as "Lost - No Response"
- **Customer Signs Competitor**: Mark "Lost - Competitor", note competitor name

---

#### Step 6: Customer Onboarding

**Trigger**: Quote accepted (e-signature captured)

**Actions**:
1. System auto-converts lead to customer:
   - Creates customer record
   - Copies all lead data
   - Links signed quote
   - Archives lead
2. Sales rep reviews customer setup:
   - Service agreement details (frequency, start date)
   - Billing information (will be Phase 2)
   - Special instructions (gate codes, pets, allergies)
   - Preferred technician (if any)
3. Rep hands off to dispatcher:
   - Assign to dispatcher queue
   - Add scheduling priority (ASAP, within week, specific date)
   - Note any urgency
4. Dispatcher schedules first service:
   - Select date based on customer preference
   - Assign technician (territory match)
   - Send appointment confirmation

**Screen**: Customer Setup → Service Agreement → Schedule First Service

**Auto-Actions**:
- Create customer record
- Generate customer ID
- Set up recurring service schedule (if applicable)
- Send welcome email with:
  - Service agreement summary
  - What to expect on first visit
  - Contact information
  - Customer portal link (Phase 2)

**Success Metrics**:
- Lead-to-customer conversion: >25%
- Average days from lead to customer: <18 days (target)
- Quote acceptance rate: >40%

---

## 2. Quote Creation and Approval

**Primary User**: Sales Representative
**Duration**: 5 minutes (target)
**Frequency**: Daily
**Success Metric**: Quote generation time <5 minutes, acceptance rate >40%

### Flow Steps

#### Step 1: Access Quote Builder

**Trigger**: Sales rep ready to create quote after inspection or initial consultation

**Entry Points**:
1. **From Lead Record**: Click "Create Quote" button
2. **From Deal Pipeline**: Click deal card → "Create Quote"
3. **From Customer Record**: Click "New Quote" (for existing customers)

**Actions**:
1. System opens quote builder
2. Pre-populates customer information:
   - Name, address, phone, email
   - Property details (size, type)
   - Recent inspection notes (if applicable)

**Screen**: Quote Builder (Step 1: Customer Info)

---

#### Step 2: Select Service Type

**Actions**:
1. Rep selects primary service category:
   - **General Pest Control** (ants, spiders, cockroaches)
   - **Termite Treatment** (inspection, baiting, trenching)
   - **Bed Bug Treatment** (heat, chemical, multi-visit)
   - **Rodent Control** (inspection, trapping, exclusion)
   - **Commercial Service** (custom package)
2. Rep selects service frequency:
   - **One-Time**: Single visit, full price
   - **Monthly**: 12 visits/year, 10% discount
   - **Quarterly**: 4 visits/year, 5% discount
   - **Annual**: Initial + 1 renewal, 15% discount
3. System displays recommended package:
   - Package name (e.g., "Monthly Pest Prevention")
   - Service description
   - What's included (interior, exterior, both)
   - Frequency and duration
   - Base price

**Screen**: Quote Builder (Step 2: Service Selection)

**Visual Aid**: Service comparison table showing one-time vs recurring value

---

#### Step 3: Configure Pricing

**Actions**:
1. System calculates base price:
   - **Property Size Tier**:
     - <1,500 sq ft: $X
     - 1,500-3,000 sq ft: $Y
     - 3,000-5,000 sq ft: $Z
     - 5,000+ sq ft: Custom
   - **Service Type Multiplier**:
     - General pest: 1.0x
     - Termites: 2.0x
     - Bed bugs: 3.0x
     - Rodents: 1.5x
   - **Frequency Discount**:
     - One-time: 0%
     - Monthly: -10%
     - Quarterly: -5%
     - Annual: -15%
2. Rep reviews calculated price
3. Rep can adjust:
   - Add additional services (line items)
   - Apply promotional discount (requires approval if >10%)
   - Add seasonal adjustment
   - Round to nearest $5 or $10
4. System shows:
   - Subtotal
   - Discount (if any)
   - Tax (calculated by ZIP code)
   - **Total**

**Screen**: Quote Builder (Step 3: Pricing)

**Approval Workflow**:
- Discount >10%: Flag for manager approval
- Manager receives in-app notification
- Manager reviews and approves/rejects
- Rep notified of decision

---

#### Step 4: Customize Quote Details

**Actions**:
1. Rep adds/edits line items:
   - Service description
   - Quantity
   - Unit price
   - Total per line
2. Rep adds custom terms:
   - Payment terms (due on service, net 30, etc.)
   - Cancellation policy
   - Service guarantee details
   - Special instructions
3. Rep adds internal notes (not visible to customer):
   - Special considerations
   - Reason for discount
   - Competitor price match details
4. Rep sets quote expiration date:
   - Default: 30 days from today
   - Custom: any future date

**Screen**: Quote Builder (Step 4: Details & Terms)

**Template Options**:
- Pre-built terms templates by service type
- Company default terms (editable)

---

#### Step 5: Preview & Send

**Actions**:
1. Rep clicks "Preview Quote"
2. System generates branded PDF:
   - Company logo and header
   - Customer information
   - Quote number and date
   - Itemized services and pricing
   - Terms and conditions
   - Signature block
   - Expiration date
3. Rep reviews PDF for accuracy
4. Rep chooses delivery method:
   - **Email** (default): Send to customer email with embedded signature link
   - **SMS**: Text link to quote
   - **Print**: Download PDF to print and deliver in person
5. Rep clicks "Send Quote"
6. System processes:
   - Saves quote to database
   - Sends email with quote PDF and signature link
   - Creates deal in pipeline (if not exists)
   - Sets follow-up task (3 days)

**Screen**: Quote Preview (PDF) → Send Options Modal

**Email Template**:
```
Subject: Pest Control Quote from April's Pest Control

Hi [Customer Name],

Thank you for choosing April's Pest Control! Attached is your personalized quote for [Service Type].

[QUOTE SUMMARY]
- Service: [Service Name]
- Property: [Address]
- Total: $[Amount]

To accept this quote, simply click the link below and sign digitally:
[SIGNATURE LINK]

This quote expires on [Expiration Date].

If you have any questions, feel free to call me at [Rep Phone] or reply to this email.

Looking forward to serving you!

[Rep Name]
[Rep Title]
April's Pest Control
```

**Auto-Actions After Send**:
- Quote status: "Sent"
- Deal stage: "Quote Sent" (if not already won/lost)
- Task created: "Follow up on quote for [Customer]" (due in 3 days)
- Email tracking enabled (opens and clicks)

---

#### Step 6: Customer Reviews Quote

**Customer Actions**:
1. Customer receives email notification
2. Customer clicks quote link
3. Browser opens quote review page:
   - Mobile-responsive layout
   - Quote details displayed
   - PDF download option
   - Digital signature capture area
4. Customer reviews:
   - Services included
   - Pricing breakdown
   - Terms and conditions
5. Customer decides:
   - **Accept**: Proceed to signature
   - **Request Changes**: Call/email sales rep
   - **Decline**: Close page (no action)

**Screen**: Customer Quote Review Page (Mobile-Optimized)

**System Tracking**:
- Quote viewed: Log timestamp
- PDF downloaded: Log event
- Signature started: Log event
- Page abandonment: Log exit without action

**Notification to Rep**:
- "Quote viewed by [Customer Name]" (shows interest)
- "Quote accepted and signed!" (auto-converts to customer)

---

#### Step 7: E-Signature Capture

**Trigger**: Customer clicks "Accept and Sign" button

**Customer Actions**:
1. Signature modal opens
2. Customer draws signature:
   - Touch screen (finger/stylus)
   - Mouse (desktop)
3. Customer confirms:
   - "I agree to the terms and conditions"
   - Date auto-populated
   - Name confirmation
4. Customer clicks "Submit Signature"
5. System validates:
   - Signature not blank
   - Agreement checkbox checked
   - Name matches
6. System processes:
   - Saves signature image
   - Timestamps signature
   - Marks quote as "Accepted"
   - Generates final signed PDF
   - Triggers customer conversion workflow

**Screen**: E-Signature Modal (Canvas-Based)

**Confirmation Page**:
```
Thank you for choosing April's Pest Control!

Your quote has been accepted and signed.

What's Next:
1. We'll schedule your first service within 1-2 business days
2. You'll receive a confirmation email with appointment details
3. A technician will arrive during your scheduled window

Questions? Contact us at [Phone] or [Email]
```

**Auto-Actions**:
- Quote status: "Accepted"
- Deal stage: "Won"
- Convert lead to customer (if applicable)
- Send confirmation email to customer (with signed PDF)
- Notify sales rep: "Quote accepted!"
- Notify dispatcher: "New customer ready for scheduling"
- Create task: "Schedule first service for [Customer]"

---

#### Step 8: Quote Management & Follow-Up

**Trigger**: Quote sent but not yet accepted

**Sales Rep Actions**:
1. Monitor quote status on pipeline board:
   - **Sent**: Email delivered, not yet viewed
   - **Viewed**: Customer opened quote link (engaged)
   - **Accepted**: Signed and converted
   - **Expired**: Past expiration date
2. Follow up based on status:
   - **Viewed but not signed** (3 days): Call to address questions
   - **Sent but not viewed** (5 days): Email/call reminder
   - **Expiring soon** (7 days before): Urgency follow-up
3. Edit quote if needed:
   - Customer requests changes (price, services, terms)
   - Rep updates quote builder
   - System creates new version (v2, v3...)
   - Resend updated quote
   - Previous versions archived
4. Mark quote as lost if appropriate:
   - Customer chooses competitor
   - Customer declines service
   - No response after multiple attempts
   - Note reason for loss

**Screen**: Pipeline View → Quote Status Dashboard

**Reports Available**:
- Quotes sent this week/month
- Quote acceptance rate by rep
- Average time to acceptance
- Quotes expiring soon
- Top reasons for quote rejection

**Success Metrics**:
- Quote generation time: <5 minutes (from start to send)
- Quote acceptance rate: >40%
- Time to first follow-up: <3 days
- Quote-to-close conversion: >40%

---

## 3. Service Scheduling (One-Time and Recurring)

**Primary User**: Dispatcher (Sarah)
**Duration**: 2-5 minutes per appointment
**Frequency**: 20-50 appointments per day
**Success Metric**: Route planning <30 min, drive time reduction >20%, double-booking <1%

### Flow 3A: One-Time Service Scheduling

#### Step 1: Access Scheduling Interface

**Trigger**: New customer needs first service, or existing customer requests one-time service

**Actions**:
1. Dispatcher opens scheduling calendar
2. View options:
   - **Week View**: Mon-Sun, all technicians (default)
   - **Day View**: Single day, all technicians
   - **Technician View**: Single technician, all days
3. Calendar displays:
   - Existing appointments (color-coded by service type)
   - Technician availability blocks
   - Time slots (30-min increments)
   - Capacity indicators (e.g., "6/10 appointments")

**Screen**: Scheduling Calendar (Week View)

**Filters**:
- Date range
- Technician
- Service type
- Status (confirmed, pending, completed, cancelled)

---

#### Step 2: Select Customer & Service

**Actions**:
1. Dispatcher clicks "+ New Appointment" or time slot on calendar
2. Appointment form opens
3. Select customer:
   - Search by name, phone, or address
   - Recent customers shown first
   - New customer: create on-the-fly
4. Select service type:
   - General pest control
   - Termite inspection
   - Bed bug treatment
   - Rodent control
   - Follow-up visit
   - Custom service
5. System displays:
   - Customer address (for route planning)
   - Customer notes (gate code, dogs, allergies)
   - Past service history (if existing customer)
   - Preferred technician (if any)

**Screen**: New Appointment Modal (Step 1: Customer & Service)

**Auto-Suggestions**:
- If customer has recurring service: Show next scheduled date
- If follow-up needed: Suggest date based on treatment type (e.g., bed bugs = 14 days)

---

#### Step 3: Assign Technician & Date/Time

**Actions**:
1. Dispatcher selects date:
   - Click date on calendar picker
   - System shows available technicians for that date
   - Capacity indicators: Green (available), Yellow (75% full), Red (full)
2. Dispatcher assigns technician:
   - **Auto-Assign** (recommended): System suggests best fit based on:
     - Territory match (customer ZIP code)
     - Skill match (termite cert if termite job)
     - Current workload (balance appointments)
     - Customer preference (same tech if requested)
   - **Manual Assign**: Select from dropdown of available techs
3. Dispatcher selects time window:
   - Morning (8am-12pm)
   - Afternoon (12pm-5pm)
   - Specific 2-hour window (e.g., 9-11am, 1-3pm)
4. System estimates duration:
   - General pest: 45-60 min
   - Termite inspection: 60-90 min
   - Bed bug treatment: 120-180 min
   - Rodent control: 60 min
   - Dispatcher can override
5. System checks for conflicts:
   - Double-booking prevention
   - Travel time between jobs (Google Maps API)
   - Technician lunch break
   - End-of-day cutoff

**Screen**: New Appointment Modal (Step 2: Technician & Time)

**Validation**:
- Cannot schedule in past
- Cannot exceed technician daily capacity (max 12 appointments)
- Must have >15 min travel time between appointments
- Warning if appointment outside technician's territory

---

#### Step 4: Add Appointment Details

**Actions**:
1. Dispatcher adds special instructions:
   - Gate code or entry instructions
   - Pet information (dog in yard)
   - Customer preferences (no interior treatment)
   - Urgency notes
2. Dispatcher sets confirmation status:
   - **Auto-Confirm**: Send confirmation immediately
   - **Pending**: Wait for customer confirmation (if tentative)
3. Dispatcher adds internal notes (not visible to customer):
   - Pricing notes
   - Follow-up requirements
   - Special considerations
4. Review appointment summary:
   - Customer name and address
   - Service type
   - Technician assigned
   - Date and time window
   - Estimated duration

**Screen**: New Appointment Modal (Step 3: Details)

**Optional Fields**:
- Purchase order number (commercial customers)
- Job number (for tracking)
- Linked to deal (if from sales pipeline)

---

#### Step 5: Confirm & Send Notifications

**Actions**:
1. Dispatcher clicks "Schedule Appointment"
2. System validates and saves appointment
3. System sends automated notifications:
   - **Customer**: Email + SMS confirmation
     - Appointment date and 2-hour time window
     - Technician name (optional)
     - Service type
     - "What to expect" details
     - Reschedule/cancel links
   - **Technician**: In-app + mobile notification
     - New appointment added to schedule
     - Customer address and phone
     - Service details
     - Special instructions
4. Appointment appears on calendar:
   - Color-coded block on tech's schedule
   - Shows customer name, time, service type
   - Click to view full details

**Screen**: Calendar View (Updated with New Appointment)

**Email to Customer**:
```
Subject: Appointment Confirmed - April's Pest Control

Hi [Customer Name],

Your pest control appointment is scheduled!

Date: [Day, Month Date, Year]
Time Window: [9:00 AM - 11:00 AM]
Service: [General Pest Control]
Address: [Customer Address]

What to Expect:
- Our technician will arrive during your 2-hour window
- We'll send a reminder 24 hours before your appointment
- You'll receive a text when the technician is 30 minutes away
- Service typically takes 45-60 minutes
- You'll receive a digital service report via email after completion

Need to reschedule? Click here: [Reschedule Link]
Questions? Call us at [Phone Number]

Thank you for choosing April's Pest Control!
```

**SMS to Customer**:
```
April's Pest Control: Your appointment is confirmed for [Date] between [9-11am]. We'll send a reminder tomorrow. Reply CANCEL to reschedule or call [Phone].
```

**Auto-Actions**:
- Add appointment to technician's mobile app schedule
- Create follow-up tasks:
  - Dispatcher: "Send 48-hour reminder" (auto)
  - Dispatcher: "Send 24-hour reminder" (auto)
  - Technician: "Complete service for [Customer]" (day of)

---

### Flow 3B: Recurring Service Setup

#### Step 1: Set Up Recurring Service Agreement

**Trigger**: Customer signs quote with recurring service option, or existing customer requests recurring plan

**Actions**:
1. Dispatcher (or sales rep) opens customer record
2. Click "Set Up Recurring Service"
3. Recurring service form:
   - **Service Type**: General pest, termite annual, rodent monthly
   - **Frequency**:
     - Weekly
     - Bi-weekly
     - Monthly (most common)
     - Quarterly
     - Annual
   - **Start Date**: First service date
   - **End Date** (optional): Contract expiration, or ongoing
   - **Preferred Day of Week** (for monthly): e.g., "First Tuesday"
   - **Preferred Time Window**: Morning or afternoon
   - **Auto-Schedule**: How many weeks/months to schedule ahead (default: 8 weeks)
4. System calculates:
   - Total visits per year
   - Next 12 service dates
   - Annual contract value
5. Assign preferred technician:
   - Customer prefers same tech for continuity
   - System defaults to territory technician
   - Fallback if tech unavailable
6. Add special instructions:
   - Seasonal adjustments (skip winter months)
   - Holiday blackout dates
   - Customer availability notes

**Screen**: Recurring Service Setup Form

**Validation**:
- Frequency must align with service type (termites = annual, not weekly)
- Start date cannot be in past
- If end date specified, must be after start date

---

#### Step 2: Generate Recurring Appointments

**Actions**:
1. System auto-generates appointments based on:
   - Start date
   - Frequency (e.g., every 4 weeks for monthly)
   - Preferred day of week (adjust to nearest)
   - Auto-schedule window (e.g., next 8 weeks)
2. System assigns each appointment:
   - Preferred technician (if available)
   - Fallback to territory tech if preferred unavailable
   - Default time window (based on customer preference)
3. System checks for conflicts:
   - Technician availability
   - Holiday blackouts (skip and reschedule)
   - Customer blackout dates
4. Dispatcher reviews generated schedule:
   - List of next 8-12 appointments
   - Dates, technician, status
   - Option to edit individual appointments
5. Dispatcher approves schedule
6. System saves recurring series:
   - Master record links all appointments
   - Each appointment flagged as "recurring"

**Screen**: Recurring Schedule Preview

**Auto-Schedule Logic**:
- Create appointments 8 weeks ahead (rolling)
- Every week, system generates new appointments to maintain 8-week horizon
- Skip holidays (configurable list: Thanksgiving, Christmas, New Year's)
- Adjust to nearest available day if preferred day unavailable

---

#### Step 3: Send Recurring Service Confirmation

**Actions**:
1. System sends confirmation to customer:
   - **Email**: Full recurring schedule (next 6 months)
   - **SMS**: Confirmation of recurring setup
2. Email includes:
   - Recurring service summary (frequency, service type)
   - Next 6 appointment dates (approximate)
   - Preferred technician name
   - Annual contract details
   - How to pause, reschedule, or cancel
   - Customer portal link (Phase 2)
3. System sends notification to technician:
   - New recurring customer in territory
   - Next appointment added to schedule
   - Customer preferences and notes

**Email to Customer**:
```
Subject: Recurring Service Scheduled - April's Pest Control

Hi [Customer Name],

Your recurring pest control service is now scheduled!

Service Plan: Monthly General Pest Control
Frequency: Every 4 weeks
Preferred Day: First Tuesday of the month
Preferred Time: Morning (9am-12pm)
Technician: Mike Johnson

Upcoming Appointments (next 6 months):
1. Tuesday, Jan 7, 2025 (9-11am)
2. Tuesday, Feb 4, 2025 (9-11am)
3. Tuesday, Mar 4, 2025 (9-11am)
4. Tuesday, Apr 1, 2025 (9-11am)
5. Tuesday, May 6, 2025 (9-11am)
6. Tuesday, Jun 3, 2025 (9-11am)

You'll receive reminders 48 hours and 24 hours before each appointment.

Need to make changes? Log in to your customer portal or call us at [Phone].

Thank you for your business!
```

**Auto-Actions**:
- Mark customer as "Recurring" in CRM
- Set up automated reminders for each appointment
- Create renewal task 60 days before contract end (if applicable)

---

#### Step 4: Ongoing Recurring Service Management

**Dispatcher Ongoing Tasks**:

**Weekly**:
1. System auto-generates new appointments (to maintain 8-week rolling schedule)
2. Dispatcher reviews newly generated appointments:
   - Verify technician assignments
   - Check for scheduling conflicts
   - Adjust as needed
3. System sends automated reminders:
   - 48 hours before: Email + SMS
   - 24 hours before: SMS
   - Morning of: SMS with ETA when tech en route

**Monthly**:
1. Review recurring service health:
   - Missed appointments (reschedule)
   - Customer complaints (flag for attention)
   - Technician rotation (if needed)
2. Identify at-risk customers:
   - Multiple reschedules
   - Declining service reports
   - Payment issues (Phase 2)

**Quarterly**:
1. Review renewal pipeline:
   - Contracts expiring in 90 days
   - Create renewal tasks for sales reps
   - Proactive customer satisfaction check-ins

**Customer Self-Service** (Phase 2):
- Reschedule next appointment
- Pause service (vacation)
- Update contact info or special instructions
- View upcoming schedule

---

#### Step 5: Handle Recurring Service Changes

**Common Scenarios**:

**Scenario A: Customer Reschedules Single Appointment**
1. Customer calls to reschedule next appointment
2. Dispatcher opens appointment on calendar
3. Drag-drop to new date/time
4. System asks: "Reschedule only this appointment, or all future?"
5. Dispatcher selects "Only this appointment"
6. System updates:
   - Moves single appointment
   - Leaves rest of recurring series unchanged
   - Sends updated confirmation to customer

**Scenario B: Customer Changes Recurring Schedule**
1. Customer requests permanent change (e.g., switch from Tuesday to Thursday)
2. Dispatcher opens recurring series
3. Click "Edit Recurring Series"
4. Update:
   - Preferred day of week: Thursday
   - Effective date: Next appointment or specific date
5. System regenerates all future appointments:
   - Past appointments unchanged
   - Future appointments adjusted to Thursday
6. Send confirmation of schedule change

**Scenario C: Customer Pauses Service (Vacation)**
1. Customer going on vacation, pause for 2 months
2. Dispatcher opens recurring series
3. Click "Pause Service"
4. Select pause period: Aug 1 - Sep 30
5. System:
   - Cancels appointments in pause window
   - Resumes recurring schedule after pause
   - Adjusts future dates to maintain frequency
6. Send confirmation of pause

**Scenario D: Customer Cancels Recurring Service**
1. Customer cancels contract
2. Dispatcher opens recurring series
3. Click "Cancel Recurring Service"
4. Select effective date: Immediate or after next appointment
5. System:
   - Cancels all future appointments
   - Keeps historical record of past appointments
   - Marks customer as "Inactive Recurring"
   - Notifies sales rep (potential churn)
6. Send cancellation confirmation to customer

**Screen**: Recurring Series Management Modal

**Success Metrics**:
- Recurring service adoption: >60% of customers
- Recurring appointment no-show rate: <3%
- Automated reminder delivery: >95%
- Customer satisfaction with recurring service: >4.5/5

---

### Flow 3C: Route Optimization (Dispatcher Workflow)

#### Step 1: Daily Route Planning

**Trigger**: Dispatcher starts workday (typically 7:00 AM, planning for current day)

**Actions**:
1. Dispatcher opens "Route Optimizer"
2. Select date (default: today)
3. System displays all scheduled appointments:
   - Grouped by technician
   - Sorted by time (chronological)
   - Color-coded by status:
     - Confirmed (green)
     - Pending (yellow)
     - At-risk (red: tight timing)
4. System calculates current route metrics:
   - Total appointments per tech (target: 8-12)
   - Total drive time per tech
   - Total service time per tech
   - Estimated end time
   - Route efficiency score (0-100)

**Screen**: Route Optimizer Dashboard

**Visual**: Map view showing all appointments as pins, with lines connecting them in current order

---

#### Step 2: Run Route Optimization

**Actions**:
1. Dispatcher clicks "Optimize Routes"
2. System runs optimization algorithm:
   - **Input**: All appointments for selected date and technicians
   - **Constraints**:
     - Time windows (customer availability: 9-11am, 1-3pm, etc.)
     - Technician shift hours (8am-5pm)
     - Service duration estimates
     - Lunch break (12-12:30pm)
     - Travel time between locations (Google Maps API)
   - **Optimization Goal**: Minimize total drive time while respecting constraints
3. System calculates optimized route:
   - Re-sequences appointments geographically
   - Clusters nearby appointments
   - Avoids backtracking
   - Balances workload across technicians
   - Respects time windows
4. System displays comparison:
   - **Current Route**: 120 minutes total drive time, 6 hours work
   - **Optimized Route**: 85 minutes total drive time, 5.5 hours work
   - **Savings**: 35 minutes (29% reduction), 0.5 hours earlier completion
5. Dispatcher reviews optimized route:
   - Side-by-side comparison (map and list)
   - Identify any issues (e.g., appointment moved outside time window)
   - Option to manually adjust

**Screen**: Route Optimization Results (Before/After Comparison)

**Algorithm** (MVP - Basic Clustering):
- Group appointments by geographic area (ZIP code)
- Sequence within each cluster by proximity (nearest neighbor)
- Respect time windows (sort by start time within cluster)
- Phase 2: Advanced algorithm with traffic data, historical patterns

---

#### Step 3: Apply Optimized Route

**Actions**:
1. Dispatcher reviews proposed changes:
   - List of appointments with new sequence
   - Updated estimated times
   - Any warnings (e.g., tight timing)
2. Dispatcher can:
   - **Accept All**: Apply optimization to all technicians
   - **Accept Selected**: Choose which techs to optimize
   - **Manual Adjustments**: Drag-drop appointments to fine-tune
3. Dispatcher clicks "Apply Optimization"
4. System updates:
   - Appointment sequence saved
   - Estimated times updated
   - Technician schedules refreshed
5. System notifies technicians:
   - Push notification: "Your route has been optimized"
   - Mobile app refreshes with new sequence
   - Option for tech to view route in Google Maps

**Screen**: Calendar View (Updated with Optimized Sequence)

**Technician Mobile View**:
- Appointments re-ordered on daily schedule
- Updated ETAs for each stop
- "Navigate to Next" button uses new sequence

---

#### Step 4: Monitor Routes Throughout Day

**Actions**:
1. Dispatcher monitors real-time status:
   - Technician locations (GPS tracking - Phase 2)
   - Appointment statuses:
     - Pending (not started)
     - En Route (tech navigating)
     - In Progress (tech on-site)
     - Completed
     - Running Late (behind schedule)
   - Updated ETAs based on actual completion times
2. Dispatcher handles issues:
   - **Technician Running Late**: Notify next customer of delay
   - **Emergency Call-In**: Insert into nearest tech's route
   - **Appointment Cancelled**: Remove from route, fill gap
   - **Technician Breakdown**: Reassign appointments to other techs
3. System auto-adjusts:
   - Recalculates ETAs if tech falls behind
   - Suggests route adjustments if significant delays
   - Sends automatic "running late" SMS to customers

**Screen**: Live Route Monitoring Dashboard

**Real-Time Updates**:
- Every 5 minutes: Sync technician status from mobile app
- Update ETAs based on actual vs estimated times
- Alert dispatcher if >30 min behind schedule

**Success Metrics**:
- Route planning time: <30 minutes (baseline: 120 minutes)
- Drive time reduction: >20%
- On-time arrival rate: >85% (within 30-min window)
- Route efficiency score: >75/100

---

## 4. Daily Technician Workflow

**Primary User**: Field Technician (Mike)
**Duration**: 6-8 hours (8-12 appointments)
**Frequency**: Daily (Mon-Fri)
**Success Metric**: Service completion <3 min, offline reliability 100%, adoption >90%

### Flow Steps

#### Step 1: Start of Day - Review Schedule

**Trigger**: Technician arrives at work (7:30 AM) or opens mobile app

**Actions**:
1. Technician opens mobile app (PWA)
2. App loads today's schedule (cached offline):
   - **Dashboard Summary**:
     - Total appointments today: 10
     - First appointment: 8:30 AM
     - Last appointment: 4:00 PM (estimated)
     - Total drive time: 85 minutes
     - Status: On Schedule
   - **Appointment List** (chronological):
     - Time window
     - Customer name
     - Address
     - Service type
     - Estimated duration
     - Special instructions (highlighted)
3. Technician reviews each appointment:
   - Tap to expand details
   - View customer notes (gate code, dogs, allergies)
   - View past service history
   - See products typically used
4. Technician loads vehicle:
   - Check chemical inventory
   - Verify equipment (sprayer, bait, traps)
   - Print service forms (backup if needed)
5. Technician marks "Ready for First Job"
   - Status updates to dispatcher: "Mike - En Route"

**Screen**: Mobile App - Daily Schedule (Dashboard)

**Offline Functionality**:
- Schedule cached on app open (WiFi at office)
- All customer data pre-loaded
- Service forms available offline
- Works with no connectivity

**Visual Design**:
- Card-based list (easy to scan)
- Color-coded by service type
- Swipe actions (Navigate, Call Customer, Start Job)

---

#### Step 2: Navigate to First Appointment

**Trigger**: Technician ready to leave for first job

**Actions**:
1. Technician taps first appointment card
2. Appointment details screen opens:
   - Customer info (name, phone, address)
   - Service type and notes
   - Estimated time window: 8:30-10:30 AM
   - Special instructions: "Gate code 1234, dog in backyard"
3. Technician taps "Navigate" button
4. App opens Google Maps:
   - Destination: Customer address
   - Optimized route displayed
   - ETA shown
5. Technician drives to customer location
6. App sends auto-notification to customer:
   - "Your technician is on the way! ETA: 8:45 AM"
   - (Triggered when tech starts navigation)

**Screen**: Appointment Detail → Google Maps (Navigation)

**Auto-Actions**:
- Appointment status: "En Route"
- Dispatcher dashboard updates (tech location if GPS enabled)
- Customer SMS: "Mike from April's Pest Control is on his way. ETA 8:45 AM. Track: [link]"

**Edge Cases**:
- **Can't Find Address**: Call customer (one-tap from app)
- **Wrong Address**: Update notes, notify dispatcher
- **Customer Not Home**: Mark "Customer Not Available", call dispatcher

---

#### Step 3: Arrive at Customer Property

**Trigger**: Technician arrives at customer location (within 100 meters, GPS)

**Actions**:
1. App detects arrival (geofence):
   - Shows notification: "You've arrived at [Customer Address]"
   - Suggests: "Start Job?"
2. Technician taps "Start Job"
3. App logs arrival time: 8:42 AM
4. App sends notification to customer:
   - "Your technician has arrived and will begin service shortly"
5. Technician approaches property:
   - Rings doorbell or knocks
   - Introduces self: "Hi, I'm Mike from April's Pest Control"
   - Confirms service details
   - Asks customer about any new pest issues
6. Technician accesses customer history on app:
   - Past services (dates, technician, treatment)
   - Photos from previous visits
   - Notes from last technician: "Ants in kitchen, baited pantry area"
   - Products previously used: "Termidor SC"

**Screen**: Appointment Detail → Customer History

**Customer Interaction**:
- Professional appearance (uniform, badge)
- Review service scope with customer
- Address customer questions or concerns
- Request access to interior/exterior
- Note any customer requests

---

#### Step 4: Conduct Inspection

**Trigger**: Service begins

**Actions**:
1. Technician performs walk-around inspection:
   - **Exterior**:
     - Perimeter foundation (cracks, entry points)
     - Windows and doors (gaps)
     - Yard (standing water, debris)
     - Exterior walls (ant trails, wasp nests)
   - **Interior** (if applicable):
     - Kitchen (ants, roaches)
     - Bathrooms (moisture issues)
     - Basement (spiders, moisture)
     - Attic (rodents, wasps)
2. Technician identifies pest activity:
   - Active infestations (live insects/rodents)
   - Evidence (droppings, shed skins, damage)
   - Entry points
   - Conducive conditions (moisture, clutter)
3. Technician takes pre-treatment photos:
   - Open app camera
   - Capture photos of:
     - Pest evidence (ant trail, rodent droppings)
     - Entry points (foundation crack)
     - Problem areas (standing water)
   - Tag photos by location:
     - Front, Back, Left Side, Right Side
     - Kitchen, Bathroom, Basement, Attic
   - App saves photos locally (offline)
4. Technician logs findings in app:
   - Pest type: Ants, Roaches, Spiders, Other
   - Severity: Low, Medium, High
   - Locations affected: Kitchen, Foundation, Yard
   - Conducive conditions: Moisture, Clutter, Debris
   - Recommended treatment: Interior + Exterior

**Screen**: Service Form (Step 1: Inspection)

**Inspection Checklist** (varies by service type):
- General pest: Quick visual inspection (10-15 min)
- Termite: Detailed inspection with moisture meter (45-60 min)
- Bed bugs: Room-by-room inspection (30-45 min)
- Rodents: Exterior perimeter, entry point focus (20-30 min)

---

#### Step 5: Perform Treatment

**Trigger**: Inspection complete, treatment plan determined

**Actions**:
1. Technician retrieves treatment products from vehicle:
   - Verify product selection:
     - Pest type: Ants → Termidor SC
     - Application method: Perimeter spray + spot treatment
   - Check product label (EPA requirements)
   - Prepare equipment (dilution, spray settings)
2. Technician applies treatment:
   - **Exterior Treatment**:
     - Spray perimeter foundation (3-foot band)
     - Treat entry points (windows, doors, cracks)
     - Apply granular bait (if needed)
     - Treat specific problem areas (ant mounds)
   - **Interior Treatment** (if needed):
     - Spot treat baseboards
     - Bait placement (kitchen, bathrooms)
     - Crack and crevice treatment
   - **Duration**: Typically 30-45 minutes
3. Technician logs treatment in app:
   - Open "Products Used" section
   - Select products from inventory list:
     - Product: Termidor SC
     - EPA Reg Number: 7969-210 (auto-populated)
     - Quantity: 2 oz (mixed with water)
     - Application method: Perimeter spray
     - Locations treated: Foundation, Entry Points
   - Add additional products if used:
     - Product: Maxforce Ant Bait Gel
     - Quantity: 1 tube
     - Locations: Kitchen baseboards
4. Technician notes any issues:
   - Customer requested no interior treatment
   - Could not access backyard (locked gate)
   - Heavy infestation, recommend follow-up in 2 weeks

**Screen**: Service Form (Step 2: Treatment)

**EPA Compliance**:
- All products have EPA registration numbers (auto-populated from inventory)
- Application rates and methods logged
- Technician license number recorded
- Data retained for 7 years (regulatory requirement)

---

#### Step 6: Post-Treatment Documentation

**Trigger**: Treatment complete

**Actions**:
1. Technician takes post-treatment photos:
   - Treated areas (foundation spray line)
   - Bait placements
   - Any remaining issues
   - Before/after comparison (if applicable)
2. Technician adds recommendations:
   - **For Customer**:
     - Keep doors/windows sealed
     - Fix moisture issues in basement
     - Remove debris from yard
     - Wait 24 hours before mopping treated areas
   - **For Company**:
     - Recommend follow-up in 2 weeks
     - Upsell termite inspection (saw mud tubes)
     - Flag for manager review (heavy infestation)
3. Technician calculates next service date:
   - Recurring monthly: Auto-calculated (4 weeks from today)
   - One-time with follow-up: 2 weeks for bed bugs, 4 weeks for general
   - Recurring quarterly: 12 weeks
   - App suggests date, tech can override
4. Technician reviews service form completeness:
   - Inspection notes: ✓
   - Pre-treatment photos: ✓ (5 photos)
   - Products used: ✓ (2 products logged)
   - Post-treatment photos: ✓ (3 photos)
   - Recommendations: ✓
   - Next service date: ✓

**Screen**: Service Form (Step 3: Post-Treatment)

**Quality Checks**:
- App validates required fields before allowing submission
- Warning if no photos uploaded (unusual)
- Warning if no products logged (possible error)

---

#### Step 7: Customer Signature & Completion

**Trigger**: Service complete, ready for customer sign-off

**Actions**:
1. Technician locates customer:
   - Knock on door or call customer
2. Technician reviews service with customer:
   - Explain what was done:
     - "I treated the perimeter foundation and entry points"
     - "Placed bait in the kitchen along baseboards"
   - Explain what customer should expect:
     - "You may see dead insects for 1-2 days as treatment works"
     - "Avoid mopping treated areas for 24 hours"
   - Provide recommendations:
     - "Seal the crack in your foundation to prevent re-entry"
     - "Fix the leaky pipe in the basement to reduce moisture"
   - Answer customer questions
   - Discuss next service:
     - "Your next service is scheduled for [Date]"
     - "We'll send you a reminder 48 hours before"
3. Technician requests customer signature:
   - Open signature screen in app
   - Hand phone/tablet to customer
   - Customer reads summary:
     - Service date and technician name
     - Services performed
     - Products used
     - Recommendations
   - Customer signs on screen (finger or stylus):
     - "I confirm that the above service was completed"
   - Customer returns device
4. Technician thanks customer:
   - "Thank you for your business!"
   - "If you see any issues before your next service, give us a call"
   - "You'll receive a service report via email within the hour"
5. Technician submits service form in app:
   - Tap "Complete Service"
   - App validates all required fields
   - If offline: Save to queue, sync when online
   - If online: Submit immediately
6. App processes completion:
   - Logs completion time: 9:47 AM (65 minutes total)
   - Marks appointment: "Completed"
   - Queues service report email to customer
   - Queues photo uploads (if offline)
   - Updates technician status: "Available for Next Job"

**Screen**: Service Completion → Signature Capture → Confirmation

**Customer Signature Screen**:
- Canvas for drawing signature
- Clear button (if customer makes mistake)
- Text: "I confirm that the service described above was completed to my satisfaction"
- Submit button

**Confirmation Screen**:
```
Service Completed!

Customer: [Name]
Date: [Date]
Time: 8:42 AM - 9:47 AM (65 minutes)
Products Used: Termidor SC, Maxforce Ant Bait Gel

A service report has been sent to [customer email].

Your next appointment is at:
[Next Customer Name]
[Address]
10:30 AM - 12:30 PM

[Navigate to Next Job]
```

**Auto-Actions**:
- Appointment status: "Completed"
- Service report generated (PDF)
- Email queued to customer (with photos and signature)
- Dispatcher notified of completion
- Next appointment highlighted on tech's schedule
- Customer satisfaction survey scheduled (24 hours)

---

#### Step 8: Navigate to Next Appointment

**Trigger**: Current service completed, next appointment pending

**Actions**:
1. Technician reviews completion summary
2. Technician taps "Navigate to Next Job"
3. App displays next appointment:
   - Customer: Jones Residence
   - Address: 123 Oak Street
   - Time Window: 10:30 AM - 12:30 PM
   - Service: Termite Inspection
   - Special Notes: "Access through side gate, large dog"
4. App opens Google Maps navigation
5. Technician drives to next location
6. **Repeat Steps 2-7** for each appointment

**Screen**: Next Appointment → Navigation

**Drive Time**:
- System estimated 15 minutes between jobs
- Actual drive time may vary (traffic, detours)
- App updates ETA for customer automatically

---

#### Step 9: Lunch Break

**Trigger**: Midday (typically 12:00-12:30 PM)

**Actions**:
1. Technician completes morning appointment
2. Technician taps "Start Lunch Break"
3. App logs break start time: 12:05 PM
4. App updates status: "On Break"
5. Dispatcher dashboard shows tech unavailable
6. Technician takes 30-minute break
7. Technician taps "End Lunch Break"
8. App logs break end time: 12:35 PM
9. App updates status: "Available"
10. Technician proceeds to afternoon appointments

**Screen**: Status Toggle (On Break / Available)

**Dispatcher View**:
- Technician status indicator: "On Break (12:05-12:35 PM)"
- No new appointments assigned during break

---

#### Step 10: End of Day - Sync & Review

**Trigger**: Technician completes last appointment, returns to office or goes home

**Actions**:
1. Technician completes final service
2. Technician taps "End Day"
3. App displays daily summary:
   - **Appointments Completed**: 10 / 10 (100%)
   - **Total Service Time**: 6 hours 15 minutes
   - **Total Drive Time**: 1 hour 22 minutes
   - **Total Work Time**: 7 hours 37 minutes
   - **Customer Satisfaction**: 4.8 / 5.0 (if surveys completed)
   - **Products Used**: Termidor SC (12 oz), Maxforce Gel (3 tubes)
4. Technician syncs offline data:
   - If offline during day, app auto-syncs when WiFi available
   - Photos uploaded (batch)
   - Service reports submitted
   - Appointment statuses updated
   - Product usage logged
5. Technician reviews tomorrow's schedule:
   - Preview next day's appointments
   - Note any special prep needed (termite inspection = bring moisture meter)
6. Technician closes app or leaves phone plugged in (auto-sync overnight)

**Screen**: End of Day Summary

**Sync Status**:
- "Syncing... 23 of 45 photos uploaded"
- "Sync complete! All data saved."
- "Sync failed. Will retry when online."

**Daily Performance Tracking**:
- Technician can view personal metrics:
  - Appointments per day (trend)
  - On-time arrival rate
  - Customer satisfaction ratings
  - Products used (for inventory planning)

**Success Metrics**:
- Service completion time: <3 minutes (from arrival to submission)
- Photo upload success rate: >95%
- Offline reliability: 100% (zero data loss)
- Technician satisfaction: >4.5/5

---

## 5. Service Completion and Follow-Up

**Primary User**: System (automated), Customer Service Rep (manual escalations)
**Duration**: 24-48 hours post-service
**Frequency**: After every service
**Success Metric**: Report delivery <1 hour, survey response rate >30%, satisfaction >4.5/5

### Flow Steps

#### Step 1: Service Report Generation

**Trigger**: Technician submits completed service form

**Actions** (Automated):
1. System receives service completion data:
   - Customer info
   - Service date and time
   - Technician name
   - Service type performed
   - Pest type and severity
   - Treatment methods and products used
   - Pre/post-treatment photos
   - Recommendations
   - Customer signature
   - Next service date
2. System generates PDF service report:
   - **Header**: Company logo, contact info
   - **Customer Details**: Name, address, service date
   - **Service Summary**: Service type, technician, time spent
   - **Inspection Findings**: Pest type, severity, locations
   - **Treatment Details**:
     - Products used (name, EPA number, quantity)
     - Application methods
     - Areas treated
   - **Photos**: Before and after (embedded in PDF)
   - **Recommendations**: Customer actions, future services
   - **Signature**: Customer signature image and timestamp
   - **Next Service**: Date and time (if recurring)
   - **Footer**: Terms, safety information, contact details
3. System validates report:
   - All required fields present
   - Photos uploaded successfully
   - Signature captured
   - EPA compliance data complete
4. System saves report:
   - Store PDF in AWS S3
   - Link to customer record
   - Link to service history
   - Backup to compliance archive (7-year retention)

**Processing Time**: <5 seconds

**Quality Checks**:
- Report generation failure rate: <0.1%
- All EPA-required data present: 100%

---

#### Step 2: Email Service Report to Customer

**Trigger**: Service report PDF generated successfully

**Actions** (Automated):
1. System queues email to customer:
   - Recipient: Customer email on file
   - Subject: "Service Report - April's Pest Control - [Date]"
   - Attach: Service report PDF
   - Body: Professional email template
2. System sends email via SendGrid:
   - Delivery within 1 hour of service completion
   - Track email delivery status
   - Track email opens and PDF downloads
3. System logs email activity:
   - Sent timestamp
   - Delivery status (delivered, bounced, failed)
   - Open timestamp (if customer opens)
   - Download timestamp (if customer downloads PDF)

**Email Template**:
```
Subject: Service Report - April's Pest Control - [Jan 15, 2025]

Hi [Customer Name],

Thank you for choosing April's Pest Control! Attached is your service report for today's visit.

Service Summary:
- Date: [January 15, 2025]
- Technician: Mike Johnson
- Service: General Pest Control
- Time: 8:42 AM - 9:47 AM

Treatment Performed:
- Exterior perimeter treatment
- Interior spot treatment (kitchen baseboards)
- Products used: Termidor SC, Maxforce Ant Bait Gel

Recommendations:
- Seal foundation crack on left side of house
- Fix leaky pipe in basement to reduce moisture
- Avoid mopping treated areas for 24 hours

Next Service:
Your next service is scheduled for [February 12, 2025] at 9:00 AM - 11:00 AM.

Questions or concerns? Reply to this email or call us at [Phone Number].

Thank you for your business!

April's Pest Control
[Website] | [Phone] | [Email]
```

**Attachments**:
- Service_Report_[CustomerName]_[Date].pdf (2-5 MB with photos)

**Delivery Target**: Within 1 hour of service completion

**Success Metrics**:
- Email delivery rate: >95%
- Email open rate: >40%
- PDF download rate: >20%
- Bounce rate: <2%

---

#### Step 3: Customer Satisfaction Survey

**Trigger**: 24 hours after service completion

**Actions** (Automated):
1. System waits 24 hours post-service (gives customer time to observe results)
2. System sends SMS survey:
   - Recipient: Customer mobile phone
   - Message: Short survey with link
3. Customer receives SMS:
   - "Hi [Name], how was your pest control service from April's? Rate your experience: [Link]"
4. Customer clicks link (opens mobile-friendly survey page):
   - Question 1: "How satisfied were you with your service?" (1-5 stars)
   - Question 2: "How likely are you to recommend us?" (1-10, NPS)
   - Question 3: "Was your technician professional and courteous?" (Yes/No)
   - Question 4 (optional): "Any additional comments or concerns?"
   - Submit button
5. Customer submits survey
6. System processes response:
   - Save to customer record
   - Calculate aggregate satisfaction metrics
   - Flag low scores for follow-up (≤3 stars)

**Survey Design**:
- Mobile-optimized (single column, large buttons)
- Takes <60 seconds to complete
- Optional comment box (not required)
- Thank you message after submission

**SMS Message**:
```
Hi [Customer Name], how was your pest control service on [Jan 15]? Rate your experience: [Short Link]

- April's Pest Control
Reply STOP to opt out.
```

**Survey Page** (Mobile):
```
April's Pest Control - Service Feedback

We'd love to hear about your experience!

1. How satisfied were you with your service?
[☆ ☆ ☆ ☆ ☆] (Tap to rate)

2. How likely are you to recommend us to a friend?
[1] [2] [3] [4] [5] [6] [7] [8] [9] [10]

3. Was your technician professional and courteous?
[Yes] [No]

4. Any additional comments? (optional)
[Text box]

[Submit Feedback]

Thank you for your time!
```

**Response Handling**:
- **High Score (4-5 stars)**: Automated thank-you email
- **Medium Score (3 stars)**: Log for review, no immediate action
- **Low Score (1-2 stars)**: Immediate alert to customer service rep

**Survey Metrics**:
- Response rate target: >30%
- Average satisfaction: >4.5 / 5.0
- NPS (Net Promoter Score): >50

---

#### Step 4: Handle Negative Feedback

**Trigger**: Customer rates service ≤2 stars or selects "No" for technician professionalism

**Actions** (Automated + Manual):
1. System immediately alerts customer service manager:
   - In-app notification: "Low satisfaction alert - [Customer Name]"
   - Email: "Urgent: Unhappy customer needs follow-up"
   - Includes:
     - Customer contact info
     - Service details (date, technician, service type)
     - Survey responses
     - Comments (if provided)
2. Customer service manager reviews within 4 hours:
   - Open customer record
   - Review service report and photos
   - Review survey feedback
   - Check service history (pattern of issues?)
3. Manager calls customer:
   - Apologize for poor experience
   - Ask for details: "What specifically went wrong?"
   - Identify root cause:
     - Treatment ineffective (pests still present)
     - Technician behavior (unprofessional, late)
     - Property damage (rare)
     - Billing issue (wrong charge)
   - Offer resolution:
     - Re-service at no charge (most common)
     - Refund or credit
     - Assign different technician
     - Manager visit for high-value customers
4. Manager logs resolution in CRM:
   - Issue type (treatment failure, service issue, technician behavior)
   - Resolution offered
   - Customer response (accepted, still unhappy, escalated)
   - Follow-up date (if re-service scheduled)
5. Manager schedules follow-up:
   - If re-service: Create appointment (high priority)
   - If refund: Process credit (Phase 2: billing integration)
   - If escalated: Notify owner/CEO
6. Manager follows up after resolution:
   - Call or email customer: "Did the re-service solve your issue?"
   - Request updated satisfaction rating
   - Document outcome

**Screen**: Customer Service Dashboard → Low Satisfaction Alerts

**Escalation Criteria**:
- Multiple low ratings for same technician: Flag for training or disciplinary action
- Multiple low ratings for same customer: Flag as potential churn risk
- Service failure for high-value customer: Escalate to owner

**Success Metrics**:
- Response time to low ratings: <4 hours
- Issue resolution rate: >90%
- Customer retention after complaint: >80%

---

#### Step 5: Positive Feedback & Testimonials

**Trigger**: Customer rates service 5 stars

**Actions** (Automated):
1. System sends thank-you email:
   - "Thank you for the 5-star review!"
   - Request online review (Google, Yelp):
     - "We'd love if you could share your experience on Google!"
     - [One-click link to Google review page]
   - Offer referral incentive (Phase 2):
     - "Refer a friend and get $25 off your next service!"
2. System flags as testimonial candidate:
   - If customer left positive comment, consider for marketing
   - Request permission to use as testimonial
3. System updates customer record:
   - Tag as "Promoter" (NPS 9-10)
   - Add to referral campaign list
   - Track review submission (if customer clicks link)

**Thank-You Email**:
```
Subject: Thank You for the 5-Star Review!

Hi [Customer Name],

Thank you so much for your 5-star rating! We're thrilled that Mike provided excellent service.

Would you mind sharing your experience on Google? It helps other homeowners find us!

[Leave a Google Review] (one-click link)

As a token of our appreciation, here's a $25 credit toward your next service. (Code: THANKYOU25)

We look forward to serving you again on [Next Service Date]!

Best regards,
April's Pest Control Team
```

**Google Review Link**:
- Direct link to Google My Business review page
- Pre-filled with business name (easy one-click review)

**Referral Program** (Phase 2):
- Promoters get $25 credit for each referred customer
- Referred customer gets $25 off first service
- Track referrals via unique codes

**Success Metrics**:
- Google review conversion rate: >15% of 5-star customers
- Referral rate: >20% of promoters refer a friend

---

#### Step 6: Recurring Service Reminder

**Trigger**: 48 hours before next scheduled appointment (for recurring customers)

**Actions** (Automated):
1. System identifies upcoming appointments:
   - Query: Appointments in next 48 hours, status "Scheduled"
2. System sends reminder email:
   - Recipient: Customer email
   - Subject: "Reminder: Pest Control Service Tomorrow"
   - Content: Appointment details, technician info, what to expect
3. System sends reminder SMS:
   - Recipient: Customer mobile phone
   - Message: "Reminder: April's Pest Control service tomorrow [Date] between [9-11am]. Reply YES to confirm or CANCEL to reschedule."
4. Customer responds:
   - **YES or no response**: Appointment confirmed (default)
   - **CANCEL or NO**: Trigger reschedule workflow
     - Customer service rep calls to reschedule
     - Or customer clicks link to self-reschedule (Phase 2)
5. System logs confirmation status:
   - Confirmed, Pending, or Needs Rescheduling

**Reminder Email**:
```
Subject: Reminder: Pest Control Service Tomorrow

Hi [Customer Name],

This is a friendly reminder that your pest control service is scheduled for tomorrow!

Appointment Details:
- Date: [January 15, 2025]
- Time Window: 9:00 AM - 11:00 AM
- Technician: Mike Johnson
- Service: General Pest Control (Monthly)

What to Expect:
- Mike will arrive during your 2-hour window
- You'll receive a text when he's 30 minutes away
- Service typically takes 45-60 minutes
- You'll get a service report via email after completion

Need to reschedule? Reply to this email or call us at [Phone].

See you tomorrow!
April's Pest Control
```

**Reminder SMS** (48 hours):
```
Reminder: April's Pest Control service tomorrow [Jan 15] 9-11am. Reply YES to confirm or CANCEL to reschedule. Questions? Call [Phone].
```

**Reminder SMS** (24 hours):
```
Reminder: Your pest control service is tomorrow [Jan 15] 9-11am with Mike. We'll text when he's on the way!
```

**Reminder SMS** (Day of, when tech en route):
```
Your technician Mike is on the way! ETA: 9:15 AM. Track: [link] Questions? Call [Phone].
```

**Success Metrics**:
- Reminder delivery rate: >95%
- Appointment confirmation rate: >80%
- No-show rate: <5% (with reminders, vs 15% without)

---

#### Step 7: Follow-Up for Multi-Visit Treatments

**Trigger**: Specific treatment protocols require follow-up (bed bugs, termites)

**Actions** (Automated + Manual):
1. System identifies treatments requiring follow-up:
   - Bed bugs: 2-week follow-up (second treatment)
   - Termites: 30-day inspection, 90-day follow-up
   - Heavy infestations: 2-week check-in
2. System auto-schedules follow-up appointment:
   - Based on treatment protocol
   - Assigns same technician (continuity)
   - Notifies dispatcher
   - Sends confirmation to customer
3. System creates task for technician:
   - "Follow-up visit for [Customer] - Bed Bug Treatment"
   - Includes notes from first visit
   - Photos from first visit for comparison
4. Technician completes follow-up:
   - Inspect for remaining pests
   - Retreat if necessary
   - Document results
   - Determine if additional follow-up needed
5. System tracks treatment success:
   - First-time fix rate (pest eliminated after one visit)
   - Multi-visit success rate (pest eliminated after protocol)
   - Flag chronic issues (pests return after treatment)

**Treatment Protocols**:

**Bed Bugs**:
- Visit 1 (Day 0): Initial treatment (heat or chemical)
- Visit 2 (Day 14): Follow-up treatment (catch any eggs that hatched)
- Visit 3 (Day 28): Final inspection (optional, if needed)
- Success rate target: >95% after 2 visits

**Termites** (Baiting System):
- Visit 1 (Day 0): Install bait stations
- Visit 2 (Day 30): Check stations, add bait if activity
- Visit 3 (Day 90): Check stations, assess colony elimination
- Visit 4+ (Quarterly): Ongoing monitoring
- Success rate target: Colony elimination within 6 months

**Heavy Infestations**:
- Visit 1 (Day 0): Aggressive treatment
- Visit 2 (Day 14): Follow-up treatment
- Visit 3 (Day 30): Verification treatment effective
- Success rate target: >90% elimination after 2 visits

**Success Metrics**:
- Follow-up appointment scheduling: 100% (for required protocols)
- Follow-up completion rate: >95%
- First-time fix rate: >85%
- Treatment protocol success rate: >90%

---

## 6. Dashboard Review (Sales Manager Perspective)

**Primary User**: Sales Manager (April)
**Duration**: 15-30 minutes
**Frequency**: Daily (morning review)
**Success Metric**: Time to insight <30 seconds, dashboard adoption >80%, forecast accuracy >70%

### Flow Steps

#### Step 1: Morning Dashboard Review

**Trigger**: Sales manager starts workday (8:00 AM)

**Actions**:
1. Manager logs into dashboard
2. Landing page: Executive Dashboard (default view)
3. Manager scans top-level KPIs:
   - **Monthly Recurring Revenue (MRR)**: $45,230 (↑ $3,200 from last month)
   - **Active Customers**: 412 (↑ 15)
   - **Sales Pipeline Value**: $87,500 (weighted: $52,500)
   - **Revenue This Month**: $38,450 (Goal: $50,000 - 77% of target)
   - **Customer Lifetime Value (CLV)**: $1,850
   - **Customer Acquisition Cost (CAC)**: $420 (CLV/CAC ratio: 4.4x ✓)
4. Manager reviews trend charts:
   - **Revenue Trend** (last 12 months): Steady growth, seasonal dip in Dec
   - **Customer Growth**: +8% month-over-month
   - **Churn Rate**: 1.8% (below target of 2%)
   - **Pipeline Funnel**: 45 leads → 28 qualified → 18 quotes → 8 won
5. Manager identifies areas needing attention:
   - Revenue 23% below monthly goal (needs to close $11,550 this week)
   - Pipeline healthy (3:1 coverage ratio)
   - Churn low (good retention)

**Screen**: Executive Dashboard (Overview)

**Visual Design**:
- KPI cards at top (large numbers, trend arrows)
- Charts below (line graphs, bar charts, funnel)
- Color-coded: Green (on track), Yellow (at risk), Red (urgent)
- Date range selector: This Month (default), Last Month, YTD, Custom

**Interaction**:
- Click any KPI to drill down into details
- Hover over chart points for exact values
- Export dashboard to PDF (for board meetings)

**Time to Insight**: <30 seconds to identify key trends

---

#### Step 2: Review Sales Pipeline

**Trigger**: Manager wants to understand sales forecast and identify at-risk deals

**Actions**:
1. Manager clicks "Sales Dashboard" in navigation
2. Sales-specific KPIs display:
   - **Leads Generated This Month**: 45 (32 from website, 8 referrals, 5 other)
   - **Lead Conversion Rate**: 28% (45 leads → 13 customers)
   - **Quote Acceptance Rate**: 44% (18 quotes sent → 8 accepted)
   - **Sales Cycle Duration**: 16 days (target: <18 days ✓)
   - **Pipeline Coverage Ratio**: 3.2:1 (healthy)
   - **Win/Loss Ratio**: 62% win rate
3. Manager reviews pipeline visualization (Kanban board):
   - **Lead Stage**: 17 leads ($42,500 potential)
   - **Inspection Scheduled**: 8 leads ($19,000)
   - **Quote Sent**: 12 deals ($28,750)
   - **Negotiation**: 5 deals ($18,500)
   - **Won This Month**: 8 deals ($22,400)
   - **Lost This Month**: 5 deals ($14,200)
4. Manager identifies at-risk deals:
   - Deals in "Quote Sent" stage for >7 days (stale)
   - High-value deals in "Negotiation" (need attention)
   - Deals past close date (overdue)
5. Manager clicks on at-risk deal:
   - **Customer**: ABC Commercial Property
   - **Value**: $8,500 (largest deal in pipeline)
   - **Stage**: Negotiation
   - **Close Date**: Jan 10 (5 days overdue)
   - **Last Activity**: Jan 8 (call, no answer)
   - **Status**: At Risk (red flag)
   - **Assigned To**: Sarah (sales rep)
6. Manager reviews deal activity history:
   - Jan 5: Quote sent ($9,000 initial)
   - Jan 7: Customer requested 10% discount
   - Jan 8: Revised quote sent ($8,500)
   - Jan 8: Call to customer (no answer, left voicemail)
   - Jan 10: Close date passed, no response
7. Manager takes action:
   - Sends message to Sarah: "Can you follow up on ABC Commercial today? Big deal, let me know if you need help closing."
   - Adds note to deal: "Manager following up"
   - Sets reminder for end of day: "Check status of ABC Commercial"

**Screen**: Sales Dashboard → Pipeline View (Kanban) → Deal Detail

**At-Risk Indicators**:
- Red flag icon: Deal overdue or stalled
- Yellow warning: Deal approaching close date with no recent activity
- Green checkmark: Deal on track

**Manager Actions Available**:
- Reassign deal to different rep
- Add discount approval (if rep requested)
- Add note or task
- Schedule call with customer (high-value deals)
- Mark deal as won/lost

**Success Metrics**:
- Pipeline visibility: 100% (all deals tracked)
- Forecast accuracy: >70% within 20%
- At-risk deal identification: <2 minutes

---

#### Step 3: Review Team Performance

**Trigger**: Manager wants to assess individual rep performance and provide coaching

**Actions**:
1. Manager scrolls to "Team Performance" section on Sales Dashboard
2. Leaderboard displays:
   - **Top Performers This Month**:
     - 1. Sarah: 5 deals won, $18,500 revenue, 65% win rate
     - 2. Mike: 3 deals won, $12,200 revenue, 55% win rate
     - 3. Lisa: 2 deals won, $7,800 revenue, 40% win rate
3. Manager reviews individual metrics (click rep name):
   - **Sarah's Dashboard**:
     - Deals won: 5 (goal: 6)
     - Revenue: $18,500 (goal: $20,000 - 93%)
     - Leads assigned: 18
     - Conversion rate: 28% (5 won / 18 leads)
     - Quote acceptance rate: 56% (5 won / 9 quotes)
     - Sales cycle: 14 days (excellent)
     - Activity: 42 calls, 28 emails, 12 meetings (highly active)
   - **Lisa's Dashboard** (underperforming):
     - Deals won: 2 (goal: 6 - only 33%)
     - Revenue: $7,800 (goal: $20,000 - only 39%)
     - Leads assigned: 15
     - Conversion rate: 13% (2 won / 15 leads - low)
     - Quote acceptance rate: 33% (2 won / 6 quotes - low)
     - Sales cycle: 24 days (slow)
     - Activity: 18 calls, 12 emails, 6 meetings (low activity)
4. Manager identifies coaching need:
   - Lisa is underperforming: low activity, slow sales cycle, low conversion
   - Root cause: Not following up quickly, not enough activity
5. Manager schedules coaching session:
   - Create task: "One-on-one coaching with Lisa - Sales process review"
   - Focus areas:
     - Increase activity (call leads within 4 hours)
     - Improve follow-up cadence (3-day follow-up on quotes)
     - Practice objection handling (low quote acceptance rate)
6. Manager reviews activity log for Lisa:
   - Last lead assigned: Jan 13 (3 days ago)
   - First contact: Jan 14 (1 day delay - too slow)
   - Last deal activity: Jan 10 (4 days ago - not following up)
7. Manager sends coaching message:
   - "Lisa, let's schedule a coaching session this week. I want to help you hit your goals. I noticed your activity is a bit low - let's talk about ways to speed up your follow-up process."

**Screen**: Sales Dashboard → Team Performance → Individual Rep Dashboard

**Coaching Triggers**:
- Low activity (below team average)
- Low conversion rate (<20%)
- Slow sales cycle (>21 days)
- Low quote acceptance (<35%)
- Missed quota 2 months in a row

**Manager Tools**:
- Side-by-side rep comparison
- Activity leaderboard (calls, emails, meetings)
- Conversion funnel by rep
- Time-to-respond metrics (lead assignment → first contact)

**Success Metrics**:
- Team quota attainment: >80%
- Coaching sessions with underperformers: Weekly
- Performance improvement after coaching: >50% of reps

---

#### Step 4: Review Operations Metrics

**Trigger**: Manager wants to ensure service delivery is smooth and customers are satisfied

**Actions**:
1. Manager clicks "Operations Dashboard"
2. Operations KPIs display:
   - **Service Completion Rate**: 97% (58 of 60 appointments completed)
   - **Technician Utilization**: 76% (within target of 70-80%)
   - **Average Appointments Per Day Per Tech**: 10.2 (target: 8-12 ✓)
   - **Route Efficiency**: 18% drive time reduction (from optimization)
   - **First-Time Fix Rate**: 88% (target: >85% ✓)
   - **Average Service Duration**: 52 minutes (within estimate)
3. Manager reviews technician workload:
   - **Today's Schedule**:
     - Mike: 12 appointments (full day)
     - Sarah: 9 appointments (moderate)
     - John: 8 appointments (light)
     - Lisa: 0 appointments (day off)
   - **This Week**:
     - Total appointments: 287
     - Total drive time: 38 hours (down from 46 hours last week)
     - Fuel savings: ~$120 (from route optimization)
4. Manager identifies issue:
   - 2 cancelled appointments today (3% of total)
   - Reason: "Customer Not Home" (both)
5. Manager drills down:
   - Customer 1: Mrs. Johnson (no-show, no call)
     - Action: Customer service rep to call and reschedule
   - Customer 2: XYZ Office Building (locked, no key access)
     - Action: Dispatcher to update customer notes (need key code)
6. Manager reviews customer satisfaction:
   - **Average Rating**: 4.7 / 5.0 (target: >4.5 ✓)
   - **NPS (Net Promoter Score)**: 58 (target: >50 ✓)
   - **Survey Response Rate**: 34%
   - **Recent Feedback** (last 5 surveys):
     - 5 stars: "Mike was great! Very professional."
     - 5 stars: "Fast and thorough service."
     - 4 stars: "Good service, but tech was 30 min late."
     - 5 stars: "Problem solved! Thank you!"
     - 2 stars: "Still seeing ants after treatment." (flagged for follow-up)
7. Manager reviews flagged issue (2-star rating):
   - Customer: Mr. Davis
   - Issue: "Still seeing ants after treatment"
   - Service Date: Jan 10 (5 days ago)
   - Action Taken: Customer service called, scheduled re-service for Jan 16
   - Status: Pending resolution

**Screen**: Operations Dashboard → Technician Workload → Customer Satisfaction

**Operations Alerts**:
- High no-show rate (>5%): Review reminder process
- Low utilization (<65%): Not enough appointments scheduled
- High utilization (>85%): Risk of burnout, hire more techs
- Low first-time fix rate (<80%): Training or product issue

**Manager Actions**:
- Reassign appointments (balance workload)
- Review route optimization (ensure efficiency)
- Address low satisfaction scores (follow up with customers)
- Monitor technician performance (coaching if needed)

**Success Metrics**:
- Service completion rate: >95%
- Technician utilization: 70-80%
- Customer satisfaction: >4.5/5
- Route efficiency improvement: >15%

---

#### Step 5: Review Financial Forecast

**Trigger**: Manager wants to project revenue for the month and identify gaps

**Actions**:
1. Manager clicks "Revenue Forecast" tab
2. Forecast display:
   - **Current Month (January)**:
     - Actual Revenue (MTD): $38,450
     - Projected Revenue (Forecast): $49,200
     - Goal: $50,000
     - Gap: -$800 (98% of goal - likely to hit!)
   - **Forecast Breakdown**:
     - Recurring Revenue (scheduled): $32,000 (high confidence)
     - Pipeline (weighted): $17,200 (medium confidence)
     - Total Projected: $49,200
3. Manager reviews forecast assumptions:
   - **Recurring Revenue**: Based on scheduled appointments
     - 280 appointments remaining this month
     - Average recurring service value: $114
     - Projected: $31,920
   - **Pipeline Revenue**: Based on deals in pipeline
     - 12 deals in "Quote Sent" or "Negotiation" stages
     - Total value: $39,000
     - Average win rate: 44%
     - Weighted value: $17,160
4. Manager reviews confidence levels:
   - **Conservative** (80% confidence): $45,800
   - **Likely** (50% confidence): $49,200
   - **Optimistic** (20% confidence): $53,400
5. Manager identifies action needed:
   - Need to close $800 more to hit goal (98% there)
   - Focus on 2 highest-value deals:
     - ABC Commercial ($8,500) - in negotiation
     - Smith Residence Termite ($4,200) - quote sent
   - If both close, will exceed goal by $12,700
6. Manager sets priorities for sales team:
   - Sarah: Focus on closing ABC Commercial (follow up today)
   - Mike: Follow up on Smith Residence quote (call this afternoon)
   - Lisa: Focus on new leads (build pipeline for next month)

**Screen**: Revenue Forecast (Current Month + Next 3 Months)

**Forecast Chart**:
- Line graph showing:
  - Actual revenue (MTD)
  - Projected revenue (forecast line)
  - Goal line (target)
  - Confidence bands (shaded area)

**Next Quarter Forecast**:
- February: $52,000 (projected)
- March: $55,000 (projected)
- April: $58,000 (projected)
- Based on:
  - Recurring revenue growth (new customers)
  - Pipeline coverage (healthy pipeline)
  - Seasonal trends (spring = busy season for pest control)

**Success Metrics**:
- Forecast accuracy: >70% within 20% of actual
- Goal attainment: >80% of months hit target
- Pipeline coverage: >3:1 (healthy)

---

#### Step 6: Export Reports for Stakeholders

**Trigger**: Manager needs to share metrics with CEO, investors, or team

**Actions**:
1. Manager prepares monthly report (end of month)
2. Manager clicks "Export" button on Executive Dashboard
3. Export options:
   - **PDF**: Professional formatted report (for board meetings, investors)
   - **CSV**: Raw data (for Excel analysis)
   - **Email**: Schedule automated email delivery
4. Manager selects "Export to PDF"
5. System generates report:
   - Cover page: Company logo, report title, date range
   - Executive Summary: Key metrics, highlights, concerns
   - Sales Metrics: Pipeline, conversion rates, revenue
   - Operations Metrics: Service completion, technician utilization, satisfaction
   - Financial Forecast: Revenue projections, goal attainment
   - Charts and Graphs: Visual representations
   - Appendix: Detailed data tables
6. Manager downloads PDF (5-10 pages)
7. Manager emails report to CEO:
   - Subject: "Monthly Performance Report - January 2025"
   - Attachment: Performance_Report_Jan2025.pdf
   - Body: "Key highlights: Revenue at 98% of goal, customer satisfaction 4.7/5, pipeline healthy for February."

**Screen**: Export Modal → PDF Preview → Download

**Scheduled Reports** (Automated):
- **Daily**: Operations snapshot (to dispatcher, techs)
  - Today's appointments
  - Completed vs pending
  - Any issues flagged
- **Weekly**: Sales pipeline summary (to sales team)
  - New leads
  - Deals won/lost
  - Activity metrics
  - Top performers
- **Monthly**: Executive summary (to CEO, investors)
  - Revenue, customers, MRR
  - Goal attainment
  - Forecast for next quarter
  - Key initiatives

**Success Metrics**:
- Report generation time: <10 seconds
- Report accuracy: 100% (matches dashboard data)
- Stakeholder satisfaction: >4.5/5

---

## Summary of User Flows

### Flow Completion Times (Targets)

| User Flow | Primary User | Duration | Success Metric |
|-----------|--------------|----------|----------------|
| Lead to Customer | Sales Rep | 7-21 days | >25% conversion |
| Quote Creation | Sales Rep | 5 minutes | >40% acceptance |
| One-Time Scheduling | Dispatcher | 2-5 minutes | <1% double-booking |
| Recurring Service Setup | Dispatcher | 10 minutes | >60% adoption |
| Daily Technician Workflow | Technician | 6-8 hours | <3 min per completion |
| Service Completion Follow-Up | System (Auto) | 24-48 hours | >95% delivery rate |
| Dashboard Review | Sales Manager | 15-30 minutes | <30 sec to insight |

### Critical Success Factors

**User Experience**:
- Minimal clicks (3-click rule: any task in ≤3 clicks)
- Mobile-first (thumb-friendly, offline-capable)
- Real-time updates (WebSocket for live data)
- Role-specific interfaces (don't overwhelm users)

**Automation**:
- Automated lead assignment (territory-based)
- Automated reminders (48h, 24h, day-of)
- Automated service reports (within 1 hour)
- Automated recurring scheduling (rolling 8-week window)

**Data Integrity**:
- Offline sync (zero data loss)
- Conflict resolution (last-write-wins)
- Audit trails (all changes logged)
- EPA compliance (7-year retention)

**Performance**:
- Page load <2s
- Mobile app load <3s on 3G
- API response <500ms
- Email delivery <1 minute

---

**Document Status**: Complete
**Next Steps**:
1. Use user flows to inform UI/UX design
2. Create wireframes for each screen
3. Identify API endpoints needed for each flow
4. Define database schema to support flows
5. Create feature specifications (FEATURE_SPECS.md)

**Approval**:
- [ ] Product Manager
- [ ] UX Designer
- [ ] Technical Lead
