export function argumentsFromDocumentUrl(): {override: {columns?: number, zoom?: number}, includedTags: string[] | null, screen: {id: number, total: number}} {
  const args = parseQueryString(document.location.search)
  return {
    override: overrideArguments(args),
    includedTags: tagArguments(args),
    screen: screenArguments(args)
  }
}

function tagArguments(args: {[key: string]: string}): string[] | null {
  if (args.tags === undefined) {
    return null
  }
  return (args.tags || '')
    .split(',')
    .map(t => t.toLowerCase().trim())
    .filter(t => t)
}

function overrideArguments(args: {[key: string]: string}): {columns?: number, zoom?: number} {
  const columns = args.columns ? {columns: Number(args.columns)} : {}
  const zoom = args.zoom ? {zoom: Number(args.zoom)} : {}
  return {
    ...columns,
    ...zoom
  }
}

function screenArguments(args: {[key: string]: string}): {id: number, total: number} {
  const matches = (/(\d)of(\d)/).exec(args.screen || '')
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

function parseQueryString(search: string): {[key: string]: string} {
  return search
    .slice(1)
    .split('&')
    .filter(p => p)
    .reduce((acc, parameter) => {
      const [key, value] = parameter.split('=')
      return {
        ...acc,
        [key]: decodeURIComponent(value)
      }
    }, {})
}
