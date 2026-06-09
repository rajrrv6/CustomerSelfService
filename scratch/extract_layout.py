chunk_path = "/Users/sudhir88/Desktop/CustomerSelfService/frontend/.next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_07vzeq5._.js"
output_path = "/Users/sudhir88/Desktop/CustomerSelfService/frontend/scratch/extracted_layout.js"

print("Extracting layout component lines...")

with open(chunk_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

start_idx = 1170
end_idx = 3500

with open(output_path, "w", encoding="utf-8") as out:
    for idx in range(start_idx, min(end_idx, len(lines))):
        out.write(f"{idx+1}: {lines[idx]}")

print(f"Extracted lines {start_idx+1} to {end_idx} to {output_path}")
