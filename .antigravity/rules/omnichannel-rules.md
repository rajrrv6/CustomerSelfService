# Omnichannel Configuration Rules

## 1. Persona Access Segregation
- **Super Admin**: Manages direct provider connectivity, credentials (Twilio, Meta, Plivo, SendGrid), SIP dial configurations, and global routing engine metrics.
- **Client Admin**: Customizes local business attributes (support operation windows, default queue routing, bot pre-triage limits, welcome messages, and template registers).

## 2. Channel Representation
- Standardize metadata properties for customer catalogs. Channels must contain status, AI toggles, routing modes, assigned queues, SLA baselines, and volume metrics.
- Enforce active/inactive translation keys to avoid raw status tags in user interfaces.

## 3. Template Registering
- Message template management layouts must display approved/pending/rejected badges, language variations, usage stats, and dynamic variable previews.
