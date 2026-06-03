import json

path = "/Users/sudhir88/.gemini/antigravity/brain/10de4e54-8492-48ab-8f1e-dfea70c6101e/.system_generated/logs/transcript.jsonl"

with open(path, 'r', encoding='utf-8') as f:
    for idx, line in enumerate(f):
        # We look for lines containing "refunds" and Arabic characters
        if "refunds" in line and "استرجاع" in line:
            print(f"Match at line {idx}:")
            # print up to 5000 characters from the match
            start_pos = line.find("refunds")
            print(line[max(0, start_pos - 100): start_pos + 4000])
            print("...")
            break
