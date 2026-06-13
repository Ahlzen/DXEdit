///// Formatting

export function* toHexStrings(data: Iterable<number>) : Iterable<string> {
  for (let n of data)
    yield n.toString(16);
}
