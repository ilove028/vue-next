// const fs = require('fs');
// const path = require('path');
// const json = require('./data.json');

// json.uiList[1].children[0].children.forEach((child) => {
//   const matchs = /\$(\d+)\$(\d+)/.exec(child.webSlot);
//   if (matchs) {
//     child.webSlot = { rowPos: parseInt(matchs[1]), colPos: parseInt(matchs[2]) }
//   }
// })

// fs.writeFileSync('data.bak.json', JSON.stringify(json))

// function delay() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log(1);
//       resolve();
//     }, 1000)
//   })
// }

// async function run() {
//   for (let i = 0; i < 5; i++) {
//     await delay();
//   }
// }

// run();

// new Array(5).forEach(async (...args) => {
//   console.log(args);
//   await delay();
// })

function run(a, b) {
  with (this) {
    console.log(a, b, c)
    locigA.call(this, a)
    return c
  }
}

// run.call({ c: 3 }, 1, 2);

function plugin(Vue) {
  Vue.mixin({
    beforeCreate() {
      const { triggerAction } = this.$options
      if (triggerAction) {
        this.$on()
      }
    }
  })
}

function compile(ast) {
  const walk = ast => {
    if (Array.isArray(ast)) {
      return ast.map(a => walk(a)).join('')
    } else if (ast) {
      switch (ast.type) {
        case 0: {
          // 根节点
          // return `function ${ast.name}${walk(ast.children)}`;
          return walk(ast.children)
        }
        case 1: {
          // 开始节点
          // return ` (${ast.inputs.map(i => i.name).join(',')}){ with(this){${walk(ast.children)}`
          return `with(this){${walk(ast.children)} /* with */}`
        }
        case 2: {
          // 结束节点
          return `return {${ast.output
            .map(o => `${o.key}:${o.value}`)
            .join(',')}};`
        }
        case 3: {
          // IF节点
          return ` if (${ast.express}) { ${walk(ast.body)} /* if */} ${walk(
            ast.children
          )}`
        }
        case 4: {
          // else if
          return ` else if (${ast.express}) { ${walk(
            ast.body
          )} /* else if */} ${walk(ast.children)}`
        }
        case 5: {
          // else
          return ` else { ${walk(ast.body)} /* else */} ${walk(ast.children)}`
        }
        case 6: {
          // loop
          return ` for(${ast.express}) { ${walk(ast.body)} /* for */} ${walk(
            ast.children
          )}`
        }
        case 7: {
          // Logic节点
          return `const ${ast.output} = require('./lib/${
            ast.name
          }').call(this, ${ast.inputs.map(i => i.name).join(',')});${walk(
            ast.children
          )}`
        }
      }
    } else {
      return ''
    }
  }
  return new Function(
    ast.inputs.map(i => i.name).join(','),
    walk(ast.children[0])
  )
}

const ast = {
  type: 0,
  name: 'test1',
  inputs: [
    {
      name: 'a'
    },
    {
      name: 'b'
    }
  ],
  children: [
    {
      type: 1,
      children: [
        {
          type: 3,
          express: 'a > b',
          body: [
            {
              type: 7,
              name: 'add',
              inputs: [
                {
                  name: 'a'
                },
                {
                  name: 'b'
                }
              ],
              output: 'result',
              children: [
                {
                  type: 2,
                  output: [
                    {
                      key: 'a',
                      value: 'a'
                    },
                    {
                      key: 'b',
                      value: 'b'
                    },
                    {
                      key: 'total',
                      value: 'result'
                    }
                  ]
                }
              ]
            }
          ],
          children: [
            {
              type: 4,
              express: 'a < b',
              body: [
                {
                  type: 7,
                  name: 'substract',
                  inputs: [
                    {
                      name: 'a'
                    },
                    {
                      name: 'b'
                    }
                  ],
                  output: 'result'
                },
                {
                  type: 2,
                  output: [
                    {
                      key: 'a',
                      value: 'a'
                    },
                    {
                      key: 'b',
                      value: 'b'
                    },
                    {
                      key: 'result',
                      value: 'result'
                    }
                  ]
                }
              ],
              children: [
                {
                  type: 5,
                  body: [
                    {
                      type: 6,
                      express: 'let i = 0; i < 10; i++',
                      body: [
                        {
                          type: 7,
                          name: 'log',
                          inputs: [
                            {
                              name: 'i'
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}

const ast2 = {
  type: 0,
  name: 'test2',
  inputs: [],
  children: []
}

// console.log(compile(ast).toString());
console.log(compile(ast).call({ require }, 3, 6))
