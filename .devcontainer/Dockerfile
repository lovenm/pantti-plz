FROM oven/bun:1.2.10-alpine@sha256:e8e1d291c25b617d7dda08c839fe00d1524a8ccb253c37eb8e9c6e0525da3c89

# Install base packages
RUN apk update && apk add wget bash git sudo

# Make bun user sudoer (required for mounts)
RUN echo bun ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/bun \
    && chmod 0440 /etc/sudoers.d/bun

USER bun
