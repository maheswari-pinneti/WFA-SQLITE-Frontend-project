# Production HTTPS & TLS Requirements

For production environments, all WFA traffic must be served over secure HTTPS (TLS 1.2 / 1.3) channels to ensure credentials and employee metrics cannot be intercepted in transit.

## 1. TLS Certificate Setup

### Let's Encrypt / Certbot Integration

Deploying with Let's Encrypt requires installing Certbot on the Nginx proxy server.

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d wfa.thestackly.com
```

### Renewal Automation

Certbot automatically configures a systemd timer or cron job for auto-renewal. Confirm with:

```bash
sudo systemctl status certbot.timer
sudo certbot renew --dry-run
```

## 2. Server Security Configuration

As specified in the [Nginx Config](file:///c:/Users/91970/Documents/WFA-SQLITE-Frontend-project/deployment/nginx.conf), Nginx should redirect all HTTP requests to HTTPS using a `301 Permanent Redirect`.

Ensure the following properties are configured:
- **Strict-Transport-Security (HSTS)**: Tells browsers to always connect via HTTPS for the next 2 years.
- **Allowed Protocols**: Restrict server handshake to `TLSv1.2` and `TLSv1.3`. Disable legacy TLS 1.0 and 1.1.
- **Secure Cookies**: If session cookies are used, ensure they specify the `Secure`, `HttpOnly`, and `SameSite=Strict` parameters.
