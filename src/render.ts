export interface IElementData {
  tag: string
  props?: { [key: string]: string | boolean }
  eventListeners?: { [key: string]: EventListener }
  children?: Array<IElementData | string>
}

export type RenderData = IElementData[] | IElementData | string

export const createElement = (data: RenderData): Array<HTMLElement | Text> => {
  if (Array.isArray(data)) {
    return data.flatMap(createElement)
  }

  if (typeof data === 'string') {
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
    const childElements = children.flatMap(createElement)
    for (const child of childElements) {
      element.appendChild(child)
    }
  }

  return [element]
}

export const render = (data: RenderData) => {
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
