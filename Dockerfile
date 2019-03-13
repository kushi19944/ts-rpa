FROM alpine:latest

RUN apk add --update \
            --no-cache \
            udev \
            ttf-freefont \
            chromium \
            openssl \
            chromium-chromedriver \
            gfortran \
            gcc \
            g++ \
            nodejs-npm

RUN mkdir /noto
ADD https://noto-website.storage.googleapis.com/pkgs/NotoSansCJKjp-hinted.zip /noto
WORKDIR /noto
RUN unzip NotoSansCJKjp-hinted.zip && \
    mkdir -p /usr/share/fonts/noto && \
    cp *.otf /usr/share/fonts/noto && \
    chmod 644 -R /usr/share/fonts/noto/ && \
    fc-cache -fv
WORKDIR /
RUN rm -rf /noto

ENV NODE_PATH /usr/lib/node_modules

WORKDIR /node-rpa
COPY node-rpa-0.0.1.tgz /node-rpa
RUN npm config set unsafe-perm true
RUN npm install -g require-self moment
RUN npm install -g node-rpa-0.0.1.tgz
WORKDIR /
RUN rm -rf /node-rpa
