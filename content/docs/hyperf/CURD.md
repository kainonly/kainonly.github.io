---
weight: 10
title: CURD
---

# CURD

## Setup 安装

辅助 Hyperf 快速集成 CURD API 的工具集，首先需要安装依赖库 `kain/hyperf-curd`

```shell
composer require kain/hyperf-curd
```

在 `config/autoload/dependencies.php` 内完成关系配置

```php
return [
    Hyperf\Curd\CurdInterface::class => Hyperf\Curd\CurdService::class,
];
```

可以定义一个顶层抽象类注入依赖，例如

```php
use Hyperf\Curd\CurdInterface;
use Hyperf\Di\Annotation\Inject;
use Hyperf\Extra\Hash\HashInterface;
use Hyperf\Extra\Token\TokenInterface;
use Hyperf\Extra\Utils\UtilsInterface;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Hyperf\Validation\Contract\ValidatorFactoryInterface;

abstract class BaseController
{
    /
     * @Inject()
     * @var RequestInterface
     */
    protected RequestInterface $request;
    /
     * @Inject()
     * @var ResponseInterface
     */
    protected ResponseInterface $response;
    /
     * @Inject()
     * @var ValidatorFactoryInterface
     */
    protected ValidatorFactoryInterface $validation;
    /
     * @Inject()
     * @var CurdInterface
     */
    protected CurdInterface $curd;
    /
     * @Inject()
     * @var HashInterface
     */
    protected HashInterface $hash;
    /
     * @Inject()
     * @var TokenInterface
     */
    protected TokenInterface $token;
    /
     * @Inject()
     * @var UtilsInterface
     */
    protected UtilsInterface $utils;
}
```

## Builder 构造器

构造器是 CURD 的组装器，按需要可灵活组合成想要的逻辑

### 验证请求并返回数据

- should(array ![](https://g.yuque.com/gr/latex?rule%20%3D%20%5B%5D%2C%20...#card=math&code=rule%20%3D%20%5B%5D%2C%20...)extend): array

   - rule `array` 验证规则
   - extend `array` 扩展验证规则

例如，验证某个接口：

```php
public function bulkAdd(): array
{
    $body = $this->curd->should([
        'type_id' => 'required',
        'data' => 'required|array',
        'data.*.name' => 'required',
        'data.*.url' => 'required'
    ]);
    return [
        'error' => 0,
        'msg' => 'ok'
    ];
}
```

### 计划 curd 工厂

- model(string $name, array $body): CurdFactory

   - name `string` 模型名称
   - body `array` 请求数据
   - CurdFactory

      - where(array $value) 设置条件

         - value `array` 条件数组
      - query(Closure $value) 设置子查询

         - value `Closure` 闭包子查询，例如 `function ($query) {}`
      - orderBy(array $value) 设置排序

         - value `array` 排序数组，例如 `['create_time' => 'desc']`
      - select(array $value) 设置字段

         - value `array` 字段数组
      - autoTimestamp(bool $value, ?string $createAt = null, ?string $updateAt = null) 设置自动生成时间戳

         - value `bool` 是否开启
         - createAt `string` 创建时间字段
         - updateAt `string` 更新时间字段
      - afterHook(Closure $value) 后置周期

         - value `Closure` 闭包函数，例如 `function ($param) {}`
      - prepHook(Closure $value) 事务预处理周期

         - value `Closure` 闭包函数，例如 `function ($param) {}`
      - originLists() `array` 获取列表数据
      - lists() `array` 获取分页数据
      - get() `array` 获取数据
      - add() `array` 新增数据
      - edit() `array` 编辑数据
      - delete() `array` 删除数据

工厂最终包含了 `originLists()` `lists()` `get()` `add()` `edit()` `delete()` 执行输出方式，例如：

```php
// 示例
$body = $this->curd->should([
    ...
]);
$this->curd->model('acl', $body)
    ->where([
        ['status', '=', 1]
    ])
    ->select(['id', 'name'])
    ->orderBy(['create_time' => 'desc'])
    ->originLists();

// 示例
$body = $this->curd->should([
    ...
]);
$this->curd->model('acl', $body)
    ->afterHook(function (stdClass $param) {
        // $param->id 是 insertId
        Db::table('some_rel')->insert([
            'aid' => $param->id
        ]);
        return true;
    })
    ->add();
```

不同的执行输出不包含完整的构造子句

| 是否支持 | originLists | lists | get | add | edit | delete |
| --- | --- | --- | --- | --- | --- | --- |
| where | √ | √ | √ |  | √ | √ |
| query | √ | √ | √ |  |  |  |
| orderBy | √ | √ | √ |  |  |  |
| select | √ | √ | √ |  |  |  |
| autoTimestamp |  |  |  |  | √ | √ |
| afterHook |  |  |  | √ | √ | √ |
| prepHook |  |  |  |  |  | √ |


## Common 通用特征

通用特征可以快速生产 CURD 接口类，这需要继承抽象类 `CurdController` ，其中包含一些静态属性需要在单例中重写（注意：属性重写定义需当成常量，存在变量逻辑会受协程影响），你可以使用原顶层抽象继承它：

```php
use Hyperf\Curd\CurdController;
use Hyperf\Curd\CurdInterface;
use Hyperf\Di\Annotation\Inject;
use Hyperf\Extra\Hash\HashInterface;
use Hyperf\Extra\Token\TokenInterface;
use Hyperf\Extra\Utils\UtilsInterface;
use Hyperf\HttpServer\Contract\RequestInterface;
use Hyperf\HttpServer\Contract\ResponseInterface;
use Hyperf\Validation\Contract\ValidatorFactoryInterface;

abstract class BaseController extends CurdController
{
    /
     * @Inject()
     * @var RequestInterface
     */
    protected RequestInterface $request;
    /
     * @Inject()
     * @var ResponseInterface
     */
    protected ResponseInterface $response;
    /
     * @Inject()
     * @var ValidatorFactoryInterface
     */
    protected ValidatorFactoryInterface $validation;
    /
     * @Inject()
     * @var CurdInterface
     */
    protected CurdInterface $curd;
    /
     * @Inject()
     * @var HashInterface
     */
    protected HashInterface $hash;
    /
     * @Inject()
     * @var TokenInterface
     */
    protected TokenInterface $token;
    /
     * @Inject()
     * @var UtilsInterface
     */
    protected UtilsInterface $utils;
}
```

### 使用示例

以 `AclController` 为例，其中完整使用到 `OriginListsModel` `ListsModel` `GetModel` `AddModel` `EditModel` `DeleteModel`

```php
use App\RedisModel\System\AclRedis;
use App\RedisModel\System\RoleRedis;
use Hyperf\Curd\Common\AddModel;
use Hyperf\Curd\Common\DeleteModel;
use Hyperf\Curd\Common\EditModel;
use Hyperf\Curd\Common\GetModel;
use Hyperf\Curd\Common\ListsModel;
use Hyperf\Curd\Common\OriginListsModel;
use Hyperf\DbConnection\Db;
use Hyperf\Di\Annotation\Inject;
use stdClass;

class AclController extends BaseController
{
    use OriginListsModel, ListsModel, GetModel, AddModel, EditModel, DeleteModel;

    protected static string $model = 'acl';
    protected static array $addValidate = [
        'name' => 'required|array',
        'key' => 'required',
        'write' => 'sometimes|array',
        'read' => 'sometimes|array'
    ];
    protected static array $editValidate = [
        'name' => 'required_if:switch,false|array',
        'key' => 'required_if:switch,false',
        'write' => 'sometimes|array',
        'read' => 'sometimes|array'
    ];

    /
     * @Inject()
     * @var AclRedis
     */
    private AclRedis $aclRedis;
    /
     * @Inject()
     * @var RoleRedis
     */
    private RoleRedis $roleRedis;

    public function addBeforeHook(stdClass $ctx): bool
    {
        $this->before($ctx->body);
        return true;
    }

    public function addAfterHook(stdClass $ctx): bool
    {
        $this->clearRedis();
        return true;
    }

    public function editBeforeHook(stdClass $ctx): bool
    {
        if (!$ctx->switch) {
            $this->before($ctx->body);
        }
        return true;
    }

    public function editAfterHook(stdClass $ctx): bool
    {
        $this->clearRedis();
        return true;
    }

    private function before(array &$body): void
    {
        $body['name'] = json_encode($body['name'], JSON_UNESCAPED_UNICODE);
        $body['write'] = implode(',', (array)$body['write']);
        $body['read'] = implode(',', (array)$body['read']);
    }

    public function deleteAfterHook(stdClass $ctx): bool
    {
        $this->clearRedis();
        return true;
    }

    private function clearRedis(): void
    {
        $this->aclRedis->clear();
        $this->roleRedis->clear();
    }

    /
     * Exists Acl Key
     * @return array
     */
    public function validedKey(): array
    {
        $body = $this->request->post();
        if (empty($body['key'])) {
            return [
                'error' => 1,
                'msg' => 'require key'
            ];
        }

        $exists = Db::table('acl')
            ->where('key', '=', $body['key'])
            ->exists();

        return [
            'error' => 0,
            'data' => $exists
        ];
    }
}
```

### OriginListsModel 列表查询

相关属性

- model `string` 模型名称
- originListsValidate `array` 列表验证
- originListsCondition `array` 列表条件
- originListsOrders `array` 列表排序，默认 `['create_time' => 'desc']`
- originListsField `array` 列表字段

相关方法

- originListsConditionQuery(array $body) `Closure` 子查询

   - body `array` 请求数据
- originListsCustomReturn(array $body, array $result) `array` 自定义返回

   - body `array` 请求数据
   - result `array` 返回结果

### ListsModel 分页查询

相关属性

- model `string` 模型名称
- listsValidate `array` 分页验证
- listsCondition `array` 分页条件
- listsOrders `array` 分页排序，默认 `['create_time' => 'desc']`
- listsField `array` 分页字段

相关方法

- listsConditionQuery(array $body) `Closure` 子查询

   - body `array` 请求数据
- listsCustomReturn(array $body, array $result) `array` 自定义返回

   - body `array` 请求数据
   - result `array` 返回结果

### Get 数据查询

相关属性

- model `string` 模型名称
- getValidate `array` 数据验证
- getCondition `array` 数据条件
- getOrders `array` 数据排序
- getField `array` 数据字段

相关方法

- getConditionQuery(array $body) `Closure` 子查询

   - body `array` 请求数据
- getCustomReturn(array $body, array $result) `array` 自定义返回

   - body `array` 请求数据
   - result `array` 返回结果

### Add 新增

相关属性

- model `string` 模型名称
- autoTimestamp `bool` 自动更新时间戳，默认自动生成 `create_time` `update_time` 的时间戳
- addModel `string` 新增模型名称，重写后将替代 `model`
- addValidate `array` 新增验证

相关方法

- addBeforeHook(stdClass $ctx) `bool` 前置周期

   - ctx `stdClass` 上下文变量
- addAfterHook(stdClass $ctx) `bool` 后置周期

   - ctx `stdClass` 上下文变量

### Edit 修改

- model `string` 模型名称
- autoTimestamp `bool` 自动更新时间戳，默认自动更新 `update_time` 的时间戳
- editModel `string` 编辑模型名称，重写后将替代 `model`
- editValidate `array` 编辑验证
- editCondition `array` 编辑条件

相关方法

- editBeforeHook(stdClass $ctx) `bool` 前置周期

   - ctx `stdClass` 上下文变量
- editAfterHook(stdClass $ctx) `bool` 后置周期

   - ctx `stdClass` 上下文变量

### Delete 删除

- model `string` 模型名称
- deleteModel `string` 删除模型名称，重写后将替代 `model`
- deleteValidate `array` 删除验证
- deleteCondition `array` 删除条件

相关方法

- deleteBeforeHook(stdClass $ctx) `bool` 前置周期

   - ctx `stdClass` 上下文变量
- deletePrepHook(stdClass $ctx) `bool` 事务预处理周期

   - ctx `stdClass` 上下文变量
- deleteAfterHook(stdClass $ctx) `bool` 后置周期

   - ctx `stdClass` 上下文变量
