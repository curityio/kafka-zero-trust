FROM kong:2.8.1-alpine

# Fetch from luarocks, and set git options if required
USER root
RUN git config --global url."https://".insteadOf git:// && \
    git config --global advice.detachedHead false && \
    luarocks install kong-phantom-token

USER kong