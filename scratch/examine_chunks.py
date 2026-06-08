import os

chunk_files = [
    ".next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_0v31j2a._.js",
    ".next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_06ru1hn._.js",
    ".next/dev/static/chunks/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_0arocv~._.js"
]

for cf in chunk_files:
    path = os.path.join("/Users/sudhir88/Desktop/CustomerSelfService/frontend", cf)
    if os.path.exists(path):
        print(f"Examining {cf}...")
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
            print("Size:", len(content))
            
            # Find occurrences of 'customer_org_switcher' or 'AuditLogViewer'
            pos = 0
            while True:
                pos = content.find("customer_org_switcher", pos)
                if pos == -1:
                    break
                print(f"\n--- Found customer_org_switcher at {pos} ---")
                start = max(0, pos - 1500)
                end = min(len(content), pos + 1500)
                print(content[start:end])
                pos += len("customer_org_switcher")
    else:
        print(f"{cf} does not exist.")
