# Sprint: Operations Analytics & QA CSAT Dashboards

## Goal
Build the Analytics Center dashboards to expose NPS/CSAT scores, customer sentiment insights, and QA surveys, resolving role visibility issues for QA Managers.

## Scope
- Surveys Tab configuration.
- Voice of Customer sentiment drivers.
- Customer satisfaction KPI calculations.
- QA Manager view RBAC mapping.

## Major Systems Implemented
* **Analytics Center Surveys Dashboard**: A metrics summary card grid showing CSAT scores, response rates, NPS distributions, and customer sentiment levels.
* **Sentiment Drivers Breakdown**: Categorized sentiment analysis showing customer feedback triggers (billing disputes, shipping delay reports) with color-coded positive/negative highlights.
* **QA Manager View Integration**: Modified the `QAManagerView.tsx` component routing to render the full `<SurveysTab />` module under the case 'surveys' switch statement, resolving blank screen bugs for QA manager logins.
* **CSAT & Sentiment Feedback Table**: Tabular review list including date, channel, satisfaction level, agent ID, sentiment score, and text comments.

## Decisions
* **Role-Based Visibility Logic**: Ensured the QA manager role has the same layout visibility permissions as Client Admins for CSAT/NPS feedback to facilitate scorecard evaluations.
* **Static Visual Analytics**: Used mock data matching the dubai-core data structure rather than third-party graphing libraries to avoid external network issues.

## Known Carryovers
- Live voice transcript NLP sentiment categorization.
