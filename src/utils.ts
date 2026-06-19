///// Formatting

export function* toHexStrings(data: Iterable<number>) : Iterable<string> {
  for (let n of data)
    yield n.toString(16).padStart(2, '0');
}

export function toHexString(data: Iterable<number>, separator: string = ' ')
{
  let s = '';
  for (let item of toHexStrings(data)) {
    s += item;
    s += separator;
  }
  return s.substring(0, s.length-separator.length);
}