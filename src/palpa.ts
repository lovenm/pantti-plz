// Palpa API base url, reverse engineered from the mobile app. This could essentially
// break at any time if Palpa decides this API is not kosher.
const palpaBaseUrl = 'https://extra.palpa.fi/api/v1.0/deposit/'
const palpaUrl = (ean: string): string => palpaBaseUrl + ean

interface IPalpaResponse {
  status: number
  productName?: string
  recyclingSystem?: string
  deposit?: string
}

export interface IPalpaResult {
  barcode: string
  response: IPalpaResponse
}

export const queryPalpa = async (barcode: string): Promise<IPalpaResult> => {
  const response = await fetch(palpaUrl(barcode))
  const json = await response.json()

  const result = {
    barcode: barcode,
    // TODO: Validate data.
    //       We don't have any guarantees from the Palpa API, so at least status
    //       would need to be validated as non-null.
    response: json as IPalpaResponse,
  }

  return result
}
