import os

chunk_files = [
    ".next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_0v31j2a._.js",
    ".next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_06ru1hn._.js",
    ".next/dev/static/chunks/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_0arocv~._.js",
    ".next/dev/server/chunks/ssr/0amv_CustomerSelfService_frontend_src_components_customer-portal_shared_0v31j2a._.js.map"
]

search_terms = [
    "customer_audit_logs",
    "customer_exports",
    "customer_sso_status",
    "customer_quotas",
    "customer_system_maintenance",
    "useActiveSessionTimer"
]

for cf in chunk_files:
    path = os.path.join("/Users/sudhir88/Desktop/CustomerSelfService/frontend", cf)
    if os.path.exists(path):
        print(f"\n====================================\nExamining {cf}...\n====================================")
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()
            print("Size:", len(content))
            
            for term in search_terms:
                pos = 0
                while True:
                    pos = content.find(term, pos)
                    if pos == -1:
                        break
                    print(f"\n--- Found '{term}' at index {pos} ---")
                    start = max(0, pos - 800)
                    end = min(len(content), pos + 1000)
                    print(content[start:end])
                    pos += len(term)
    else:
        print(f"{cf} does not exist.")
