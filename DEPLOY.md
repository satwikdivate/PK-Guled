# Deploying to an Ubuntu VM with Docker

The Docker build does everything: installs packages, converts the photos in `raw-images/`, prerenders every page, and copies only the finished static files into a small non-root nginx image listening on port 8080. The final image does not contain `node_modules`, source code or `raw-images`.

## 1. Install Docker Engine and the compose plugin

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Run docker without sudo (log out and back in afterwards)
sudo usermod -aG docker $USER
docker --version && docker compose version
```

## 2. Copy the project and the photos to the VM

Clone the private repository (the photos in `raw-images/` are part of it, about 86 MB):

```bash
git clone https://github.com/satwikdivate/PK-Guled.git pkguled && cd pkguled
```

GitHub asks for a username and a personal access token (Settings → Developer settings → Personal access tokens, scope `repo`) because the repository is private.

Check on the VM that `~/pkguled/raw-images/01 Pure Silk Ilkal Handloom Sarees/` exists.

## 3. Build and start

```bash
cd ~/pkguled
HOST_PORT=8080 docker compose up -d --build
```

The first build takes a few minutes (it converts 570 photos). Later builds reuse the cached `npm ci` layer.

## 4. Open the port

```bash
sudo ufw allow 8080/tcp
sudo ufw status
```

If your VPS provider has its own firewall or security group (AWS, Azure, GCP, DigitalOcean, Hetzner, Oracle...), also allow inbound TCP 8080 there.

## 5. Test

```bash
curl -I http://localhost:8080                                  # 200
curl -I http://localhost:8080/collections/khun-materials       # 200
curl -I http://localhost:8080/this-page-does-not-exist         # 404 (serves the friendly 404 page)
docker ps                                                      # STATUS should say (healthy)
```

Then open `http://<VM-IP>:8080` in a browser.

## 6. Updating the site

On your computer: edit JSON in `src/assets/data/` or add photos to `raw-images/<category folder>/`. If you added photos, run `npm run images` once so the new saree codes are written to `src/assets/data/codes.lock.json`. Then commit and push everything (photos, JSON and `codes.lock.json`):

```bash
git add -A && git commit -m "Add new sarees" && git push
```

On the VM:

```bash
cd ~/pkguled && git pull && docker compose up -d --build
```

Always add photos on your computer, not directly on the VM, so `codes.lock.json` in GitHub stays the single record of every saree code.

## 7. Optional: your domain with HTTPS (needed for good SEO)

Google ranks the real domain over HTTPS, not an IP address with a port. Point the domain's **A record** (for example `pkguledilkalsarees.com` and `www`) at the VM IP, then put Caddy in front. Caddy gets and renews a free Let's Encrypt certificate automatically.

```bash
sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt-get update && sudo apt-get install -y caddy

sudo tee /etc/caddy/Caddyfile > /dev/null <<'EOF'
pkguledilkalsarees.com, www.pkguledilkalsarees.com {
    encode zstd gzip
    reverse_proxy 127.0.0.1:8080
}
EOF
sudo systemctl reload caddy
sudo ufw allow 80/tcp && sudo ufw allow 443/tcp
```

Once HTTPS works you can close the public 8080 port (`sudo ufw delete allow 8080/tcp`) and bind the container to localhost only by setting the port in `docker-compose.yml` to `"127.0.0.1:8080:8080"`. Then submit `https://pkguledilkalsarees.com/sitemap.xml` and `/sitemap-images.xml` in Google Search Console.

`site.json` → `seo.siteUrl` must match the real domain, because canonical URLs, Open Graph tags and the sitemaps use it.

## 8. Image size and cleanup

```bash
docker images pkguled-web        # roughly 160 MB: nginx (~50 MB) + ~110 MB of photos
                                 # (570 x 400px webp ~19 KB, 800px webp ~81 KB, 800px jpg ~93 KB)
docker image prune -f            # remove old, untagged images left by rebuilds
docker builder prune -f          # free build cache if the disk fills up
```

## Troubleshooting

| Problem | Check |
|---|---|
| Build fails with `raw-images/ not found` | Run `git pull`; the folder must be next to `Dockerfile` and not listed in `.dockerignore` |
| Build fails with `Cover not found` or `Folder not found` | A `folder` or `cover` value in `categories.json` does not match the file name exactly (names are case sensitive on Linux) |
| Site works on the VM but not from outside | Provider firewall still blocks the port |
| Changes do not show | Run with `--build`; HTML and JSON are served with `no-cache`, so a normal reload is enough |
| Container `unhealthy` | `docker logs pkguled-web` |
