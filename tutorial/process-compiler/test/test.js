import {
  ARROW_FUNCTION,
  ASYNC_FUNCTION,
  FUNCTION_NODE,
  NORMAL_FUNCTION,
  ASSIGNMENT_NODE,
  IF_NODE,
  FOR_NODE
} from '../gen'

export default {
  type: FUNCTION_NODE,
  data: {
    funType: ASYNC_FUNCTION | ARROW_FUNCTION,
    name: 'testNormal',
    args: [
      {
        name: 'event'
      }
    ],
    body: {
      type: ASSIGNMENT_NODE,
      data: {
        variable: { name: 'vN' },
        value: { content: 1 }
      },
      next: {
        type: ASSIGNMENT_NODE,
        data: {
          variable: { name: 'vS' },
          value: { content: "'test'" }
        },
        next: {
          type: ASSIGNMENT_NODE,
          data: {
            variable: { name: 'vV' },
            value: { content: 'event' }
          },
          next: {
            type: ASSIGNMENT_NODE,
            data: {
              variable: { name: 'vFc' },
              value: { content: 'await a()' }
            },
            next: {
              type: IF_NODE,
              data: {
                branchs: [
                  {
                    condition: {
                      data: {
                        content: 'vN > 1'
                      }
                    },
                    body: {
                      type: FOR_NODE,
                      data: {
                        assignment: {
                          data: {
                            variable: { name: 'i' },
                            value: { content: 0 }
                          }
                        },
                        condition: [
                          {
                            expression: {
                              data: {
                                content: 'vN < 30'
                              }
                            }
                          }
                        ],
                        iterator: {
                          data: {
                            content: 'vN++'
                          }
                        }
                      }
                    }
                  },
                  {
                    condition: {
                      data: {
                        content: 'vN < -10'
                      }
                    },
                    body: {}
                  },
                  {
                    body: {}
                  }
                ]
              }
            }
          }
        }
      }
    }
  }
}
