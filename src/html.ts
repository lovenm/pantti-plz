import sadCatThumb from '../static/sad-cat-thumb.png'

import type { IElementData } from './render'
import type { IState } from './state'

const startButtonElement = (onClick: EventListener): IElementData => ({
  tag: 'button',
  props: {
    id: 'start-button',
    class: 'button',
  },
  eventListeners: {
    click: onClick,
  },
  children: [{ tag: 'b', children: ['scan'] }],
})

const deviceSelectElement = (
  state: IState,
  onChange: EventListener,
): IElementData => ({
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
        change: onChange,
      },
      children: state.devices.map((device) => {
        return {
          tag: 'option',
          props: {
            value: device.deviceId,
            selected: state.selectedDevice === device.deviceId,
          },
          children: [device.label],
        }
      }),
    },
  ],
})

export const startScanElements = (
  state: IState,
  onStart: EventListener,
  onDeviceSelect: EventListener,
): IElementData[] => [
  startButtonElement(onStart),
  deviceSelectElement(state, onDeviceSelect),
]

const stopButtonElement = (onClick: EventListener): IElementData => ({
  tag: 'button',
  props: {
    id: 'stop-button',
    class: 'button',
  },
  eventListeners: {
    click: onClick,
  },
  children: [{ tag: 'b', children: ['stop'] }],
})

const videoElement: IElementData = { tag: 'video', props: { id: 'video' } }

export const scanningElements = (onStop: EventListener): IElementData[] => [
  videoElement,
  stopButtonElement(onStop),
]

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

export const resultElement = (
  state: IState,
  onStart: EventListener,
): IElementData[] => {
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
    startButtonElement(onStart),
  ]
}

export const noDevicesElement = [
  { tag: 'p', children: ['Could not initialize video devices :('] },
  { tag: 'br' },
  {
    tag: 'p',
    children: ['Try again with a device that actually has a camera.'],
  },
]
