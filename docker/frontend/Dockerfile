FROM node:22

ARG USERNAME
ARG GROUPNAME
ARG UID
ARG GID

#nodeユーザを削除し、バックエンドと統一
RUN if [ "$(getent passwd node)" ]; then userdel -r node; fi \
    && groupadd -g $GID $GROUPNAME \
    && useradd -m -s /bin/bash -u $UID -g $GROUPNAME $USERNAME

WORKDIR /app

#作業ディレクトリの所有権を変更
RUN chown $USERNAME:$GROUPNAME /app

#実行ユーザの切り替え
USER $USERNAME

#コンテナ内のディレクトリにコピー
COPY --chown=$USERNAME:$GROUPNAME frontend/package.json frontend/package-lock.json* ./
#package.jsonの内容が変わらない限りキャッシュに保存
RUN npm install

COPY --chown=$USERNAME:$GROUPNAME frontend/ .

EXPOSE 3000

#コンテナ起動時にVite起動
CMD ["npm", "run", "dev"]