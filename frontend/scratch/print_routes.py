import re

extracted_path = "/Users/sudhir88/Desktop/CustomerSelfService/frontend/scratch/extracted_layout.js"

print("Searching for routes in extracted layout JS...")

with open(extracted_path, "r", encoding="utf-8") as f:
    content = f.read()

# Find occurrences of activeSubScreen === '...'
matches = re.finditer(r"activeSubScreen\s*===\s*'([^']+)'", content)

for m in matches:
    route = m.group(1)
    start_pos = max(0, m.start() - 100)
    end_pos = min(len(content), m.end() + 600)
    print(f"--- Route: {route} ---")
    print(content[start_pos:end_pos])
    print("=========================================\n")
