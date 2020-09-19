1: 长链路中如何保证资源释放 客户端不再进行沟通

2： 设计sessionId 用于整个会话 断开后也会一致 socketID 当此连接的socketId 每次连接会变化

3： 服务器消息 socket connect socket disconnect 页面 pagechange 路由事件 定时消息

4： 服务器有当前页面信息 组件信息

global.path
global.query
global.user.id
component.1.iid
local.1.x

[
 {
  fromPath: 'local.0',
  toPath: 'local.0'
 },
 {
  fromPath: 'local.1',
  toPath: 'local.1.x'
 }
]

{
 triggerAction: [
  {
   triggerType: string;
   action: {
    type: string;
    parameters: { fromPath: string, toPath: string }[]
   }
  }
 ]
}



{
 id: string;
 seq: 0,
 action: string;
 parameters: any[];
 
}

{
 id: string;
 seq: 1
 type: number; // 2(command)
 actions: {
  type: string; // component.1.setData global.location.redirect
  parameters: any[];
 }[]
}

{
 id: string;
 seq: 2;
 results: any[]
}

{
 id: string;
 seq: 3
 type: number; // 2(command)
 actions: {
  type: string; // component.1.setData global.location.redirect
  parameters: any[];
 }[]
}

{
 id: string;
 seq: 4;
 results: any[]
}

{
 id: string;
 seq: 5
 type: number; // 2(command) 1(end)  3(command&end)
 actions: {
  type: string; // component.1.setData global.location.redirect
  parameters: any[];
 }[]
}



function commandAction(componentId, funName, parameters) {

}

function sqlAction(databasePoolId, sql, parameters) {

}

// 1 断开链接如果保证回收 2. 断开后又连接上 如何不重复 刷新
function intervalAction(action, interval) {
	return (...args) => {
		const effect = setInterval(() => {
			action.apply(null, args);
		}, interval);
		
		this.effectManager.add(effect);
	}
}

function timerAction(actionId, interval, immediate) {
	setInterval(() => {
		this.$emit(SYSTEM_TIME, { now, interval });
	}, interval);
}