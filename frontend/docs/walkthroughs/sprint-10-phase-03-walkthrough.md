# Sprint 10 Phase 3 Walkthrough — Scorecard Builder Restoration

## 1. Accomplished Features
- **Sidebar Navigation**: Placed the `scorecard_builder` link inside the Quality Assurance segment.
- **Scorecard templates list**: Shows searchable mock presets (General Chat, VIP, Refund Auditing) with metadata tags.
- **Dynamic editor canvas**: Adjust criteria details, adjust weights, toggle fatal errors, and select category tags (Branding, Security, SLA).
- **Scoring Simulator**: Interactive sandbox evaluating calibration thresholds.

## 2. Testing Walkthrough
1. Access the QA workspace.
2. Select **Scorecard Builder** in the sidebar.
3. Add a new criteria section and adjust the sliders to rebalance weights to 100%.
4. Test the live simulator by sliding a fatal-error item below 70% to trigger the `AUTO-FAIL` indicator.
5. Click **Publish** to sync status settings.
