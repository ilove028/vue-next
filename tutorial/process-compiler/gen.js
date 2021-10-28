const NORMAL_FUNCTION = 1 // 普通类型
const ASYNC_FUNCTION = 1 << 1 // Async 函数
const ARROW_FUNCTION = 1 << 2 // 箭头函数

const ASSIGNMENT_NODE = 1 // 赋值节点
const FUNCTION_NODE = 1 << 2 // 函数节点
const IF_NODE = 1 << 3 // if 节点
const FOR_NODE = 1 << 4 // for 节点
const FUNCTION_CALL_NODE = 1 << 5 // 函数调用节点
const EXPRESSION_NODE = 1 << 6 // 表达式节点
const TRY_CATCH_NODE = 1 << 7 // try 节点

export function generate(node, context) {
  while (node) {
    const { type } = node

    switch (type) {
      case ASSIGNMENT_NODE: {
        genAssignment(node, context)
        break
      }
      case FUNCTION_NODE: {
        genFunction(node, context)
        break
      }
      case IF_NODE: {
        genIf(node, context)
        break
      }
      case FOR_NODE: {
        genFor(node, context)
        break
      }
      case FUNCTION_CALL_NODE: {
        genFunctionCall(node, context)
        break
      }
      case TRY_CATCH_NODE: {
        genTryCatch(node, context)
        break
      }
    }

    node = node.next
  }
}

export function genAssignment(node, context) {
  const {
    id,
    type,
    data: {
      variable: { type: varType, name },
      value: { isStatic, content }
    },
    next,
    meta
  } = node

  context.code += `let ${name} = ${
    isStatic ? JSON.stringify(content) : content
  };\r\n`
}

/**
 *
 * @param {} funNode
 */
export function genFunction(funNode, context) {
  const {
    id,
    type,
    data: {
      retType,
      funType = ASYNC_FUNCTION | ARROW_FUNCTION,
      name,
      args,
      body
    },
    next,
    meta
  } = funNode

  context.code += `${funType & ASYNC_FUNCTION ? 'async ' : ''}${
    funType & NORMAL_FUNCTION ? 'function' : ''
  } ${funType & NORMAL_FUNCTION && name ? name : ''}(`

  switch (funType) {
    case NORMAL_FUNCTION: {
      context.code += `function ${name ? name : ''}`
      break
    }
    case NORMAL_FUNCTION | ASYNC_FUNCTION: {
      context.code += `async function ${name ? name : ''}`
      break
    }
    case ARROW_FUNCTION | ASYNC_FUNCTION: {
      context.code += `async `
      break
    }
  }

  context.code += '('
  for (let i = 0; args && i < args.length; i++) {
    const { type, name } = args[i]

    context.code += `${i > 0 ? ' ,' : ''}${name}`
  }
  context.code += ') {\r\n'

  generate(body, context)

  context.code += `\r\n return`

  context.code += `\r\n}`
}

export function genIf(node, context) {
  const {
    id,
    type,
    data: { branchs },
    next
  } = node

  for (let i = 0; branchs && i < branchs.length; i++) {
    const { condition, body } = branchs[i]

    if ((i = 0)) {
      context.code += `if (${genExpression(condition)}) {\r\n`
    } else if (condition) {
      context.code += `else if (${genExpression(condition)}) {\r\n`
    } else {
      context.code += 'else {\r\n'
    }

    context.code += generate(body, context)

    context.code += '\r\n}'
  }
}

export function genFor(node, context) {
  const {
    data: { assignment, condition, iterator, body }
  } = node

  context.code += 'for ('

  context.code += genAssignment(assignment, context)

  context.code += genConditionalExpression(condition, context)

  context.code += ';'

  context.code += genExpression(iterator)

  context.code += ';) {\r\n'

  context.code += generate(body)

  context.code += '\r\n}'
}

export function genFunctionCall(node, context) {
  const {
    data: {
      variable: { type: varType, name: varName },
      name,
      args
    }
  } = node

  context.code += `let ${name} = `

  context.code += `${context.inAsync ? 'async ' : ''}${name}(`

  for (let i = 0; args && i < args.length; i++) {
    context.code += `${i > 0 ? ', ' : ''}${genExpression(args[i], context)}`
  }

  context.code += ');'
}

export function genTryCatch(node, context) {
  const {
    data: { tryBody, catchBody, finallyBody }
  } = node

  context.code += 'try {\r\n'

  context.code += generate(tryBody, context)

  context.code += '\r\n}'

  if (catchBody) {
    const { varName, body } = catchBody

    context.code += `catch (${varName ? varName : ''}) {\r\n`
    context.code += generate(body, context)
    context.code += '\r\n}'
  }

  if (finallyBody) {
    context.code += `finall {\r\n`
    context.code += generate(finallyBody, context)
    context.code += '\r\n}'
  }
}

export function genConditionalExpression(condition, context) {
  const { parts } = condition

  for (let i = 0; parts && i < parts.length; i++) {
    const { concat, expression } = parts[i]

    context.code += `${concat ? concat : ''} ${genExpression(
      expression,
      context
    )}`
  }
}

/**
 * 暂时直接使用js 表达式
 * @param {*} node
 * @param {*} context
 */
export function genExpression(node, context) {
  const {
    data: { type, content }
  } = node

  context.code += content
}
