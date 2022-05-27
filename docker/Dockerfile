FROM ubuntu:18.04

RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y g++ gcc
RUN apt-get install -y cmake
RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install -y libssl-dev libkrb5-dev

VOLUME ["/ui"]
WORKDIR ui
RUN npm install --global yarn
