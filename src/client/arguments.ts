export function argumentsFromDocumentUrl(): {override: {columns?: number, zoom?: number}, includedTopics: string[] | null, screen: {id: number, total: number}} {
  const params = new URLSearchParams(document.location.search)
  return {
    override: overrideArguments(params),
    includedTopics: topicArguments(params),
    screen: screenArguments(params)
  }
}

function topicArguments(params: URLSearchParams): string[] | null {
  const topics = params.get('topics')
  if (topics === null) {
    return null
  }
  return topics
    .split(',')
    .map(t => t.toLowerCase().trim())
    .filter(t => t)
}

function overrideArguments(params: URLSearchParams): {columns?: number, zoom?: number} {
  return {
    ...parseColumns(params),
    ...parseZoom(params)
  }
}

function parseColumns(params: URLSearchParams) {
  const columnsStr = params.get('columns')
  if (columnsStr) {
    const columns = Number(columnsStr)
    if (columns > 0 && columns <= 10) {
      return {columns}
    }
  }
  return {}
}

function parseZoom(params: URLSearchParams) {
  const zoomStr = params.get('zoom')
  if (zoomStr) {
    const zoom = Number(zoomStr)
    if (zoom > 0 && zoom <= 2) {
      return {zoom}
    }
  }
  return {}
}

function screenArguments(params: URLSearchParams): {id: number, total: number} {
  const matches = (/(\d)of(\d)/).exec(params.get('screen') || '')
  let id = matches ? Number(matches[1]) : 1
  const total = matches ? Number(matches[2]) : 1
  if (id > total) {
    id = total
  }
  return {
    id,
    total
  }
}
