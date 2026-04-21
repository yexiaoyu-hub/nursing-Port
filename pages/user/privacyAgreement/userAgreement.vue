<template>
  <view class="container">
    <span class="text" selectable>
      欢迎使用本系统（以下称"本服务"）。为保障你的合法权益并明确双方责任，请在使用前仔细阅读本协议。你点击"同意/登录/进入"或实际使用本服务，即表示你已阅读并理解本协议的全部内容，并同意受其约束。本协议为原型阶段占位文本，正式上线时将以最终发布版本为准。
    </span>
    <span class="textNo">一、服务内容：</span>
    <span class="text" selectable>
      本服务用于提供护理人员移动端工作支持，包括但不限于任务查看、服务记录、异常上报、学习与消息等功能。我们会根据业务需要对功能进行更新、优化或调整，你理解并同意以实际提供的功能为准。
    </span>

    <span class="textNo">二、账号与使用规则：</span>
    <span class="text" selectable>
      你应保证提交的信息真实、准确、完整，并妥善保管账号信息。你不得以任何方式转让、出租或出借账号，不得利用本服务从事违法违规、侵害他人权益或破坏系统安全的行为。若你发现账号存在异常使用，应及时与管理员联系。
    </span>

    <span class="textNo">三、任务与记录：</span>
    <span class="text" selectable>
      系统展示的任务、老人信息、服务项目与时间等数据以业务系统为准。你应按流程如实填写服务记录与异常情况，不得伪造、篡改或恶意删除。因你个人操作不当导致的记录缺失、误报漏报等后果，需由你或所属机构按管理要求承担相应责任。
    </span>

    <span class="textNo">四、通知与消息：</span>
    <span class="text" selectable>
      本服务可能通过站内消息、短信或其他方式向你发送通知。你应及时关注相关信息。因你未及时查看或设备、网络等原因导致的通知未送达、延迟或无法显示，本服务不承担由此产生的直接或间接损失。
    </span>

    <span class="textNo">五、知识产权：</span>
    <span class="text" selectable>
      本服务中的页面、图标、文案、交互与程序等内容均受相关法律保护。未经授权，你不得复制、反向工程、出售或以其他方式非法使用。本服务中依法属于第三方的内容，其权利归第三方所有。
    </span>

    <span class="textNo">六、服务变更与中断：</span>
    <span class="text" selectable>
      为保障系统安全与稳定，我们可能进行维护、升级或故障处理，期间可能出现服务暂停或功能受限。我们将尽量提前通知并缩短影响时间，但对不可抗力或第三方原因导致的中断不承担超出法律规定范围的责任。
    </span>

    <span class="textNo">七、责任限制：</span>
    <span class="text" selectable>
      在法律允许的范围内，本服务对因网络、设备、运营商、系统维护或其他不可归责原因造成的使用异常不承担赔偿责任。你理解本服务以"现状"提供，我们将合理努力保障可用性，但不对绝对无误或持续可用作出保证。
    </span>

    <span class="textNo">八、协议更新：</span>
    <span class="text" selectable>
      我们可能对本协议进行修订并在页面公示。修订后如你继续使用本服务，即视为你接受更新内容；如你不同意更新，应停止使用并按流程退出账号或联系管理员处理。
    </span>

    <span class="textNo">九、联系我们：</span>
    <span class="text" selectable>
      如你对本协议、账号使用或服务流程有疑问，请通过机构管理员或系统客服渠道反馈。为便于处理，你可提供账号、时间与问题描述等信息。
    </span>
  </view>
</template>

<style lang="scss" scoped>
.container {
  padding: 20rpx;

  .textNo {
    display: block;
    font-size: 30rpx;
    font-weight: 600;
    color: #64748b;
    margin-top: 20rpx;
    margin-bottom: 10rpx;

    &:first-of-type {
      margin-top: 24rpx;
    }
  }

  .text {
    display: block;
    font-size: 14px;
    color: #64748b;
    line-height: 1.8;
  }
}
</style>
