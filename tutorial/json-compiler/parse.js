module.exports = function parse(ast) {
  if (Array.isArray(ast)) {
    return ast.map(a => parse(a)).join('')
  } else if (ast) {
    switch (ast.type) {
      case 0: {
        // 根节点
        return `return async function ${ast.name ? ast.name : ''}(${
          Array.isArray(ast.inputs)
            ? `${ast.inputs.map(i => i.name).join(',')}`
            : ''
        }) { with(this) { ${parse(ast.children)} }}`
      }
      case 1: {
        // 开始节点
        // return ` (${ast.inputs.map(i => i.name).join(',')}){ with(this){${parse(ast.children)}`
        // return `with(this){${parse(ast.children)} /* with */}`
        return `${parse(ast.children)}`
      }
      case 2: {
        // 结束节点
        return `return ${
          Array.isArray(ast.output)
            ? `{${ast.output.map(o => `${o.key}:${o.value}`).join(',')}}`
            : `${ast.output}`
        };`
      }
      case 3: {
        // IF节点
        return ` if (${ast.express}) { ${parse(ast.body)} /* if */} ${parse(
          ast.children
        )}`
      }
      case 4: {
        // else if
        return ` else if (${ast.express}) { ${parse(
          ast.body
        )} /* else if */} ${parse(ast.children)}`
      }
      case 5: {
        // else
        return ` else { ${parse(ast.body)} /* else */} ${parse(ast.children)}`
      }
      case 6: {
        // loop
        return ` for(${ast.express}) { ${parse(ast.body)} /* for */} ${parse(
          ast.children
        )}`
      }
      case 7: {
        // Logic节点
        return `${
          ast.output ? `const ${ast.output} =` : ''
        } await require('./lib/${ast.name}').call(this, ${ast.inputs
          .map(i => (i.name ? i.name : JSON.stringify(i.value)))
          .join(',')});${parse(ast.children)}`
      }
      case 8: {
        // break 节点
        return 'break;'
      }
      case 9: {
        // 赋值节点
        return `${ast.modifier} ${ast.name} = ${JSON.stringify(
          ast.value
        )}; ${parse(ast.children)}`
      }
      case 10: {
        // while
        return `while (${ast.express}) { ${parse(ast.body)} } ${parse(
          ast.children
        )}`
      }
      case 11: {
        return 'continue;'
      }
    }
  } else {
    return ''
  }
}
