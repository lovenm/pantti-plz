import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
  NotFoundException,
} from '@zxing/library'

import sadCatThumb from '../static/sad-cat-thumb.png'

type Hints = Map<DecodeHintType, unknown>
function initializeZxing(): BrowserMultiFormatReader {
  const hints: Hints = new Map()
  const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)

  const reader = new BrowserMultiFormatReader(hints)

  return reader
}

const codeReader = initializeZxing()

// Palpa API base url, reverse engineered from the mobile app. This could essentially
// break at any time if Palpa decides this API is not kosher.
const palpaBaseUrl = 'https://extra.palpa.fi/api/v1.0/deposit/'
const palpaUrl = (ean: string): string => palpaBaseUrl + ean

//
// Model a basic state machine for the different states of the app
//
enum Mode {
  Initial,
  NoVideoDevices,
  StartScan,
  Scanning,
  Result,
}

interface IResponse {
  status: number
  productName?: string
  recyclingSystem?: string
  deposit?: string
}

interface IResult {
  barcode: string
  response: IResponse
}

interface IState {
  mode: Mode
  devices: MediaDeviceInfo[]
  selectedDevice?: string
  result?: IResult
}

let state: IState = {
  mode: Mode.Initial,
  devices: [],
  selectedDevice: undefined,
  result: undefined,
}

//
// Do mutations of the state through defined functions
//
function setMode(newMode: Mode) {
  console.log(`Set mode to ${newMode}`)
  state = {
    ...state,
    mode: newMode,
  }
  renderState(state)
}

function setDevices(devices: MediaDeviceInfo[]) {
  console.log(`Set devices to ${JSON.stringify(devices)}`)
  // TODO: Error?
  const device = devices[0]

  state = {
    ...state,
    devices: devices,
    selectedDevice: device.deviceId,
    mode: Mode.StartScan,
  }

  renderState(state)
}

function setSelectedDevice(deviceId: string) {
  console.log(`Set deviceId to ${deviceId}`)
  state = {
    ...state,
    selectedDevice: deviceId,
    mode: Mode.StartScan,
  }
  renderState(state)
}

function setResult(result: IResult) {
  console.log(`Set result to ${JSON.stringify(result)}`)
  state = {
    ...state,
    result: result,
    mode: Mode.Result,
  }
  renderState(state)
}

//
// The states of the app as data objects modeling the HTML that
// needs to be generated.
//
interface IElementData {
  tag: string
  props?: { [key: string]: string | boolean }
  eventListeners?: { [key: string]: EventListener }
  children?: Array<IElementData | string>
}

const startButtonElement: IElementData = {
  tag: 'button',
  props: {
    id: 'start-button',
    class: 'button',
  },
  eventListeners: {
    click: () => startScan(state),
  },
  children: [{ tag: 'b', children: ['scan'] }],
}

const deviceSelectElement = (state: IState): IElementData => ({
  tag: 'div',
  children: [
    {
      tag: 'label',
      props: { for: 'source-select' },
      children: ['Select device: '],
    },
    {
      tag: 'select',
      props: { id: 'source-select' },
      eventListeners: {
        change: (e) =>
          setSelectedDevice((e.currentTarget as HTMLSelectElement)?.value),
      },
      children: state.devices.map((device) => {
        return {
          tag: 'option',
          props: {
            value: device.deviceId,
            selected: state.selectedDevice === device.deviceId ? true : false,
          },
          children: [device.label],
        }
      }),
    },
  ],
})

function startScanElements(state: IState): IElementData[] {
  return [startButtonElement, deviceSelectElement(state)]
}

const stopButtonElement: IElementData = {
  tag: 'button',
  props: {
    id: 'stop-button',
    class: 'button',
  },
  eventListeners: {
    click: () => stopScan(),
  },
  children: [{ tag: 'b', children: ['stop'] }],
}

const videoElement: IElementData = { tag: 'video', props: { id: 'video' } }

const scanningElements: IElementData[] = [videoElement, stopButtonElement]

const goodStatusElements: IElementData[] = [
  { tag: 'p', children: ['Pantti get!'] },
]
const badStatusElements: IElementData[] = [
  {
    tag: 'p',
    children: [
      'No deposit',
      {
        tag: 'img',
        props: { class: 'inline', height: '20rem', src: sadCatThumb },
      },
    ],
  },
  { tag: 'br' },
  {
    tag: 'p',
    children: [
      'Check if the barcode was correct and scan again if it was not.',
    ],
  },
  { tag: 'br' },
]

function resultElement(state: IState) {
  const result = state.result

  if (!result) {
    return []
  }

  const { barcode, response } = result
  const status = response.status

  // Example responses from the Palpa API:
  // - no deposit: {"status":1,"productName":null,"recyclingSystem":null,"deposit":null}
  // - yes deposit: {"status":2,"productName":"Malmgård East Coast Lager 44cl","recyclingSystem":"Tölkki","deposit":"0,15 €"}
  const statusElements = status === 2 ? goodStatusElements : badStatusElements

  return [
    { tag: 'p', children: [`Barcode: ${barcode}`] },
    { tag: 'pre', children: [JSON.stringify(response, null, ' ')] },
    ...statusElements,
    startButtonElement,
  ]
}

const noDevicesElement = [
  { tag: 'p', children: ['Could not initialize video devices :('] },
  { tag: 'br' },
  {
    tag: 'p',
    children: ['Try again with a device that actually has a camera.'],
  },
]

//
// Rendering methods that convert the given data to DOM nodes and inserts them
// into the page.
//
type RenderData = IElementData[] | IElementData | string

function createElement(data: RenderData): Array<HTMLElement | Text> {
  if (Array.isArray(data)) {
    return data.map(createElement).flat()
  } else if (typeof data === 'string') {
    return [document.createTextNode(data)]
  }

  const { tag, props, eventListeners, children } = data
  const element = document.createElement(tag)

  if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === 'string') {
        element.setAttribute(key, value)
      } else if (typeof value === 'boolean' && value) {
        element.setAttribute(key, '')
      }
    }
  }

  if (eventListeners) {
    for (const [key, value] of Object.entries(eventListeners)) {
      element.addEventListener(key, value)
    }
  }

  if (children) {
    const childElements = children.map(createElement).flat()
    for (const child of childElements) {
      element.appendChild(child)
    }
  }

  return [element]
}

function render(data: RenderData) {
  const gui = document.getElementById('gui')
  if (!gui) {
    console.log('We fugd!')
    return
  }

  // This is pretty inefficient, but it's not like the app is re-rendering
  // constantly, so whatever.
  gui.innerHTML = ''

  const elements = createElement(data).flat()
  for (const element of elements) {
    gui.appendChild(element)
  }
}

function renderState(state: IState) {
  const elements = (function () {
    switch (state.mode) {
      case Mode.Initial:
        return []
      case Mode.NoVideoDevices:
        return noDevicesElement
      case Mode.StartScan:
        return startScanElements(state)
      case Mode.Scanning:
        return scanningElements
      case Mode.Result:
        return resultElement(state)
    }
  })()

  render(elements)
}

/**
 * Stop scanning and query the Palpa API.
 */
async function queryPalpa(barcode: string) {
  codeReader.reset()

  const response = await fetch(palpaUrl(barcode))
  const json = await response.json()

  const result = {
    barcode: barcode,
    // TODO: Error state if status == null
    response: json as IResponse,
  }

  setResult(result)
}

/**
 * Start scanning for barcodes with the camera.
 */
function startScan(state: IState) {
  const selectedDevice = state.selectedDevice

  if (selectedDevice) {
    setMode(Mode.Scanning)

    codeReader
      .decodeFromVideoDevice(selectedDevice, 'video', (result, err) => {
        if (result) {
          queryPalpa(result.getText())
        }
        if (err && !(err instanceof NotFoundException)) {
          console.error(err)
          stopScan()
        }
      })
      .catch(() => {
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
function stopScan() {
  codeReader.reset()
  setMode(Mode.StartScan)
}

// Initialize application once everything has loaded.
window.onload = async () => {
  // Ask for camera permission from the get-go, there are some weird issues with
  // zxing where it just reports deviceId as undefined even if it should not and
  // this seems to fix it.
  try {
    await navigator.mediaDevices.getUserMedia({ video: true })
  } catch {
    // If checking for userMedia fails, it most likely means that the device does
    // not support it.
    setMode(Mode.NoVideoDevices)
  }

  const devices = await codeReader.listVideoInputDevices()
  if (devices.length == 0) {
    setMode(Mode.NoVideoDevices)
  } else {
    setDevices(devices)
  }
}
