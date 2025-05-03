import {
  BarcodeFormat,
  BrowserMultiFormatReader,
  DecodeHintType,
} from '@zxing/library'

type Hints = Map<DecodeHintType, unknown>

export const initializeZxing = (): BrowserMultiFormatReader => {
  const hints: Hints = new Map()
  const formats = [BarcodeFormat.EAN_13, BarcodeFormat.EAN_8]

  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats)

  const reader = new BrowserMultiFormatReader(hints)

  return reader
}
