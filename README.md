# Encrypted Note Sharing

Uçtan uca şifrelenmiş, tek kullanımlık veya süreli linklerle paylaşılan not
paylaşım servisi. Şifreleme ve çözme tamamen tarayıcıda (istemci tarafında)
yapılır; sunucu yalnızca opak bir şifreli blob saklar ve onu asla ayrıştırmaz
ya da yorumlamaz.

## Nasıl çalışır?

1. Tarayıcı, notu şifrelemek için rastgele bir **AES-GCM 256-bit** anahtar
   üretir (`frontend/src/lib/crypto.ts`).
2. Not, `[versiyon][iv][ciphertext+tag]` biçiminde bir "zarf" olarak
   şifrelenip base64url'e çevrilir ve sunucuya `encrypted_payload` olarak
   gönderilir.
3. Şifreleme anahtarı **hiçbir zaman sunucuya gönderilmez** — sadece paylaşım
   linkinin URL fragment'ında (`/s/<id>#k=<key>`) taşınır. Fragment
   sunucuya hiç ulaşmaz, yalnızca tarayıcıda kalır.
4. Alıcı linke gittiğinde tarayıcı `encrypted_payload`'ı sunucudan çeker,
   fragment'taki anahtarla yerel olarak çözer.
5. Not; süresi dolduğunda (TTL) veya görüntülenme limitine ulaştığında
   (`max_views`, varsayılan tek kullanımlık) sunucu tarafından otomatik
   olarak silinir. Süresi geçmiş kayıtlar periyodik bir arka plan görevi ile
   temizlenir.

Sunucu düz metin içeriği asla görmez; yalnızca şifreli veriyi, oluşturulma/son
geçerlilik zamanını ve görüntülenme sayacını saklar.

## Teknoloji Yığını

**Backend**
- FastAPI + Uvicorn
- SQLAlchemy (async) + aiosqlite (SQLite)
- Pydantic v2 / pydantic-settings
- slowapi (rate limiting)
- pytest / httpx

**Frontend**
- React 19 + TypeScript + Vite
- React Router, TanStack Query, React Hook Form + Zod
- Tailwind CSS v4, Radix UI / shadcn bileşenleri
- Web Crypto API (AES-GCM)

## Dizin Yapısı

```
app/
  api/        # Route/endpoint tanımları (APIRouter'lar)
  core/       # Konfigürasyon, veritabanı, rate limit ayarları
  models/     # SQLAlchemy ORM modelleri
  schemas/    # Pydantic request/response şemaları
  services/   # İş mantığı
tests/        # pytest testleri
frontend/     # React + Vite istemcisi
requirements.txt
```

## Kurulum

### Backend

```bash
pip install -r requirements.txt
cp .env.example .env   # gerekirse değerleri düzenleyin
uvicorn app.main:app --reload
```

API varsayılan olarak `http://localhost:8000` üzerinde, `/api/v1` altında
sunulur. Sağlık kontrolü: `GET /health`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # gerekirse VITE_API_BASE_URL'i düzenleyin
npm run dev
```

Varsayılan olarak `http://localhost:5173` üzerinde çalışır ve API'ye
`VITE_API_BASE_URL` (varsayılan `http://localhost:8000`) üzerinden bağlanır.

## Ortam Değişkenleri (Backend)

| Değişken | Açıklama | Varsayılan |
|---|---|---|
| `APP_NAME` | Uygulama adı | `Encrypted Note Sharing` |
| `DATABASE_URL` | Async SQLAlchemy bağlantı dizesi | `sqlite+aiosqlite:///./notes.db` |
| `DEFAULT_TTL_SECONDS` | Not için varsayılan geçerlilik süresi | `86400` |
| `DEFAULT_MAX_VIEWS` | Varsayılan maksimum görüntülenme sayısı | `1` |
| `CLEANUP_INTERVAL_SECONDS` | Süresi dolan notların temizlenme aralığı | `300` |
| `CORS_ORIGINS` | İzin verilen origin'ler (virgülle ayrılmış) | `http://localhost:3000,http://localhost:5173` |
| `DATABASE_BUSY_TIMEOUT_SECONDS` | SQLite busy timeout | `15.0` |
| `CREATE_SECRET_RATE_LIMIT` | Not oluşturma endpoint'i için rate limit | `20/minute` |

## API

| Metot | Yol | Açıklama |
|---|---|---|
| `POST` | `/api/v1/secrets/` | Şifreli notu oluşturur, `id`, `expires_at`, `max_views` döner |
| `GET`  | `/api/v1/secrets/{id}` | Notu getirir ve görüntülenme sayacını artırır; limit dolduysa veya süresi geçtiyse `404` döner |
| `GET`  | `/health` | Sağlık kontrolü |

## Testleri Çalıştırma

```bash
pytest
```

Testler `httpx.AsyncClient` ile FastAPI uygulamasına doğrudan istek gönderir,
ayrı bir sunucu ayağa kaldırmaya gerek yoktur.

## Güvenlik Notları

- Şifreleme anahtarı asla sunucuya veya HTTP loglarına düşmez; yalnızca
  paylaşım linkinin URL fragment'ında bulunur.
- Link'i kim ele geçirirse notu okuyabilir — bu nedenle linki güvenilir
  kanallardan paylaşın.
- Notlar varsayılan olarak tek kullanımlıktır; ilk görüntülemeden sonra
  sunucudan silinir.
