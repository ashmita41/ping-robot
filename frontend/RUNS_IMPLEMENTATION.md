# Runs & Metrics Page Implementation

## ✅ Completed: Runs & Metrics Page (`/runs`)

### Files Created/Updated

1. **`src/pages/Runs.jsx`** - Main runs & metrics page with tabs
2. **`src/components/MetricsCard.jsx`** - Metrics display component
3. **`src/components/RunsList.jsx`** - Updated to support showing all attempts
4. **`src/App.css`** - Added styles for tabs, pagination, and metrics

## Features Implemented

### ✅ Tab Navigation
- Two tabs: "Runs History" and "Metrics"
- Active tab highlighting
- Smooth tab switching
- State management for each tab

### ✅ Tab 1: Runs History

#### Filtering
- Filter by Schedule ID (dropdown from localStorage)
- Shows all schedules with their status
- "All Schedules" option to show all runs
- Resets pagination when filter changes

#### Pagination
- Configurable results per page (10, 20, 50, 100)
- First/Previous/Next/Last buttons
- Current page indicator
- Total runs count
- Disabled buttons at boundaries
- Smooth scroll to top on page change

#### Runs Display
- Shows all runs with full attempt details
- Run information:
  - Run ID (truncated)
  - Schedule ID
  - Status
  - Started timestamp
  - Number of attempts
- All attempts displayed (not just recent 5)
- Attempt details:
  - Status badge (color-coded)
  - Timestamp
  - Latency
  - Response size

#### Summary
- Shows "X of Y runs" count
- Loading state
- Error handling
- Empty state

### ✅ Tab 2: Metrics

#### Filtering
- Filter by Schedule ID (dropdown)
- "All Schedules" option for global metrics
- Real-time filter updates

#### Metrics Display

**Summary Cards:**
- Total Attempts
- Successful Attempts (green)
- Failed Attempts (red)
- Success Rate (color-coded: green ≥95%, yellow ≥80%, red <80%)
- Average Latency (formatted: ms or seconds)

**Status Code Distribution:**
- List of all status codes with counts
- Percentage of total attempts
- Visual progress bars
- Color-coded by status:
  - Green: 2xx (success)
  - Yellow: 4xx (client error)
  - Red: 5xx (server error)
- Sorted by count (highest first)

**Error Type Distribution:**
- List of all error types with counts
- Percentage of total attempts
- Visual progress bars
- Red color coding for errors
- Sorted by count (highest first)

#### Empty States
- No metrics available message
- No status codes/errors message

## API Calls Used

### Runs Tab
1. **GET /runs?limit=20&offset=0** - Get paginated runs
2. **GET /runs?schedule_id={id}&limit=20&offset=0** - Get filtered runs

### Metrics Tab
1. **GET /metrics** - Get global metrics
2. **GET /metrics?schedule_id={id}** - Get filtered metrics

## Component Structure

```
Runs Page
├── Header (Title)
├── Tabs
│   ├── Runs History Tab
│   └── Metrics Tab
└── Tab Content
    ├── Runs Tab Content
    │   ├── Filter Section
    │   ├── Runs Summary
    │   ├── RunsList Component
    │   └── Pagination
    └── Metrics Tab Content
        ├── Filter Section
        └── MetricsCard Component
            ├── Summary Cards
            ├── Status Code Distribution
            └── Error Type Distribution
```

## Data Flow

### Loading Runs
1. Tab becomes active or filters change
2. Builds query parameters (limit, offset, schedule_id)
3. Calls `getRuns(params)` from API service
4. Updates runs state and total count
5. Renders RunsList component

### Loading Metrics
1. Tab becomes active or filter changes
2. Builds query parameters (schedule_id if filtered)
3. Calls `getMetrics(params)` from API service
4. Updates metrics state
5. Renders MetricsCard component

### Pagination
1. User clicks pagination button
2. Updates offset state
3. Scrolls to top smoothly
4. Triggers runs reload with new offset

## Styling Features

### Tabs
- Clean tab design
- Active tab highlighting
- Hover effects
- Responsive (stacks on mobile)

### Pagination
- Centered pagination controls
- Disabled state styling
- Page info display
- Responsive layout

### Metrics Cards
- Grid layout for summary cards
- Color-coded values
- Distribution lists with progress bars
- Visual hierarchy
- Responsive design

### Filter Section
- Clean filter controls
- Dropdown styling
- Responsive layout

## Responsive Design

- Tabs stack vertically on mobile
- Filter section stacks on mobile
- Metrics summary cards become single column
- Pagination buttons stack on mobile
- All components adapt to screen size

## Error Handling

- API errors displayed to user
- Loading states for both tabs
- Empty states for no data
- Graceful handling of missing metrics

## Performance Considerations

- Separate state for each tab
- Only loads data when tab is active
- Efficient re-renders
- Pagination reduces data load

## Next Steps

1. Test with real run data
2. Verify pagination works correctly
3. Test filtering by schedule
4. Verify metrics calculations
5. Test responsive design

## Testing Checklist

- [ ] Tab switching works
- [ ] Runs load correctly
- [ ] Pagination works (First/Prev/Next/Last)
- [ ] Filter by schedule works
- [ ] Results per page changes work
- [ ] Metrics load correctly
- [ ] Metrics filter works
- [ ] Summary cards display correctly
- [ ] Status code distribution shows correctly
- [ ] Error type distribution shows correctly
- [ ] Progress bars render correctly
- [ ] Color coding is correct
- [ ] Empty states display
- [ ] Error messages show
- [ ] Loading states work
- [ ] Responsive design works

## Notes

- Uses localStorage schedules for filter dropdown
- Pagination is simple offset/limit based
- Metrics are calculated server-side
- All attempts shown in runs tab (not limited)
- Success rate color coding: ≥95% green, ≥80% yellow, <80% red
- Status codes and errors sorted by frequency
- Progress bars show percentage visually
- Smooth scrolling on pagination
