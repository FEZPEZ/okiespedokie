import os

OUTPUT_FILE = "combined_source_dump.txt"

# file extensions to include
VALID_EXTENSIONS = {".html", ".js"}

# eof marker
EOF_MARKER = "\n--- EOF ---\n"


def should_include(filename):
    _, ext = os.path.splitext(filename)
    return ext.lower() in VALID_EXTENSIONS


def main():
    root_dir = os.getcwd()

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out_file:

        for current_root, dirs, files in os.walk(root_dir):

            # optional: skip common junk folders
            dirs[:] = [
                d for d in dirs
                if d not in {
                    ".git",
                    "node_modules",
                    "__pycache__"
                }
            ]

            for filename in sorted(files):

                if not should_include(filename):
                    continue

                full_path = os.path.join(current_root, filename)

                # relative path for cleaner output
                relative_path = os.path.relpath(full_path, root_dir)

                print(f"Adding: {relative_path}")

                out_file.write("=" * 80 + "\n")
                out_file.write(f"FILE: {relative_path}\n")
                out_file.write("=" * 80 + "\n\n")

                try:
                    with open(full_path, "r", encoding="utf-8") as in_file:
                        out_file.write(in_file.read())

                except UnicodeDecodeError:
                    out_file.write(
                        "[ERROR: Could not decode file as UTF-8]\n"
                    )

                except Exception as e:
                    out_file.write(
                        f"[ERROR: {type(e).__name__}: {e}]\n"
                    )

                out_file.write(EOF_MARKER)
                out_file.write("\n\n")

    print(f"\nDone.")
    print(f"Output written to: {OUTPUT_FILE}")


if __name__ == "__main__":
    main()