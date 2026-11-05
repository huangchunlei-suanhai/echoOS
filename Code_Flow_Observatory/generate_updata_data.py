"""Generate a develop_updata snapshot delta without changing the older snapshot."""
from __future__ import annotations
import hashlib
import json
import subprocess
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = Path('/home/huangchunlei/workspace/echo/sftg_ai_backend')
COMMIT = '3cb5173064689c277d959dd315e3774112f32d06'
PREFIX = 'src/shaofeng_ai_backend/'
EVIDENCE = 'evidence/ordinary-chat-prefix-8094-develop-updata.json'

# These excerpts changed content; exact unchanged excerpts are located in the new commit.
RANGES = {
    'ws-entry': (89, 113, 112), 'chat-envelope': (12, 22, 22),
    'worker-ack': (234, 259, 251), 'run-chat-entry': (287, 312, 305),
    'chat-assembly': (400, 442, 434), 'task-projection': (18, 61, 61),
    'build-event': (235, 264, 251), 'context-boundary': (34, 53, 53),
}
DESCRIPTIONS = {
    'ws-entry': {'note': '协议说明新增 chat_steer，但本次只发送 chat_start；其余消息类型未执行。'},
    'chat-envelope': {'purpose': '定义 chat_start 必填字段，并允许指定新任务的 access_mode。',
        'input': 'type、request_id、user_id、prompt、ui_context；access_mode 可选，默认 restricted',
        'note': '本次未显式发送 access_mode，协议默认值为 restricted；Pydantic 内部校验未单独追踪。'},
    'worker-ack': {'purpose': '打开输入队列之后发送 chat_ack，再传递自然语言请求及 access_mode。',
        'input': '已校验的 ChatStartMessage，含默认 access_mode=restricted',
        'note': '本次已收到 ACK；它只表示请求被接受，不是 Agent 回复。'},
    'run-chat-entry': {'input': 'session_id、user_id、prompt、ui_context、access_mode、request_id',
        'note': '本次 access_mode=restricted；finally 清理发生在主动停止采集后，不列入断点前流程。'},
    'chat-assembly': {'purpose': '读取会话记忆，写入本轮用户事件，并带 access_mode 调用 ContextPipeline.build。',
        'input': '用户与会话标识、prompt、原始 ui_context、access_mode',
        'output': '调用 ContextPipeline.build 前的 SessionMemory 和用户消息事件',
        'note': '第 443 行之后的 AgentRequest 尚未构造，Engine 尚未进入。'},
    'task-projection': {'purpose': '从历史事件的 task_id 引用投影任务摘要；本次事件为空，返回 None。',
        'note': '新分支以事件引用的 task_id 判定任务信号；本次未进入事件循环。'},
    'build-event': {'purpose': '生成事件 ID，并填充当前 MemoryEvent 协议字段与空字典默认值。',
        'note': '新分支不再填写旧 task_type/capability 字段；本次只构造用户消息事件。'},
    'context-boundary': {'title': 'ContextPipeline.build · L53 断点前',
        'purpose': '已进入上下文构建函数，停在第 53 行 UIContext 校验表达式执行前。',
        'input': 'request_id、session_id、user_id、prompt、raw_ui_context、SessionMemory、access_mode',
        'output': '尚无 AgentContext；第 53 行尚未执行',
        'note': '第 53 行只作为断点定位；AgentUIContext.model_validate 尚未调用。'},
}

def new_card(id, title, file, symbol, start, end, focus, purpose, input, output, calls, note, color):
    return dict(id=id,title=title,type='实例方法' if id!='request-inbox-init' else '构造方法',
        file=PREFIX+file,symbol=symbol,lineStart=start,lineEnd=end,focusLine=focus,
        purpose=purpose,input=input,output=output,calls=calls,note=note,color=color)

ADDITIONS = [
    new_card('open-user-input-channel','打开请求输入通道','application/runtime/runtime_coordinator.py',
        'RuntimeCoordinator.open_user_input_channel',233,245,241,
        '信封校验通过后，为本次请求打开可接收后续用户指令的输入通道。',
        'request_id、session_id、user_id','请求级输入通道已创建',
        '_run_agent_request → open_user_input_channel → UserInputInbox.open',
        '本次只打开通道，没有发送或消费 chat_steer 追加输入。','blue'),
    new_card('inbox-open','建立请求级输入队列','application/runtime/user_input_inbox.py',
        'UserInputInbox.open',33,38,38,'按会话和请求 ID 建立队列，并绑定发起用户。',
        'session_id、request_id、user_id','存入 _RequestInbox',
        'UserInputInbox.open → _RequestInbox.__init__',
        '本次正常创建队列，同名通道异常分支未发生。','purple'),
    new_card('request-inbox-init','初始化用户输入队列','application/runtime/user_input_inbox.py',
        '_RequestInbox.__init__',12,19,15,
        '记录创建者，初始化待处理和已接受消息集合及关闭标志。',
        'user_id','空的请求级队列对象','UserInputInbox.open → _RequestInbox.__init__',
        '只记录队列创建；本次没有追加用户输入。','mint'),
]
CHANGES = [
    ('ws-entry','入口协议说明新增 chat_steer 和 access_mode。'),
    ('chat-envelope','chat_start 新增 access_mode，默认为 restricted。'),
    ('worker-ack','ACK 前打开输入通道，聊天请求传入 access_mode。'),
    ('run-chat-entry','Runtime 聊天入口透传 access_mode。'),
    ('chat-assembly','上下文调用新增 access_mode，后续使用 AgentContext。'),
    ('task-projection','任务信号改由事件引用中的 task_id 判定。'),
    ('build-event','MemoryEvent 构造移除旧 task_type/capability 参数。'),
    ('context-boundary','断点移到 L53，返回模型变为 AgentContext。'),
    ('open-user-input-channel','新增 Runtime 输入通道入口。'),
    ('inbox-open','新增 UserInputInbox.open。'),
    ('request-inbox-init','新增 _RequestInbox 初始化。'),
]

def sha(text):
    return hashlib.sha256(text.encode('utf-8')).hexdigest()

def main():
    old=json.loads((HERE/'real-data.js').read_text(encoding='utf-8').split(' = ',1)[1].rsplit(';',1)[0])
    trace=json.loads((HERE/EVIDENCE).read_text(encoding='utf-8'))
    hit=trace['hit']
    assert len(hit)==1 and hit[0]['line']==53 and hit[0]['session_id']=='debug-1030fco'
    cache={}
    def source(path):
        if path not in cache:
            cache[path]=subprocess.check_output(['git','show',f'{COMMIT}:{path}'],cwd=ROOT).decode('utf-8')
        return cache[path]
    overrides={}
    for base in old['cards']:
        file=source(base['file'])
        lines=file.splitlines()
        if base['id'] in RANGES:
            start,end,focus=RANGES[base['id']]
        else:
            old_lines=base['source'].splitlines()
            matches=[i for i in range(len(lines)-len(old_lines)+1) if lines[i:i+len(old_lines)]==old_lines]
            assert len(matches)==1,(base['id'],matches)
            start=matches[0]+1
            end=start+len(old_lines)-1
            focus=start+base['focusLine']-base['lineStart']
        assert start<=focus<=end,base['id']
        excerpt=chr(10).join(lines[start-1:end])
        change=dict(lineStart=start,lineEnd=end,focusLine=focus,fileHash=sha(file))
        if excerpt!=base['source']:
            assert base['id'] in RANGES,base['id']
            change.update(source=excerpt,sourceHash=sha(excerpt))
        change.update(DESCRIPTIONS.get(base['id'],{}))
        change={key:value for key,value in change.items() if base.get(key)!=value}
        if change: overrides[base['id']]=change
    additions=[]
    for base in ADDITIONS:
        file=source(base['file'])
        lines=file.splitlines()
        assert 1<=base['lineStart']<=base['focusLine']<=base['lineEnd']<=len(lines)
        excerpt=chr(10).join(lines[base['lineStart']-1:base['lineEnd']])
        additions.append({**base,'source':excerpt,'sourceHash':sha(excerpt),
            'fileHash':sha(file),'sourceKind':'fixed-commit-excerpt'})
    steps=[dict(s) for s in old['scenarios'][0]['steps']]
    inbox=dict(cardId='open-user-input-channel',cardIds=[c['id'] for c in additions],
        label='ACK 前打开用户输入队列',
        event='open_user_input_channel → inbox.open → _RequestInbox',
        evidence='函数追踪 · 8094',duration='未计时',status='observed',
        evidenceDetail='三处函数调用都在新分支追踪中出现；没有发送 chat_steer。')
    position=next(i for i,s in enumerate(steps) if s['cardId']=='worker-ack')
    steps.insert(position,inbox)
    boundary=next(s for s in steps if s['cardId']=='context-boundary')
    boundary.update(label='停在 pipeline.py 第 53 行执行前',event='ContextPipeline.build · L53',
        evidenceDetail='追踪器在 L53 执行前主动停止；model_validate 未运行，后续 Agent 流程未采集。',
        status='breakpoint')
    assembly=next(s for s in steps if s['cardId']=='chat-assembly')
    assembly['evidenceDetail']='装配函数执行到第 434 行，调用 ContextPipeline.build；第 443 行 AgentRequest 尚未构造。'
    run=dict(id=hit[0]['request_id'],snapshotId='3cb5173',
        name='develop_updata · 8094 采集 · L53 前',state='断点前停止',status='breakpoint',
        duration='未计时',date='2026-10-30 15:39',response=None,
        result='已收到 chat_ack；追踪器在 pipeline.py:53 执行前主动停止。没有最终回复。停止采集产生的 chat_error 不是业务故障。',
        requestId=hit[0]['request_id'],sessionId=hit[0]['session_id'],userId=hit[0]['user_id'],
        uiContext='采集时使用测试形状：page=workflow_canvas_page，visible.page_state={}；待用实际前端数据核对。',
        accessMode=hit[0]['access_mode'],traceFile=EVIDENCE)
    snapshot=dict(id='3cb5173',name='develop_updata · 固定提交',commit=COMMIT,date='2026-10-30',
        description='普通对话入口至 pipeline.py:53 执行前',breakpointLine=53,
        scope='仅普通对话入口至 pipeline.py:53 执行前；不是全仓覆盖',
        repositoryPath=str(ROOT))
    data=dict(snapshot=snapshot,run=run,steps=steps,overrides=overrides,additions=additions,
        changes=[dict(id=id,summary=summary) for id,summary in CHANGES])
    target=HERE/'updata-data.js'
    target.write_text('// Generated from fixed develop_updata commit; prior snapshot remains in real-data.js.'+chr(10)
        +'export const UPDATA_SNAPSHOT = '+json.dumps(data,ensure_ascii=False,indent=2)+';'+chr(10),encoding='utf-8')
    print(f'{len(overrides)} overlays, {len(additions)} new cards, {len(steps)} steps')

if __name__=='__main__': main()
