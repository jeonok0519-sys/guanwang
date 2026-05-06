# Render 部署 SpringBoot + React SaaS 项目避坑知识库

## 适用场景

SpringBoot3.x + React/Vite 前后端分离架构，Render 平台线上部署、登录跨域、启动报错、接口404等问题统一解决方案。本知识库基于实际项目部署经验整理，涵盖真实踩坑案例。

---

# 一、后端核心踩坑 & 解决方案

## 1. 启动报错：Property 'spring.profiles' invalid

### 原因
SpringBoot3 废弃 `spring.profiles: prod` 写法，写在 yml 中直接启动崩溃、退出码1。

### 解决
1. **删掉 application-prod.yml 里所有 spring.profiles 配置**
2. 用纯净版 yml，不加任何多余配置

### 纯净可用 application-prod.yml 模板
```yaml
server:
  port: ${SERVER_PORT:8080}

spring:
  datasource:
    url: ${DB_URL}
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
  mapper-locations: classpath:/mapper/*.xml
  global-config:
    db-config:
      id-type: auto
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0

jwt:
  secret: ${JWT_SECRET:saas-platform-secret-key-for-jwt-token-generation-2024}
  expiration: ${JWT_EXPIRATION:7200000}
```

## 2. 跨域 CORS 报错（前端被拦截）

### 原因
yml 跨域配置不兼容、被 SpringSecurity 覆盖、多配置冲突。

### 最优方案（永久生效）
用 **全局过滤器** 硬编码跨域，不依赖配置文件，优先级最高。

### 方案一：全局过滤器（推荐）

#### 1）新建 CorsFilter.java
```java
package com.saas.admin.filter;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

public class CorsFilter implements Filter {
    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest request = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;

        response.setHeader("Access-Control-Allow-Origin", "https://saas-admin-frontend.onrender.com");
        response.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "*");
        response.setHeader("Access-Control-Allow-Credentials", "true");

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
            return;
        }
        chain.doFilter(req, res);
    }
}
```

#### 2）启动类注册过滤器
```java
@Bean
public FilterRegistrationBean<CorsFilter> corsFilterRegistration() {
    FilterRegistrationBean<CorsFilter> bean = new FilterRegistrationBean<>();
    bean.setFilter(new CorsFilter());
    bean.addUrlPatterns("/*");
    bean.setOrder(0);  // 确保优先级最高
    return bean;
}
```

### 方案二：WebMvcConfigurer 配置（备选）
```java
@Override
public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true)
            .maxAge(3600);
}
```

### 方案三：SecurityConfig 配置（配合使用）
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.addAllowedOriginPattern("*");
    configuration.addAllowedMethod("*");
    configuration.addAllowedHeader("*");
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 注意事项
- **禁止同时存在多个CORS配置**（CorsConfig + SecurityConfig + WebConfig）会冲突
- 删除独立的 CorsConfig.java，避免冲突
- 生产环境建议明确指定前端域名而非使用通配符

## 3. Controller 路径前缀问题

### 原因
前端请求路径 `/auth/login` 与后端 Controller 配置 `/api/auth/login` 不匹配，导致404。

### 解决
统一移除 Controller 的 `/api` 前缀，保持与前端请求一致：
```java
// 修改前
@RequestMapping("/api/auth")

// 修改后
@RequestMapping("/auth")
```

## 4. Dockerfile 生产环境配置

### 关键配置
```dockerfile
FROM eclipse-temurin:17-jdk-alpine
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn clean package -DskipTests

# 设置生产环境配置（关键！）
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-jar", "/app/target/saas-admin-1.0.0.jar"]
```

### 注意
- 必须设置 `SPRING_PROFILES_ACTIVE=prod` 才能加载 application-prod.yml
- 确保 pom.xml 中 finalName 与 jar 包名一致

## 5. 后端部署必看

- 禁止在 yml 里加：`spring.profiles`、`spring.web.cors`
- Render 环境变量必须配置：DB_URL、DB_USERNAME、DB_PASSWORD、JWT_SECRET、JWT_EXPIRATION
- 日志看到 `Your service is live` 才是真正启动成功
- 确认数据库连接信息正确，包括端口号和数据库名

---

# 二、前端核心踩坑 & 解决方案

## 1. 登录接口404

### 原因
.env.production 没配置后端地址 或 被 gitignore 忽略没上传到 GitHub。

### 解决
新建/编辑 `.env.production`
```env
VITE_API_BASE_URL=https://saas-admin-backend.onrender.com
```

**关键步骤**：必须提交推送到 GitHub，Render 才会生效。

## 2. .env 文件提交不了

### 原因
.gitignore 默认忽略 `.env*`

### 处理
方案一：临时注释忽略规则，提交后再恢复
```gitignore
# 临时注释
# .env*

# 或只忽略开发环境
.env.development
.env.local
```

方案二：直接在 GitHub 网页创建/编辑文件

## 3. Axios 配置要点

```typescript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true,  // 关键！允许携带凭证
});
```

## 4. Render 前端部署配置

- 构建命令：`npm run build`
- 输出目录：`dist`
- 环境变量：可在 Render 后台配置，优先级高于 .env 文件

---

# 三、快速排查流程

```
┌─────────────────────────────────────────────────────────────┐
│                    部署问题排查流程                           │
├─────────────────────────────────────────────────────────────┤
│  1. 前端 F12 → Network                                      │
│     ├─ 看请求地址是否正确                                    │
│     ├─ 看请求方法是否正确                                    │
│     └─ 看 Response 状态码                                   │
├─────────────────────────────────────────────────────────────┤
│  2. 根据错误类型定位                                         │
│     ├─ CORS → 后端跨域过滤器没加/域名写错                    │
│     ├─ 404 → 前端.env地址错误/后端路径不匹配                 │
│     ├─ 401 → 跨域已通，账号密码/JWT配置问题                  │
│     ├─ 500 → 后端服务内部错误，看日志                        │
│     └─ 0 → 网络不通，后端服务未启动                          │
├─────────────────────────────────────────────────────────────┤
│  3. 后端日志排查                                            │
│     ├─ 启动失败 → yml配置错误、依赖缺失                      │
│     ├─ 连接失败 → 数据库配置错误                            │
│     └─ 业务错误 → 代码逻辑问题                              │
└─────────────────────────────────────────────────────────────┘
```

---

# 四、通用 Git 提交快捷指令

## 后端提交
```bash
git add .
git commit -m "fix: 修复CORS跨域问题"
git push origin main
```

## 前端提交
```bash
git add .
git commit -m "fix: 配置生产环境后端地址"
git push origin main
```

## 分支问题处理
```bash
# 查看分支
git branch -a

# 重命名分支
git branch -m old-name new-name

# 强制推送到正确分支
git push -f origin main
```

---

# 五、避坑极简口诀

1. 后端 yml 不写 spring.profiles
2. 跨域只用过滤器，不用 yml 配
3. 前端 env 必须上传 GitHub
4. Controller 路径要与前端对齐
5. Dockerfile 设置生产环境变量
6. 先看日志再改代码，不瞎试

---

# 六、部署检查清单

## 部署前检查
- [ ] 后端 Controller 路径无前缀
- [ ] application-prod.yml 无 spring.profiles
- [ ] 跨域过滤器已配置
- [ ] Dockerfile 设置 SPRING_PROFILES_ACTIVE=prod
- [ ] 前端 .env.production 配置正确后端地址
- [ ] .env.production 已加入 git 版本控制

## 部署后验证
- [ ] 后端日志显示 `Your service is live`
- [ ] 前端页面正常显示
- [ ] 登录接口返回正常（非 CORS 错误）
- [ ] 核心接口（租户、操作员）CRUD 正常

---

**版本**: v1.0  
**更新时间**: 2024年  
**适用技术栈**: SpringBoot 3.x + React + Vite + Render