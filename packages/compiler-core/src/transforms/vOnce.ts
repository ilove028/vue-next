import { NodeTransform } from '../transform'
import { findDir } from '../utils'
import { ElementNode, ForNode, IfNode, NodeTypes } from '../ast'
import { SET_BLOCK_TRACKING } from '../runtimeHelpers'

const seen = new WeakSet()

export const transformOnce: NodeTransform = (node, context) => {
  //  v-once 需要做的就是缓存其他 transform 对节点处理，需要放在最前面，这样他的 exitfn 才可以是最后执行，这样 node.codegenNode 就能通过 context.cache 缓存起来
  if (node.type === NodeTypes.ELEMENT && findDir(node, 'once', true)) {
    if (seen.has(node)) {
      return
    }
    seen.add(node)
    // 把需要的运行时方法添加通过 context.helper 添加进 helpers
    context.helper(SET_BLOCK_TRACKING)
    return () => {
      const cur = context.currentNode as ElementNode | IfNode | ForNode
      if (cur.codegenNode) {
        cur.codegenNode = context.cache(cur.codegenNode, true /* isVNode */)
      }
    }
  }
}
