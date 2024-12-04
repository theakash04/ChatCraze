FROM python:3.11-alpine

WORKDIR /app/backend

COPY requirements.txt ./

# install python dependencies
RUN pip3 install --no-cache-dir --default-timeout=100 -r ./requirements.txt

COPY . ./

EXPOSE 8000

CMD ["fastapi", "run", "./main.py", "--host", "0.0.0.0", "--port", "8000"]
