import json

path = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377/.system_generated/logs/transcript.jsonl"
query = "otpCodeInstructions"

with open(path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        if query in line:
            print(f"Line {idx}: length {len(line)}")
            # Find all occurrences of query and print surrounding context (1000 characters)
            pos = line.find(query)
            while pos != -1:
                print(f"Occurrence at pos {pos}:")
                # Print 1000 characters before and 3000 characters after
                start = max(0, pos - 1000)
                end = min(len(line), pos + 3000)
                print(line[start:end])
                print("====================================")
                pos = line.find(query, pos + 1)
