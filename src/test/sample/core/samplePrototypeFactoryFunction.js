let state = 1
export const samplePrototypeFactoryFunction = () => {
  const _state = ++state % 2
  const _regex = new RegExp(`.{${_state + 1}}`)
  return (text = '') => `[${text.replace(_regex, '*')}]`
}
