# Digital Clan Books — Production Roadmap

## Phase 1: Security Blockers (P0)
- [x] Production config validation (`APP_ENV`, strong secrets)
- [x] Seed: create admin only if missing (never reset password)
- [x] JWT error handling, disable `/docs` in production
- [x] Unpublished books hidden from non-admins
- [x] Remove hardcoded admin credentials from frontend
- [x] Nginx security headers + rate limiting on login/admin

## Phase 2: Operations & Hardening
- [x] Backend Docker healthcheck + `/ready` endpoint
- [x] Structured JSON logging + request middleware
- [x] Audit log service (auth, admin upload)
- [x] Upload validation (size, magic bytes, business rules)
- [ ] HTTPS/TLS enabled with real certificates

## Phase 3: Payments (Revenue)
- [x] PayPal webhook handler + subscription persistence
- [x] `GET /subscriptions/status` for frontend
- [ ] PayPal JS SDK checkout on frontend
- [ ] Full webhook signature verification via PayPal API

## Phase 4: Ops & Quality
- [x] `migrate.py` for one-off migration runs
- [x] Initial pytest suite
- [ ] Pin `requirements.txt` versions
- [ ] Staging deploy guide
