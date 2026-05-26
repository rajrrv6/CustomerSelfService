# Localization & RTL Mirroring Rules

## 1. Dynamic RTL Mirroring
- Ensure all layouts support runtime mirroring. When `lang === 'ar'`, apply `dir="rtl"` to main container nodes. Flipped margin, padding, and flex direction states must align properly.
- Flipped control icons (such as chevrons and back buttons) must be rendered conditionally to prevent backward arrows in Arabic views.

## 2. Dictionary-Driven Text
- Feed text structures using the localized translation dictionary mappings (`translations[lang]` or local dictionary lookups) to prevent hardcoded language keys in frontend files.
- Always add corresponding Arabic translations when creating new keys or labels to maintain bilingual synchronization.
