import { NotFoundException } from '@zxing/library'

import {
  noDevicesElement,
  resultElement,
  scanningElements,
  startScanElements,
} from './html'
import { queryPalpa } from './palpa'
import { initializeZxing } from './reader'
import { type IElementData, render } from './render'
import { type IState, type IStore, Mode, createStore } from './state'

const onStartClicked = (state: IState) => () => startScan(state)
const onStopClicked = () => stopScan()
const onDeviceSelect = (e: Event) =>
  store.setSelectedDevice((e.currentTarget as HTMLSelectElement)?.value)

const renderState = (state: IState): void => {
  const elements: IElementData[] = (() => {
    switch (state.mode) {
      case Mode.Initial:
        return []
      case Mode.NoVideoDevices:
        return noDevicesElement
      case Mode.StartScan:
        return startScanElements(state, onStartClicked(state), onDeviceSelect)
      case Mode.Scanning:
        return scanningElements(onStopClicked)
      case Mode.ScanComplete:
        return resultElement(state, onStartClicked(state))
    }
  })()

  render(elements)
}

/**
 * Start scanning for barcodes with the camera.
 */
const startScan = (state: IState): void => {
  const selectedDevice = state.selectedDevice

  if (selectedDevice) {
    store.setMode(Mode.Scanning)

    codeReader
      .decodeFromVideoDevice(selectedDevice, 'video', (result, err) => {
        if (result) {
          // Stop scanning
          codeReader.reset()

          // Query palpa and show the result
          // TODO: Error handling.
          //       Maybe a lock to prevent interactions before the query is
          //       resolved to either a value or an error
          queryPalpa(result.getText()).then(store.setResult)
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error(err)
          stopScan()
        }
      })
      .catch((e) => {
        // TODO: Error handling if video stream cant be started
        console.log('Starting video stream failed, ', e)
        stopScan()
      })

    console.log(
      `Started continous decode from camera with id ${selectedDevice}`,
    )
  }
}

/**
 * Stop scanning for barcodes and reset the state to start another scan.
 */
const stopScan = (): void => {
  codeReader.reset()
  store.setMode(Mode.StartScan)
}

const codeReader = initializeZxing()
const store: IStore = createStore(renderState)

// Initialize application once everything has loaded.
window.onload = async () => {
  // TODO: Something less hacky for ensuring camera works :feelsbadman:

  // Ask for camera permission from the get-go, there are some weird issues with
  // zxing where it just reports deviceId as undefined even if it should not and
  // this seems to fix it.
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })

    // Stop each track, otherwise the video stream remains open and initiating
    // the actual scan just silently fails.
    for (const track of stream.getTracks()) {
      track.stop()
    }
  } catch {
    // If checking for userMedia fails, it most likely means that the device does
    // not support it.
    store.setMode(Mode.NoVideoDevices)
  }

  const devices = await codeReader.listVideoInputDevices()
  if (devices.length === 0) {
    store.setMode(Mode.NoVideoDevices)
  } else {
    store.setDevices(devices)
  }
}
