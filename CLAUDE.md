# CLAUDE.md

Bu dosya, bu depoda çalışırken Claude Code'a (claude.ai/code) rehberlik eder.

## Proje Özeti

Encrypted Note Sharing: Kullanıcıların uçtan uca şifrelenmiş notlar oluşturup
tek kullanımlık veya süreli linklerle paylaşabildiği bir FastAPI servisi.
Sunucu, notların düz metin içeriğini asla görmez; şifreleme/çözme istemci
tarafında yapılır, sunucu yalnızca şifreli veriyi saklar.

## Teknoloji Yığını

- **FastAPI** — HTTP API katmanı
- **Uvicorn** — ASGI sunucusu
- **SQLAlchemy** (async) + **aiosqlite** — veritabanı erişimi (SQLite)
- **Pydantic v2 / pydantic-settings** — veri doğrulama ve konfigürasyon
- **pytest / httpx** — test

## Dizin Yapısı

```
app/
  api/        # Route/endpoint tanımları (APIRouter'lar)
  core/       # Konfigürasyon, güvenlik yardımcıları, ayarlar (Settings)
  models/     # SQLAlchemy ORM modelleri
  schemas/    # Pydantic request/response şemaları
  services/   # İş mantığı (route'lardan çağrılan servis katmanı)
tests/        # pytest test dosyaları
requirements.txt
```

## Mimari Kurallar

- Route handler'lar (`app/api`) ince tutulur: doğrulama + servis çağrısı.
  İş mantığı `app/services` içinde yaşar.
- Veritabanı modelleri (`app/models`) ile dışa açılan API şemaları
  (`app/schemas`) birbirinden ayrı tutulur; ORM nesneleri doğrudan
  response olarak dönülmez.
- Konfigürasyon `app/core/config.py` içinde `pydantic-settings` ile
  ortam değişkenlerinden okunur; sabit değerler kod içine gömülmez.
- Şifreleme/çözme mantığı sunucuda çalıştırılmaz — istemci, IV/nonce'u
  da içeren ciphertext'i tek bir opak `encrypted_payload` string'i
  olarak encode edip gönderir; sunucu bu blobu şeffaf biçimde saklar,
  içeriğini asla ayrıştırmaz veya yorumlamaz.

## Geliştirme Komutları

```bash
# Bağımlılıkları kur
pip install -r requirements.txt

# Geliştirme sunucusunu başlat
uvicorn app.main:app --reload

# Testleri çalıştır
pytest
```

## Notlar

- Yeni endpoint eklerken önce `app/schemas` içinde request/response
  modelini, sonra `app/services` içinde iş mantığını, en son
  `app/api` içinde route'u tanımla.
- Test yazarken `httpx.AsyncClient` ile FastAPI uygulamasına doğrudan
  istek gönder (gerçek sunucu ayağa kaldırmadan).
