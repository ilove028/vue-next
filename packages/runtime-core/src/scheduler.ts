import { ErrorCodes, callWithErrorHandling } from './errorHandling'
import { isArray } from '@vue/shared'
import { ComponentPublicInstance } from './componentPublicInstance'

export interface SchedulerJob {
  (): void
  /**
   * unique job id, only present on raw effects, e.g. component render effect
   */
  id?: number
  /**
   * Indicates whether the job is allowed to recursively trigger itself.
   * By default, a job cannot trigger itself because some built-in method calls,
   * e.g. Array.prototype.push actually performs reads as well (#1740) which
   * can lead to confusing infinite loops.
   * The allowed cases are component update functions and watch callbacks.
   * Component update functions may update child component props, which in turn
   * trigger flush: "pre" watch callbacks that mutates state that the parent
   * relies on (#1801). Watch callbacks doesn't track its dependencies so if it
   * triggers itself again, it's likely intentional and it is the user's
   * responsibility to perform recursive state mutation that eventually
   * stabilizes (#1727).
   */
  allowRecurse?: boolean
}

export type SchedulerCb = Function & { id?: number }
export type SchedulerCbs = SchedulerCb | SchedulerCb[]
// 任务队列是否正在排空
let isFlushing = false
// 微任务已创建，任务队列等待排空
let isFlushPending = false

// 主任务队列，用于存储更新任务
const queue: (SchedulerJob | null)[] = []
// 当前正在执行的任务在主任务队列中的索引
let flushIndex = 0

// 框架运行过程中产生的前置回调任务，比如一些特定的生命周期
// 这些回调任务是在主任务队列queue开始排空前批量排空执行的
const pendingPreFlushCbs: SchedulerCb[] = []
// 当前激活的前置回调任务
let activePreFlushCbs: SchedulerCb[] | null = null
// 当前前置回调任务在队列中的索引
let preFlushIndex = 0

// 框架运行过程中产生的后置回调任务，比如一些特定的生命周期（onMounted等）
// 这些回调任务是在主任务队列queue排空后批量排空执行的
const pendingPostFlushCbs: SchedulerCb[] = []
// 当前激活的后置回调任务
let activePostFlushCbs: SchedulerCb[] | null = null
// 当前后置回调任务在队列中的索引
let postFlushIndex = 0

// 当前激活的后置回调任务
const resolvedPromise: Promise<any> = Promise.resolve()
// 当前微任务promise
let currentFlushPromise: Promise<void> | null = null

let currentPreFlushParentJob: SchedulerJob | null = null

// 同一个任务递归执行的上限次数
const RECURSION_LIMIT = 100
// 记录每个任务执行的次数
type CountMap = Map<SchedulerJob | SchedulerCb, number>

export function nextTick(
  this: ComponentPublicInstance | void,
  fn?: () => void
): Promise<void> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}

export function queueJob(job: SchedulerJob) {
  // the dedupe search uses the startIndex argument of Array.includes()
  // by default the search index includes the current job that is being run
  // so it cannot recursively trigger itself again.
  // if the job is a watch() callback, the search will start with a +1 index to
  // allow it recursively trigger itself - it is the user's responsibility to
  // ensure it doesn't end up in an infinite loop.
  // 主任务可入队逻辑：1. 队列为空 2. 正在清空队列（有正在执行的任务）且当前待入队任务
  // 是允许递归执行本身的，由于任务可能递归执行自身，该情况下待入队任务一定和当前执行任务
  // 是同一任务，因此待入队任务和正在执行任务相同，但不能和后面待执行任务相同 3. 其他情况下，
  // 由于不会出现任务自身递归执行的情况，因此待入队任务不能和当前正在执行任务以及后面待执
  // 行任务相同。
  if (
    (!queue.length ||
      !queue.includes(
        job,
        isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
      )) &&
    job !== currentPreFlushParentJob
  ) {
    queue.push(job)
    // 创建清队微任务
    queueFlush()
  }
}

// 创建微任务，isFlushingPending和isFlushing时表示微任务已创建等待执行或者正在执行微任务，
// 这时候是会禁止再次创建更多的微任务，因为在主线程同步任务执行完后才会执行已创建的微任务
// 此时入队操作已完成，并且flushJobs会在一次微任务中会递归的将主任务队列全部清空，所以只需要一个微任务即可，
// 如果重复创建微任务会导致接下来的微任务执行时队列是空的，那么这个微任务是无意义的，因为它不能清队。
function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    // 微任务创建成功，并记录当前微任务，作为nextTick创建自定义微任务的支点，也就是说，
    // nextTick创建出来的微任务执行顺序紧跟在清队微任务后，保证自定义微任务执行时机的
    // 准确性
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

export function invalidateJob(job: SchedulerJob) {
  const i = queue.indexOf(job)
  if (i > -1) {
    queue[i] = null
  }
}

function queueCb(
  cb: SchedulerCbs,
  activeQueue: SchedulerCb[] | null,
  pendingQueue: SchedulerCb[],
  index: number
) {
  if (!isArray(cb)) {
    if (
      !activeQueue ||
      !activeQueue.includes(
        cb,
        (cb as SchedulerJob).allowRecurse ? index + 1 : index
      )
    ) {
      pendingQueue.push(cb)
    }
  } else {
    // if cb is an array, it is a component lifecycle hook which can only be
    // triggered by a job, which is already deduped in the main queue, so
    // we can skip duplicate check here to improve perf
    pendingQueue.push(...cb)
  }
  queueFlush()
}

export function queuePreFlushCb(cb: SchedulerCb) {
  queueCb(cb, activePreFlushCbs, pendingPreFlushCbs, preFlushIndex)
}

export function queuePostFlushCb(cb: SchedulerCbs) {
  queueCb(cb, activePostFlushCbs, pendingPostFlushCbs, postFlushIndex)
}

export function flushPreFlushCbs(
  seen?: CountMap,
  parentJob: SchedulerJob | null = null
) {
  if (pendingPreFlushCbs.length) {
    currentPreFlushParentJob = parentJob
    activePreFlushCbs = [...new Set(pendingPreFlushCbs)]
    pendingPreFlushCbs.length = 0
    if (__DEV__) {
      seen = seen || new Map()
    }
    for (
      preFlushIndex = 0;
      preFlushIndex < activePreFlushCbs.length;
      preFlushIndex++
    ) {
      if (__DEV__) {
        checkRecursiveUpdates(seen!, activePreFlushCbs[preFlushIndex])
      }
      activePreFlushCbs[preFlushIndex]()
    }
    activePreFlushCbs = null
    preFlushIndex = 0
    currentPreFlushParentJob = null
    // recursively flush until it drains
    flushPreFlushCbs(seen, parentJob)
  }
}

export function flushPostFlushCbs(seen?: CountMap) {
  if (pendingPostFlushCbs.length) {
    const deduped = [...new Set(pendingPostFlushCbs)]
    pendingPostFlushCbs.length = 0

    // #1947 already has active queue, nested flushPostFlushCbs call
    if (activePostFlushCbs) {
      activePostFlushCbs.push(...deduped)
      return
    }

    activePostFlushCbs = deduped
    if (__DEV__) {
      seen = seen || new Map()
    }

    activePostFlushCbs.sort((a, b) => getId(a) - getId(b))

    for (
      postFlushIndex = 0;
      postFlushIndex < activePostFlushCbs.length;
      postFlushIndex++
    ) {
      if (__DEV__) {
        checkRecursiveUpdates(seen!, activePostFlushCbs[postFlushIndex])
      }
      activePostFlushCbs[postFlushIndex]()
    }
    activePostFlushCbs = null
    postFlushIndex = 0
  }
}

const getId = (job: SchedulerJob | SchedulerCb) =>
  job.id == null ? Infinity : job.id

// isFlushingPending状态表示清队微任务已创建，此时js主线程还可能会有其他的同步任务未执行完，因此在主线程同步任务执行完毕前isFlushingPending一直为true，当flushJobs开始执行时，表明清队微任务开始执行，此时isFlushingPending置为false，isFlushing置为true，表示正在清队中。
// flushJob大致顺序如下：批量清空前置回调任务队列 -> 清空主任务队列 -> 批量清空后置回调任务队列
function flushJobs(seen?: CountMap) {
  isFlushPending = false
  isFlushing = true
  if (__DEV__) {
    seen = seen || new Map()
  }

  flushPreFlushCbs(seen)

  // Sort queue before flush.
  // This ensures that:
  // 1. Components are updated from parent to child. (because parent is always
  //    created before the child so its render effect will have smaller
  //    priority number)
  // 2. If a component is unmounted during a parent component's update,
  //    its update can be skipped.
  // Jobs can never be null before flush starts, since they are only invalidated
  // during execution of another flushed job.
  queue.sort((a, b) => getId(a!) - getId(b!))

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
      if (job) {
        if (__DEV__) {
          checkRecursiveUpdates(seen!, job)
        }
        // 执行当前更新任务
        // 注意：在isFlushing = true和isFlushing = false之间，
        // 主线程在批量执行更新任务（job），但是job中可能会引入新的
        // 更新任务入队，此时queue长度会变化，因此下面需要递归清空queue
        // 直到队列中的所有任务全部执行完毕
        callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
      }
    }
  } finally {
    flushIndex = 0
    queue.length = 0

    flushPostFlushCbs(seen)

    isFlushing = false
    currentFlushPromise = null
    // some postFlushCb queued jobs!
    // keep flushing until it drains.
    // 由于清队期间（isFlushing）也有可能会有任务入队，因此会导致按照实微任务开始执行时
    // 的队长度遍历清队，可能会导致无法彻底清干净。因此需要递归的清空队伍，保证一次清队
    // 微任务中所有任务队列都被全部清空
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen)
    }
  }
}

function checkRecursiveUpdates(seen: CountMap, fn: SchedulerJob | SchedulerCb) {
  if (!seen.has(fn)) {
    seen.set(fn, 1)
  } else {
    const count = seen.get(fn)!
    if (count > RECURSION_LIMIT) {
      throw new Error(
        `Maximum recursive updates exceeded. ` +
          `This means you have a reactive effect that is mutating its own ` +
          `dependencies and thus recursively triggering itself. Possible sources ` +
          `include component template, render function, updated hook or ` +
          `watcher source function.`
      )
    } else {
      seen.set(fn, count + 1)
    }
  }
}
