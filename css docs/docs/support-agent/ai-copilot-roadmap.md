# Support Agent Workspace — AI Copilot Roadmap

This roadmap details the design, technical integration, and user experience patterns for the AI Copilot within the Support Agent Workspace.

---

## 1. Core AI Workflows & Features

### A. Streaming AI Generation
* **Integration**: Renders AI suggestions inside the composer in real-time using local asynchronous streams.
* **UX Pattern**: Draft text streams in using a blinking cursor block. The composer is locked during streaming, and a "Stop Generation" button is visible to allow agents to cancel the action.
* **Fallback**: If the stream is interrupted, the composer retains the text generated up to that point.

### B. Rewrite Workflows
* **Tone Adjustments**: Agents can rewrite draft replies in three default tones:
  * *Professional*: Rephrases informal text with corporate vocabulary.
  * *Empathetic*: Appends customer-first validations (e.g. "I understand this is frustrating").
  * *Concise*: Trims wordy descriptions, keeping only critical action steps.
* **UI Controls**: Tones are selected via a dropdown menu anchored next to the "Rewrite" button.

### C. Summarize Workflows
* **Chat Summarization**: Condenses long chat histories into structured bullet points (Context, Actions Taken, Resolution).
* **Triggers**: Can be triggered manually via a button in the composer or automatically when a conversation is transferred.
* **Output Display**: Summaries render in an overlay modal, with a "Copy to Composer" button to help write internal notes or resolution summaries.

---

## 2. Intelligence & Knowledge Capabilities

### A. Multilingual AI
* **Dual-Language Translation**: Automatically translates incoming Arabic messages to English (and vice versa) in real-time.
* **UI Pattern**: Translated text displays as a sub-text block beneath the original message.
* **Composer Support**: The composer includes an "Auto-Translate on Send" toggle for writing replies in the customer's language.

### B. Contextual AI Memory
* **Customer Profile Sync**: Pulls previous case resolutions, loyalty tiers, and customer sentiment trends from the customer profile seed data.
* **Dynamic Suggestions**: Adjusts suggested replies based on customer context (e.g., automatically applying fee-waiver suggestions for VIP clients).

### C. RAG Citation Previews
* **Article Matches**: The AI Copilot lists matching articles from the Knowledge Base (e.g., Refund Policy, Setup Guide) alongside suggested replies.
* **Citation Tooltip**: Hovering over an article link displays a tooltip showing the query match percentage and a brief summary. Clicking the link opens the article in the Customer 360 panel.

---

## 3. Compliance, Safety, & UX Controls

### A. AI Feedback Workflows
* **Quality Ratings**: Agents can rate suggested replies using thumbs-up/thumbs-down icons.
* **Correction Feedback**: Submitting a rating updates local tracking to log the feedback.

### B. AI Compliance UX (PII Masking)
* **Real-time Filter**: A client-side validation utility scans draft text for personal data (credit cards, Saudi National IDs, email addresses) before sending prompts to the LLM simulator.
* **Visual Indicator**: A banner displays at the bottom of the composer: "Compliance Shield Active — Sensitive Data Masked".

### C. Hallucination Handling UX
* **Fact Verification Highlights**: Claims matching sensitive data (dates, payment amounts, policy codes) are highlighted in yellow in suggestions.
* **Verification Checks**: Hovering over a highlighted claim displays the source article name to encourage the agent to verify the information.

### D. AI Loading & Error States
* **Sparkle Spinner**: The copilot panel shows a pulsing sparkle skeleton layout during simulated processing.
* **Offline Warning**: If the mock AI service fails, the panel displays a message: "AI Copilot Offline — Local Macros Available".
