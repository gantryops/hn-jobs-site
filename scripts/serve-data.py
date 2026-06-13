#!/usr/bin/env python3
"""Minimal static file server with CORS headers for local development."""
import http.server
import sys
import os

PORT = 3001
DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "hn-jobs-data"))


class CORSHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "*")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()


if __name__ == "__main__":
    print(f"Serving {DIRECTORY} on http://localhost:{PORT}")
    http.server.HTTPServer(("", PORT), CORSHandler).serve_forever()
