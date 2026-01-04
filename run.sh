npm run build --configuration=production
docker build -t micro-mobility .
docker run --rm -p 8443:443 micro-mobility:latest
