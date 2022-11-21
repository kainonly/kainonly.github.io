---
weight: 10
title: 部署（待更新）
---

# 部署

主要包含镜像：

- ghcr.io/weplanx/api:latest
- ccr.ccs.tencentyun.com/weplanx/api:latest（国内）

案例将使用 Kubernetes 部署编排，复制部署内容（根据情况修改）：

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api.cfg
data:
  config.yml: |
    trusted_proxies:
      - 10.42.0.0/16
    namespace: <应用名称>
    key: <32位密文>
    database:
      uri: mongodb://<username>:<password>@<host>:<port>/<database>?authSource=<authSource>
      dbName: <database>
    redis:
      uri: redis://<user>:<password>@<host>:<port>/<db_number>
    nats:
      hosts:
        - "nats://a.nats:4222"
        - "nats://b.nats:4222"
        - "nats://c.nats:4222"
      nkey: "<nkey>"
    cors:
      allowOrigins:
        - https://console.****.com
      allowMethods:
        - POST
      allowHeaders:
        - Content-Type
        - Accept
      allowCredentials: true
      maxAge: 7200
    passport:
      aud: [ 'console' ]
      exp: 720
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  labels:
    app: api
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
        - image: ccr.ccs.tencentyun.com/weplanx/api:latest
          imagePullPolicy: Always
          name: api
          ports:
            - containerPort: 3000
          volumeMounts:
            - name: config
              mountPath: "/app/config"
              readOnly: true
      volumes:
        - name: config
          configMap:
            name: api.cfg
            items:
              - key: "config.yml"
                path: "config.yml"
```

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  ports:
    - port: 3000
      protocol: TCP
  selector:
    app: api

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    traefik.ingress.kubernetes.io/router.entrypoints: web,websecure
spec:
  rules:
    - host: api.****.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api
                port:
                  number: 3000
```

## 滚动更新

复制模板内容，并需要自行定制触发条件，原理是每次 patch 将模板中 `${tag}` 替换为版本执行

```yaml
spec:
  template:
    spec:
      containers:
        - image: ccr.ccs.tencentyun.com/weplanx/api:${tag}
          name: api
```

例如：在 Github Actions 中，国内可使用 **Coding 持续部署** 或 **云效流水线** 等

```shell
patch deployment api --patch "$(sed "s/\${tag}/${{steps.meta.outputs.version}}/" < ./config/patch.yml)"
```

## License

[BSD-3-Clause License](https://github.com/weplanx/api/blob/main/LICENSE)
