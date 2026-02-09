# GitHub Actions Setup Guide

## Automatyczne scrapowanie newsów

Ten projekt używa GitHub Actions do automatycznego scrapowania i przetwarzania newsów co 3 godziny.

## 🔑 Konfiguracja Secrets

Aby workflows działały, musisz dodać następujące **GitHub Secrets**:

### Jak dodać secrets:
1. Idź do swojego repo na GitHub
2. **Settings** → **Secrets and variables** → **Actions**
3. Kliknij **"New repository secret"**
4. Dodaj każdy secret z poniższej listy:

### Wymagane secrets:

```
SUPABASE_URL
Wartość: (Twoja baza Supabase URL - np. https://xyz.supabase.co)

SUPABASE_KEY
Wartość: (Twój klucz Service Role - sb_secret_...)

GEMINI_API_KEY
Wartość: (Twój klucz Google Gemini API)

YOUTUBE_API_KEY
Wartość: (Twój klucz YouTube Data API v3)

REDDIT_CLIENT_ID
Wartość: (Opcjonalnie - ID aplikacji Reddit)

REDDIT_CLIENT_SECRET
Wartość: (Opcjonalnie - Secret aplikacji Reddit)

REDDIT_USER_AGENT
Wartość: (Opcjonalnie - User Agent dla Reddit)
```

## 📅 Workflows

### 1. `news-scraper.yml` - Automatyczny scraping
- **Uruchamia się:** Co 3 godziny automatycznie
- **Co robi:** Scrapuje newsy z YouTube/Reddit, podsumowuje przez AI, zapisuje do Supabase
- **Ręczne uruchomienie:** Actions tab → "AI News Scraper" → "Run workflow"

### 2. `test-scraper.yml` - Test (Dry Run)
- **Uruchamia się:** Tylko ręcznie
- **Co robi:** Testuje scraper bez zapisywania do bazy
- **Kiedy użyć:** Do testowania przed deploymentem zmian
- **Ręczne uruchomienie:** Actions tab → "Test Scraper (Dry Run)" → "Run workflow"

## 🚀 Pierwsze uruchomienie

Po dodaniu secrets:

1. Idź do **Actions** tab w swoim repo
2. Kliknij **"Test Scraper (Dry Run)"**
3. Kliknij **"Run workflow"** → wybierz branch `main` → **"Run workflow"**
4. Poczekaj ~2-3 minuty
5. Sprawdź logi czy wszystko działa
6. Jeśli OK, kliknij **"AI News Scraper"** i uruchom pierwszy prawdziwy scraping!

## 📊 Monitoring

- **Logi:** Actions tab → kliknij na workflow run → kliknij na job
- **Artifacts:** Pobierz logi ze strony workflow run (sekcja "Artifacts")
- **Failures:** GitHub wyśle email jeśli workflow fail'nie

## ⚙️ Dostosowanie

### Zmiana częstotliwości scrapingu

Edytuj `.github/workflows/news-scraper.yml`:

```yaml
schedule:
  # Co 1 godzinę
  - cron: '0 * * * *'
  
  # Co 6 godzin
  - cron: '0 */6 * * *'
  
  # Codziennie o 9:00 i 18:00 UTC
  - cron: '0 9,18 * * *'
```

### Limit items per source

Edytuj `main_agent.py` linijkę 59:
```python
future_youtube = executor.submit(fetch_youtube_videos, YOUTUBE_CHANNELS, max_results=10)
# Zmień 10 na inną liczbę
```

## 🐛 Troubleshooting

### Workflow nie uruchamia się automatycznie
- Sprawdź czy repo jest **publiczne** (GitHub Actions dla cron wymaga public repo na free plan)
- Lub sprawdź czy masz wystarczające GitHub Actions minutes

### "Supabase credentials missing"
- Sprawdź czy dodałeś wszystkie secrets w Settings → Secrets → Actions

### "API quota exceeded"
- Gemini API: 15 requests/min limit - dodaj delay w kodzie
- YouTube API: 10,000 units/day - zmniejsz `max_results`

## 📈 Statystyki

Po kilku dniach działania:
- Sprawdź Actions tab → All workflows
- Zobacz success rate i czas wykonania
- Zoptymalizuj jeśli potrzeba

---

**✅ Po skonfigurowaniu masz fully automated AI news aggregator!** 🚀
