方案B 客户端只做数据展示和事件发送 服务器端完全管理状态 包括

1: 长链路中如何保证资源释放 客户端不再进行沟通

2: 有session context 用于整个会话 和 web会话一样 暂时可以使用cookies实现
   有app context 用于页面一次刷新一个app context sesson 和 app 是一对多关系
   有page context app 和 page是 一对多
   有 socket context 一个socket连接是一个 socket context app和context是一对多关系
   component page 组件作用域即 page和component是一对多关系

3： 服务器消息 socket connect socket disconnect 页面 pagechange 路由事件 定时消息

5：服务器和每个客户端都可以理解为远程服务 服务器通过工具配置的流程图执行逻辑 客户端远程调用服务器配置的方法 服务器通过远程调用获取客户端状态 设置状态

4： 服务器有当前页面信息 组件信息 服务器不保存页面 比如 组件数据 页面数据在哪个页面等 UI json数据 这些都可以通过远程调用实现 服务器只保存用户登录数据 

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