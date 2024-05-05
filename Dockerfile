FROM python:alpine3.18

COPY . .

CMD ["python3", "-m", "http.server", "3000"]
