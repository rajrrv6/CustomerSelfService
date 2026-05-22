import os

base_dir = "/Users/sudhir88/.gemini/antigravity/brain/908ce585-3bea-4f13-9253-8f2f5a5ed377"
query = "otpCodeInstructions"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".json") or file.endswith(".jsonl") or file.endswith(".txt") or file.endswith(".md"):
            path = os.path.join(root, file)
            try:
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if query in content:
                        print(f"Found '{query}' in file: {os.path.relpath(path, base_dir)} (size: {os.path.getsize(path)})")
            except Exception as e:
                pass
