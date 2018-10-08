/**
 * 前置条件判断
 * @author fuxiao
 * @email fuxiao9@crv.com.cn
 * @date 2017-07-28
 */

Preconditions = (function () {
    return {
        /**
         * 确保 `expression` 值为 true, 否则抛出 `errorMessage` 异常信息
         * @param expression 一个 `boolean` 表达式: 当 `expression` 结果为 `false` 时, 抛出 `errorMessage` 异常消息对象
         * @param errorMessage 异常的消息内容
         */
        checkArgument: function (expression, errorMessage) {
            if (!expression) throw new Error(errorMessage);
        }
    }
})();