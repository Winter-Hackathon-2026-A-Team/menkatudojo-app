FROM python:3.13

ARG USERNAME
ARG GROUPNAME
ARG UID
ARG GID

#パッケージインストール、ユーザ作成、
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && groupadd -g $GID $GROUPNAME \
    && useradd -m -s /bin/bash -u $UID -g $GROUPNAME $USERNAME \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

#レイヤーキャッシュ活用のため
COPY backend/requirements.txt .
#--no-cache-dirでインストール後のpipキャッシュを削除
RUN pip install --no-cache-dir -r requirements.txt

USER $USERNAME

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--reload"]
