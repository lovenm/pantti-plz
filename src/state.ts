import type { IPalpaResult } from './palpa'

export enum Mode {
  Initial = 'Initial',
  NoVideoDevices = 'NoVideoDevices',
  StartScan = 'StartScan',
  Scanning = 'Scanning',
  ScanComplete = 'ScanComplete',
}

export interface IState {
  mode: Mode
  devices: MediaDeviceInfo[]
  selectedDevice?: string
  result?: IPalpaResult
}

export type StateChangeFn = (newState: IState) => void

export interface IStore {
  setMode: (newMode: Mode) => void
  setDevices: (devices: MediaDeviceInfo[]) => void
  setSelectedDevice: (deviceId: string) => void
  setResult: (result: IPalpaResult) => void
}

// Store the actual state as a module level variable and allow mutations to
// it through the store object.
let state: IState = {
  mode: Mode.Initial,
  devices: [],
  selectedDevice: undefined,
  result: undefined,
}

/**
 * Create a store object that contains the allowed mutations to the state.
 * @param onChange function that is called whenever state changes.
 */
export const createStore = (onChange: StateChangeFn): IStore => ({
  setMode: (newMode) => {
    console.log(`Set mode to ${newMode}`)

    state = {
      ...state,
      mode: newMode,
    }

    onChange(state)
  },
  setDevices: (devices) => {
    console.log(`Set devices to ${JSON.stringify(devices)}`)

    // TODO: Should probably give both selected devie and the list as params
    //       so the potential list parsing errors, like an empty list can
    //       be resolved.
    const device = devices[0]

    state = {
      ...state,
      devices: devices,
      selectedDevice: device.deviceId,
      mode: Mode.StartScan,
    }

    onChange(state)
  },
  setSelectedDevice: (deviceId) => {
    console.log(`Set deviceId to ${deviceId}`)

    state = {
      ...state,
      selectedDevice: deviceId,
      mode: Mode.StartScan,
    }

    onChange(state)
  },
  setResult: (result) => {
    console.log(`Set result to ${JSON.stringify(result)}`)

    state = {
      ...state,
      result: result,
      mode: Mode.ScanComplete,
    }

    onChange(state)
  },
})
