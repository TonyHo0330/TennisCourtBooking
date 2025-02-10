import hashlib
import hmac
import base64
import time
import json

# LINE Pay 設定
LINE_PAY_CHANNEL_ID = "2006880335"
LINE_PAY_CHANNEL_SECRET = "b0cd3d6d9ca1efcbe7c93de47f7c639b"
LINE_PAY_MERCHANT_ID = "test_202502101822"
LINE_PAY_API_URL = "https://sandbox-api-pay.line.me"

def generate_signature(secret, data):
    """ 使用 HMAC-SHA256 產生 LINE Pay API 的簽名 """
    hash = hmac.new(secret.encode("utf-8"), data.encode("utf-8"), hashlib.sha256).digest()
    return base64.b64encode(hash).decode("utf-8")

def get_headers(payload):
    """ 產生符合 LINE Pay API 的 Headers """
    nonce = str(int(time.time()))  # 以時間戳記作為 Nonce
    signature = generate_signature(LINE_PAY_CHANNEL_SECRET, json.dumps(payload))
    
    return {
        "Content-Type": "application/json",
        "X-LINE-ChannelId": LINE_PAY_CHANNEL_ID,
        "X-LINE-Authorization-Nonce": nonce,
        "X-LINE-Authorization": signature
    }
