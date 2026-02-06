npm run build
docker build -t micro-mobility dist
docker run --rm -p 8443:443 micro-mobility:latest
