### Copying from External Images
You can copy from any image, not just prior stages:
```dockerfile
COPY --from=nginx:latest /etc/nginx/nginx.conf /nginx.conf
```
