
# Pantti Plz

Web based tool for checking whether or not a beverage container has a deposit in the Palpa deposit system in Finland.

This project is not in any way related to Palpa and only for my personal fun.

Some of the code here is based on decompiling the Palpa mobile app and thus can break at any time.

The barcode scanning is implemented with [zxing-js](https://github.com/zxing-js/library), which is sort of in a maintenance mode, but seems to work well enough for this purpose, since the Palpa uses EAN-13 barcodes.

## Why?

I'm not an alcoholic but I have a hobby called beer. Finland has an excellent deposit system for beverage containers. Thus I have the need to check (multiple) beverage containers for deposits. 

The Palpa website has a [checker](https://extra.palpa.fi/pantillisuus) for barcodes. It's only a text input field, so it's hard to check multiple containers.

Palpa also has an outsourced [mobile app](https://play.google.com/store/apps/details?id=com.superapp.pantintarkastusapp) that can scan barcodes, which is not very good, and I don't want to install another goddamn app for something like this.

## Development

Running the project mainly requires [bun](https://bun.sh/).

The included devcontainer [Dockerfile](https://github.com/lovenm/pantti-plz/blob/master/.devcontainer/Dockerfile) contains all required dependencies.

After setting up the environment, install the dependencies with

```sh
bun install
```

### Dev server

```sh
bun index.html
```

This will start up a dev server.

### Build

```sh
bun run build
```

This will bundle and minify the assets to `./out`.
