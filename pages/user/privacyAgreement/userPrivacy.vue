<template>
  <view class="container">
    <span class="text" selectable>
      我们重视你的个人信息与隐私保护。本协议用于说明在你使用本服务过程中，我们如何收集、使用、存储与保护信息，以及你享有的权利。本页面为原型阶段占位文本，正式上线时将以最终发布版本为准。
    </span>
    <span class="textNo">一、我们可能收集的信息：</span>
    <span class="text" selectable>
      为完成登录与身份核验，我们可能收集手机号、验证码验证结果、账号标识等。为支持任务执行与服务留痕，我们可能收集任务信息、服务记录、异常上报内容、上传的图片/文字说明等。为保障系统安全与稳定，我们可能收集设备型号、系统版本、浏览器信息、IP、日志与故障信息等。
    </span>

    <span class="textNo">二、我们如何使用信息：</span>
    <span class="text" selectable>
      我们会将信息用于实现核心功能（如任务分派、记录保存、消息通知）、改进产品体验、排查故障与安全风险、满足监管或审计要求（如适用）。除非取得你的授权或符合法律法规要求，我们不会将你的个人信息用于与提供本服务无关的目的。
    </span>

    <span class="textNo">三、信息共享与委托处理：</span>
    <span class="text" selectable>
      在提供服务所必需的范围内，我们可能与所属机构的管理端系统、短信服务商等合作方共享必要信息或委托其处理。我们会要求合作方遵守保密与安全义务，仅在授权范围内处理信息。除法律法规另有规定外，我们不会向无关第三方出售你的个人信息。
    </span>

    <span class="textNo">四、信息存储与保护：</span>
    <span class="text" selectable>
      我们会在合理必要期限内保存你的信息，并采取访问控制、传输加密、日志审计等措施保护数据安全。尽管我们已采取合理措施，但互联网环境下仍可能存在风险，如发生安全事件，我们将按规定进行处置与通知。
    </span>

    <span class="textNo">五、你的权利：</span>
    <span class="text" selectable>
      你有权查询、更正你的账号信息；在符合管理要求与法律规定的情况下，你可申请删除或注销相关信息。你也可以通过关闭页面、退出登录等方式停止使用本服务。部分信息为提供服务或合规留痕所必需，删除或注销可能导致你无法继续使用部分功能。
    </span>

    <span class="textNo">六、未成年人：</span>
    <span class="text" selectable>
      本服务面向机构护理与管理场景，通常不以未成年人为服务对象。如你认为我们误收集了未成年人信息，请联系管理员或客服，我们将按流程核实处理。
    </span>

    <span class="textNo">七、联系我们：</span>
    <span class="text" selectable>
      如你对隐私政策、信息安全或权利行使有疑问，可通过机构管理员或系统客服渠道联系。为便于处理，请提供账号、问题描述与相关时间信息。
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
