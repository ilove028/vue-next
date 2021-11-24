import generate, { FUNCTION_NODE } from './gen'

export default function (option) {
  return node => {
    const context = { code: '', inAsync: false }

    generate(node, context)

    return node.type === FUNCTION_NODE
      ? new Function(
          (node.data.args ? node.data.args : []).map(({ name }) => name),
          `return (${context.code})(${(node.data.args ? node.data.args : [])
            .map(arg => arg.name)
            .join(',')})`
        )
      : new Function(context.code)
  }
}
