import os

ROOT = "."
OUTPUT_FILE = "dump.txt"
EXTENSIONS = {".js", ".html", ".css"}

with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
    for root, _, files in os.walk(ROOT):
        for name in files:
            ext = os.path.splitext(name)[1].lower()
            if ext in EXTENSIONS:
                path = os.path.join(root, name)
                try:
                    with open(path, "r", encoding="utf-8") as f:
                        content = f.read()
                except Exception:
                    continue

                out.write(f"###[{path}]###\n\n")
                out.write(content)
                out.write("\n\n###EOF###\n\n")
