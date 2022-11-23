---
weight: 10
title: CURD
---

## 模型控制器

CurdController 辅助 CURD 模型库的主控制器属性都继承于此，CurdController 控制器已经包含了默认的 BaseController，开发中可以再渡继承处理，例如

```php
use think\bit\CurdController;

abstract class Base extends CurdController
{
    protected $middleware = ['cors', 'json', 'post', 'auth'];

    protected function initialize()
    {
        if ($this->request->isPost()) {
            $this->post = $this->request->post();
        }
    }
}
```

### 公共属性

- **model** `string` 模型名称
- **post** `array` 请求 body，默认 `[]`

### 获取列表数据请求属性

- **origin_lists_default_validate** `array` 列表数据默认验证，默认

```php
[
    'where' => 'array'
];
```

- **origin_lists_before_result** `array` 默认前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **origin_lists_condition** `array` 列表查询条件，默认 `[]`
- **origin_lists_condition_query** `Closure|null` 列表查询闭包条件，默认 `null`
- **origin_lists_orders** `array` 列表数据排序，默认

```php
[
    'create_time' => 'desc'
];
```

- **origin_lists_field** `array` 列表数据指定返回字段，默认 `[]`
- **origin_lists_without_field** `array` 列表数据指定排除的返回字段，默认

```php
[
    'update_time',
    'create_time'
];
```

### 获取分页数据请求属性

- **lists_default_validate** `array` 分页数据默认验证器，默认

```php
[
    'page' => 'require',
    'page.limit' => 'require|number|between:1,50',
    'page.index' => 'require|number|min:1',
    'where' => 'array'
];
```

- **lists_before_result** `array` 分页数据前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **lists_condition** `array` 分页数据查询条件，默认 `[]`
- **lists_condition_query** `Closure|null` 分页数据查询闭包条件，默认 `null`
- **lists_orders** `array` 分页数据排序，默认

```php
[
    'create_time' => 'desc'
];
```

- **lists_field** `array` 分页数据限制字段，默认 `[]`
- **lists_without_field** `array` 分页数据指定排除的返回字段，默认

```php
[
    'update_time',
    'create_time'
];
```

### 获取单条数据请求属性

- **get_default_validate** `array` 单条数据默认验证器，默认

```php
[
    'id' => 'requireWithout:where|number',
    'where' => 'requireWithout:id|array'
];
```

- **get_before_result** `array` 单条数据前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **get_condition** `array` 单条数据查询条件，默认 `[]`
- **get_field** `array` 单条数据限制字段，默认 `[]`
- **get_without_field** `array` 单条数据指定排除的返回字段，默认

```php
[
    'update_time',
    'create_time'
];
```

### 新增数据请求属性

- **add_model** `string` 分离新增模型名称，默认 `null`
- **add_default_validate** `array` 新增数据默认验证器，默认 `[]`
- **add_auto_timestamp** `bool` 自动更新字段 `create_time` `update_time` 的时间戳，默认 `true`
- **add_before_result** `array` 新增数据前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **add_after_result** `array` 新增数据后置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

- **add_fail_result** `array` 新增数据失败返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:insert_fail'
];
```

### 修改数据请求属性

- **edit_model** `string` 分离编辑模型名称，默认 `null`
- **edit_default_validate** `array` 编辑默认验证器，默认

```php
[
    'id' => 'require|number',
    'switch' => 'require|bool'
];
```

- **edit_auto_timestamp** `bool` 自动更新字段 `update_time` 的时间戳，默认 `true`
- **edit_switch** `boolean` 是否仅为状态编辑，默认 `false`
- **edit_before_result** `array` 编辑前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **edit_condition** `array` 编辑查询条件，默认 `[]`
- **edit_fail_result** `array` 编辑失败返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:fail'
];
```

- **edit_after_result** `array` 编辑后置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

### 删除数据请求属性

- **delete_model** `string` 分离删除模型名称，默认 `null`
- **delete_default_validate** `array` 删除默认验证器，默认

```php
[
    'id' => 'require'
];
```

- **delete_before_result** `array` 删除前置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

- **delete_condition** `array` 删除查询条件，默认 `[]`
- **delete_prep_result** `array` 事务开始之后数据写入之前返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:prep_fail'
];
```

- **delete_fail_result** `array` 删除失败返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:fail'
];
```

- **delete_after_result** `array` 删除后置返回结果，默认

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

## 获取单个数据

GetModel 获取单条数据的通用请求处理，请求 `body` 可使用 id 或 where 字段进行查询，二者选一

- **id** `int|string` 主键
- **where** `array` 查询条件

where 必须使用数组查询方式来定义，例如

```json
{
  "where": [["name", "=", "van"]]
}
```

如果查询条件为 JSON

```json
{
  "where": [["extra->nickname", "=", "kain"]]
}
```

将 `think\bit\common\GetModel` 引入，然后定义模型 **model** 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';
}
```

自定义验证器为 **get_default_validate** ，验证器与 ThinkPHP 验证器使用一致，默认为

```php
[
    'id' => 'require'
];
```

也可以在控制器中针对性修改

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';
    protected $get_default_validate = [
        'id' => 'require',
        'name' => 'require'
    ];
}
```

如自定义前置处理，则需要继承生命周期 `think\bit\lifecycle\GetBeforeHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\GetBeforeHooks;
use think\bit\common\GetModel;

class AdminClass extends BaseController implements GetBeforeHooks {
    use GetModel;

    protected $model = 'admin';

    public function getBeforeHooks(): bool
    {
        return true;
    }
}
```

_getBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **get_before_result** 属性的值，默认为：

```php
protected $get_before_result = [
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\GetBeforeHooks;
use think\bit\common\GetModel;

class AdminClass extends BaseController implements GetBeforeHooks {
    use GetModel;

    protected $model = 'admin';

    public function getBeforeHooks(): bool
    {
        $this->get_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如需要给接口在后端就设定固定条件，只需要重写 **get_condition**，默认为

```php
$get_condition = [];
```

例如加入企业主键限制

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';
    protected $get_condition = [
        ['enterprise', '=', 1]
    ];
}
```

如果接口的查询条件较为特殊，可以重写 **get_condition_query**

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;
use think\App;
use think\db\Query;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';

    public function construct(App $app = null)
    {
        parent::construct($app);
        $this->get_condition_query = function (Query $query) {
            $query->json(['schema'])
        };
    }
}
```

在条件查询下使用排序，只需要重写 **get_orders**，默认为

```php
$get_orders = ['create_time' => 'desc'];
```

多属性排序

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';
    protected $lists_orders = ['age', 'create_time' => 'desc'];
}
```

排序同样允许请求 `body` 来合并定义，例如：

- order `object` 排序条件

```json
{
  "order": {
    "age": "desc"
  }
}
```

如需要给接口指定返回字段，只需要重写 **get_field** 或 **get_without_field**，默认为

```php
$get_field = [];
$get_without_field = ['update_time', 'create_time'];
```

{{<hint waring>}}

**get_field** 即指定显示字段，**get_without_field** 为排除的显示字段，二者无法共用

{{</hint>}}

例如返回除 update_time 修改时间所有的字段

```php
use app\system\controller\BaseController;
use think\bit\common\GetModel;

class AdminClass extends BaseController {
    use GetModel;

    protected $model = 'admin';
    protected $get_without_field = ['update_time'];
}
```

如自定义返回结果，则需要继承生命周期 `think\bit\lifecycle\GetCustom`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\GetCustom;
use think\bit\common\GetModel;

class AdminClass extends BaseController implements GetCustom {
    use GetModel;

    protected $model = 'admin';

    public function getCustomReturn(array $data): array
    {
        return [
            'error' => 0,
            'data' => $data
        ];
    }
}
```

_getCustomReturn_ 需要返回整体的响应结果

```php
[
    'error' => 0,
    'data' => []
];
```

- **data** `array` 原数据

## 获取列表数据

OriginListsModel 列表数据的通用请求处理，请求 `body` 使用数组查询方式来定义

- **where** `array` 查询条件

{{<hint warning>}}

请求中的 **where** 还会与 **origin_lists_condition** 合并条件

{{</hint>}}

**where** 必须使用数组查询方式来定义，例如

```json
{
  "where": [["name", "=", "kain"]]
}
```

如果条件中包含模糊查询

```json
{
  "where": [["name", "like", "%v%"]]
}
```

如果查询条件为 JSON

```json
{
  "where": [["extra->nickname", "=", "kain"]]
}
```

将 think\bit\common\OriginListsModel 引入，然后定义模型 model 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController {
    use OriginListsModel;

    protected $model = 'admin';
}
```

创建验证器场景 validate/AdminClass， 并加入场景 `origin`

```php
use think\Validate;

class AdminClass extends Validate
{
    protected $rule = [
        'status' => 'require',
    ];

    protected $scene = [
        'origin' => ['status'],
    ];
}
```

可定义固定条件属性 **origin_lists_condition**，默认为 `[]`

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;

class NoBodyClass extends BaseController {
    use OriginListsModel;

    protected $model = 'nobody';
    protected $origin_lists_condition = [
        ['status', '=', 1]
    ];
}
```

如果接口的查询条件较为特殊，可以重写 **origin_lists_condition_query**

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;
use think\App;
use think\db\Query;

class NoBodyClass extends BaseController {
    use OriginListsModel;

    protected $model = 'nobody';

    public function construct(App $app = null)
    {
        parent::construct($app);
        $this->origin_lists_condition_query = function (Query $query) {
            $query->whereOr([
                'type' => 1
            ]);
        };
    }
}
```

如自定义前置处理，则需要继承生命周期 `think\bit\lifecycle\OriginListsBeforeHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\OriginListsBeforeHooks;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController implements OriginListsBeforeHooks {
    use OriginListsModel;

    protected $model = 'admin';

    public function originListsBeforeHooks(): bool
    {
        return true;
    }
}
```

_originListsBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **origin_lists_before_result** 属性的值，默认为：

```php
protected $origin_lists_before_result = [
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\OriginListsBeforeHooks;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController implements OriginListsBeforeHooks {
    use OriginListsModel;

    protected $model = 'admin';

    public function originListsBeforeHooks(): bool
    {
        $this->origin_lists_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如需要给接口在后端就设定固定条件，只需要重写 **origin_lists_condition**，默认为

```php
$origin_lists_condition = [];
```

例如加入企业主键限制

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController {
    use OriginListsModel;

    protected $model = 'admin';
    protected $origin_lists_condition = [
        ['enterprise', '=', 1]
    ];
}
```

如果需要列表按条件排序，只需要重写 **origin_lists_orders**，默认为

```php
protected $origin_lists_orders = ['create_time' => 'desc'];
```

多属性排序

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController {
    use OriginListsModel;

    protected $model = 'admin';
    protected $origin_lists_orders =  ['age', 'create_time' => 'desc'];
}
```

排序同样允许请求 `body` 来合并定义，例如：

- order `object` 排序条件

```json
{
  "order": {
    "age": "desc"
  }
}
```

如需要给接口限制返回字段，只需要重写 **origin_lists_field**，默认为

```php
protected $origin_lists_field = [];
protected $origin_lists_without_field = ['update_time', 'create_time'];
```

例如返回除 **update_time** 修改时间所有的字段

```php
use app\system\controller\BaseController;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController {
    use OriginListsModel;

    protected $model = 'admin';
    protected $origin_lists_without_field = ['update_time'];
}
```

如自定义返回结果，则需要继承生命周期 `think\bit\lifecycle\OriginListsCustom`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\OriginListsCustom;
use think\bit\common\OriginListsModel;

class AdminClass extends BaseController implements OriginListsCustom {
    use OriginListsModel;

    protected $model = 'admin';

    public function originListsCustomReturn(Array $lists): array
    {
        return [
            'error' => 0,
            'data' => $lists
        ];
    }
}
```

_originListsCustomReturn_ 需要返回整体的响应结果

```php
return json([
    'error' => 0,
    'data' => []
]);
```

- **data** `array` 原数据

## 获取分页数据

ListsModel 分页数据的通用请求处理，请求 `body` 使用数组查询方式来定义

- **where** `array` 查询条件

{{<hint waring>}}

请求中的 **where** 还会与 **lists_condition** 合并条件

{{</hint>}}

**where** 必须使用数组查询方式来定义，例如

```json
{
  "where": [["name", "=", "kain"]]
}
```

如果条件中包含模糊查询

```json
{
  "where": [["name", "like", "%v%"]]
}
```

如果查询条件为 JSON

```json
{
  "where": [["extra->nickname", "=", "kain"]]
}
```

将 `think\bit\common\ListsModel` 引入，然后定义模型 **model** 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\ListsModel;

class AdminClass extends BaseController {
    use ListsModel;

    protected $model = 'admin';
}
```

如自定义前置处理，则需要调用生命周期 `think\bit\lifecycle\ListsBeforeHooks`

```php
use app\system\controller\BaseController;use think\bit\common\ListsModel;
use think\bit\lifecycle\ListsBeforeHooks;

class AdminClass extends BaseController implements ListsBeforeHooks {
    use ListsModel;

    protected $model = 'admin';

    public function listsBeforeHooks(): bool
    {
        return true;
    }
}
```

_listsBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **lists_before_result** 属性的值，默认为：

```php
$lists_before_result = [
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\ListsBeforeHooks;
use think\bit\common\ListsModel;

class AdminClass extends BaseController implements ListsBeforeHooks {
    use ListsModel;

    protected $model = 'admin';

    public function listsBeforeHooks(): bool
    {
        $this->lists_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如需要给接口在后端就设定固定条件，只需要重写 **lists_condition**，默认为

```php
$lists_condition = [];
```

例如加入企业主键限制

```php
use app\system\controller\BaseController;
use think\bit\common\ListsModel;

class AdminClass extends BaseController {
    use ListsModel;

    protected $model = 'admin';
    protected $lists_condition = [
        ['enterprise', '=', 1]
    ];
}
```

如果接口的查询条件较为特殊，可以重写 **lists_condition_query**

```php
use app\system\controller\BaseController;
use think\bit\common\ListsModel;
use think\App;
use think\db\Query;

class AdminClass extends BaseController {
    use ListsModel;

    protected $model = 'admin';

    public function construct(App $app = null)
    {
        parent::construct($app);
        $this->lists_condition_query = function (Query $query) {
            $query->whereOr([
                'type' => 1
            ]);
        };
    }
}
```

如果需要列表按条件排序，只需要重写 **lists_orders**，默认为

```php
$lists_orders = ['create_time' => 'desc'];
```

多属性排序

```php
use app\system\controller\BaseController;
use think\bit\common\ListsModel;

class AdminClass extends BaseController {
    use ListsModel;

    protected $model = 'admin';
    protected $lists_orders = ['age', 'create_time' => 'desc'];
}
```

排序同样允许请求 `body` 来合并定义，例如：

- order `object` 排序条件

```json
{
  "order": {
    "age": "desc"
  }
}
```

如需要给接口限制返回字段，只需要重写 **lists_field** 或 **lists_without_field**，默认为

```php
$lists_field = [];
$lists_without_field = ['update_time', 'create_time'];
```

例如返回除 **update_time** 修改时间所有的字段

```php
use app\system\controller\BaseController;
use think\bit\common\ListsModel;

class AdminClass extends BaseController {
    use ListsModel;

    protected $model = 'admin';
    protected $lists_without_field = ['update_time'];
}
```

如自定义返回结果，则需要继承生命周期 `think\bit\lifecycle\ListsCustom`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\ListsCustom;
use think\bit\common\ListsModel;

class AdminClass extends BaseController implements ListsCustom {
    use ListsModel;

    protected $model = 'admin';

    public function listsCustomReturn(Array $lists, int $total): array
    {
        return [
            'error' => 0,
            'data' => [
                'lists' => $lists,
                'total' => $total,
            ]
        ];
    }
}
```

_listsCustomReturn_ 需要返回整体的响应结果

```php
return [
    'error' => 0,
    'data' => [
        'lists' => [],
        'total' => [],
    ]
];
```

- **data** `array` 原数据

## 新增数据

AddModel 新增数据的通用请求处理

将 `think\bit\common\AddModel` 引入，然后定义模型 **model** 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\AddModel;

class AdminClass extends BaseController {
    use AddModel;

    protected $model = 'admin';
}
```

创建验证器场景 `validate/AdminClass`， 并加入场景 `add`

```php
use think\Validate;

class AdminClass extends Validate
{
    protected $rule = [
        'name' => 'require',
    ];

    protected $scene = [
        'add' => ['name'],
    ];
}
```

如自定义前置处理（发生在验证之后与数据写入之前），则需要继承生命周期 `think\bit\lifecycle\AddBeforeHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\AddBeforeHooks;
use think\bit\common\AddModel;

class AdminClass extends BaseController implements AddBeforeHooks {
    use AddModel;

    protected $model = 'admin';

    public function addBeforeHooks(): bool
    {
        return true;
    }
}
```

_addBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **add_before_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\AddBeforeHooks;
use think\bit\common\AddModel;

class AdminClass extends BaseController implements AddBeforeHooks {
    use AddModel;

    protected $model = 'admin';

    public function addBeforeHooks(): bool
    {
        $this->add_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如自定义后置处理（发生在写入成功之后与提交事务之前），则需要调用生命周期 `think\bit\lifecycle\AddAfterHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\AddAfterHooks;
use think\bit\common\AddModel;

class AdminClass extends BaseController implements AddAfterHooks {
    use AddModel;

    protected $model = 'admin';

    public function addAfterHooks($pk): bool
    {
        return true;
    }
}
```

pk 为模型写入后返回的主键，_addAfterHooks_ 的返回值为 `false` 则在此结束执行进行事务回滚，并返回 **add_after_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

在生命周期函数中可以通过重写自定义后置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\AddAfterHooks;
use think\bit\common\AddModel;

class AdminClass extends BaseController implements AddAfterHooks {
    use AddModel;

    protected $model = 'admin';

    public function addAfterHooks($pk): bool
    {
        $this->add_after_result = [
            'error'=> 1,
            'msg'=> 'error:redis'
        ];
        return false;
    }
}
```

## 编辑数据

EditModel 修改数据的通用请求处理，请求 `body` 可使用 **id** 或 **where** 字段进行查询，二者选一

- **id** `int|string` 主键
- **where** `array` 查询条件

**where** 必须使用数组查询方式来定义，例如

```json
{
  "where": [["name", "=", "van"]]
}
```

如果查询条件为 JSON

```json
{
  "where": [["extra->nickname", "=", "kain"]]
}
```

将 `think\bit\common\EditModel` 引入，然后定义模型 **model** 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\EditModel;

class AdminClass extends BaseController {
    use EditModel;

    protected $model = 'admin';
}
```

自定义删除验证器为 **edit_default_validate**，默认为

```php
[
    'id' => 'require',
    'switch' => 'bool'
];
```

也可以在控制器中针对性修改

```php
use app\system\controller\BaseController;
use think\bit\common\EditModel;

class AdminClass extends BaseController {
    use EditModel;

    protected $model = 'admin';
    protected $edit_default_validate = [
        'id' => 'require',
        'switch' => 'bool',
        'status' => 'require',
    ];
}
```

应创建验证器场景 `validate/AdminClass`，**edit_switch** 为 `false` 下有效， 并加入场景 `edit`

```php
use think\Validate;

class AdminClass extends Validate
{
    protected $rule = [
        'name' => 'require',
    ];

    protected $scene = [
        'edit' => ['name'],
    ];
}
```

如自定义前置处理（发生在验证之后与数据写入之前），则需要继承生命周期 `think\bit\lifecycle\EditBeforeHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\EditBeforeHooks;
use think\bit\common\EditModel;

class AdminClass extends BaseController implements EditBeforeHooks {
    use EditModel;

    protected $model = 'admin';

    public function editBeforeHooks() :bool
    {
        return true;
    }
}
```

_editBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **edit_before_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\EditBeforeHooks;
use think\bit\common\EditModel;

class AdminClass extends BaseController implements EditBeforeHooks {
    use EditModel;

    protected $model = 'admin';

    public function editBeforeHooks(): bool
    {
        $this->edit_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如自定义后置处理（发生在写入成功之后与提交事务之前），则需要继承生命周期 `think\bit\lifecycle\EditAfterHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\EditAfterHooks;
use think\bit\common\EditModel;

class AdminClass extends BaseController implements EditAfterHooks {
    use EditModel;

    protected $model = 'admin';

    public function editAfterHooks(): bool
    {
        return true;
    }
}
```

_editAfterHooks_ 的返回值为 `false` 则在此结束执行进行事务回滚，并返回 **edit_after_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

在生命周期函数中可以通过重写自定义后置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\EditAfterHooks;
use think\bit\common\EditModel;

class AdminClass extends BaseController implements EditAfterHooks {
    use EditModel;

    protected $model = 'admin';

    public function editAfterHooks(): bool
    {
        $this->edit_after_result = [
            'error'=> 1,
            'msg'=> 'error:redis'
        ];
        return false;
    }
}
```

## 删除数据

DeleteModel 删除数据的通用请求处理，请求 `body` 可使用 **id** 或 **where** 字段进行查询，二者选一

- **id** `int|string` 主键
- **where** `array` 查询条件

**where** 必须使用数组查询方式来定义，例如

```json
{
  "where": [["name", "=", "van"]]
}
```

如果查询条件为 JSON

```json
{
  "where": [["extra->nickname", "=", "kain"]]
}
```

将 `think\bit\common\DeleteModel` 引入，然后定义模型 **model** 的名称（即表名称）

```php
use app\system\controller\BaseController;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController {
    use DeleteModel;

    protected $model = 'admin';
}
```

自定义删除验证器为 **delete_validate**，默认为

```php
[
    'id' => 'require'
];
```

也可以在控制器中针对性修改

```php
use app\system\controller\BaseController;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController {
    use DeleteModel;

    protected $model = 'admin';
    protected $delete_validate = [
        'id' => 'require',
        'name' => 'require'
    ];
}
```

如自定义前置处理（发生在验证之后与数据删除之前），则需要继承生命周期 `think\bit\lifecycle\DeleteBeforeHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeleteBeforeHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeleteBeforeHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deleteBeforeHooks(): bool
    {
        return true;
    }
}
```

_deleteBeforeHooks_ 的返回值为 `false` 则在此结束执行，并返回 **delete_before_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:before_fail'
];
```

在生命周期函数中可以通过重写自定义前置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeleteBeforeHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeleteBeforeHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deleteBeforeHooks(): bool
    {
        $this->delete_before_result = [
            'error'=> 1,
            'msg'=> 'error:only'
        ];
        return false;
    }
}
```

如该周期处理，则需要继承生命周期 `think\bit\lifecycle\DeletePrepHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeletePrepHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeletePrepHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deletePrepHooks(): bool
    {
        return true;
    }
}
```

_deletePrepHooks_ 的返回值为 `false` 则在此结束执行进行事务回滚，并返回 **delete_prep_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:prep_fail'
];
```

在生命周期函数中可以通过重写自定义返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeletePrepHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeletePrepHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deletePrepHooks(): bool
    {
        $this->delete_prep_result = [
            'error'=> 1,
            'msg'=> 'error:insert'
        ];
        return false;
    }
}
```

如自定义后置处理（发生在数据删除成功之后与提交事务之前），则需要继承生命周期 `think\bit\lifecycle\DeleteAfterHooks`

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeleteAfterHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeleteAfterHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deleteAfterHooks(): bool
    {
        return true;
    }
}
```

_deleteAfterHooks_ 的返回值为 `false` 则在此结束执行进行事务回滚，并返回 **delete_after_result** 属性的值，默认为：

```php
[
    'error' => 1,
    'msg' => 'error:after_fail'
];
```

在生命周期函数中可以通过重写自定义后置返回

```php
use app\system\controller\BaseController;
use think\bit\lifecycle\DeleteAfterHooks;
use think\bit\common\DeleteModel;

class AdminClass extends BaseController implements DeleteAfterHooks {
    use DeleteModel;

    protected $model = 'admin';

    public function deleteAfterHooks(): bool
    {
        $this->delete_after_result = [
            'error'=> 1,
            'msg'=> 'error:redis'
        ];
        return false;
    }
}
```
