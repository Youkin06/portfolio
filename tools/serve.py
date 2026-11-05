# 確認用のローカルサーバー。ブラウザにファイルを覚えさせない（毎回最新を読み込む）ので、
# 直したのに古い見た目のまま、ということが起きない。
#   python3 tools/serve.py        （リポジトリ直下で。ポートを変えるときは python3 tools/serve.py 8001）
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
http.server.ThreadingHTTPServer(('127.0.0.1', port), NoCacheHandler).serve_forever()
