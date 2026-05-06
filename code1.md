# SaaS平台后台管理系统 - 编码总结文档

## 一、技术栈

### 后端技术栈
| 技术 | 版本 | 说明 |
|------|------|------|
| Java | 17 | 编程语言 |
| Spring Boot | 3.1.10 | 应用框架 |
| Spring Security | 6.x | 安全框架 |
| MyBatis-Plus | 3.5.7 | ORM框架 |
| MySQL | 8.0 | 数据库 |
| JWT | 0.12.3 | 令牌认证 |
| Lombok | 1.18.x | 简化代码 |

### 前端技术栈
| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18 | 前端框架 |
| TypeScript | 5.x | 类型安全 |
| Vite | 5.x | 构建工具 |
| TailwindCSS | 3.x | CSS框架 |
| shadcn/ui | latest | UI组件库 |
| Axios | 1.x | HTTP客户端 |
| Lucide React | latest | 图标库 |

---

## 二、项目结构

### 后端结构 (backend/)
```
backend/
├── src/main/java/com/saas/admin/
│   ├── config/          # 配置类
│   │   ├── SecurityConfig.java      # 安全配置
│   │   ├── WebConfig.java           # Web配置
│   │   ├── JwtAuthenticationFilter.java  # JWT过滤器
│   │   ├── MybatisPlusConfig.java   # MyBatis配置
│   │   └── GlobalExceptionHandler.java   # 全局异常处理
│   ├── controller/      # 控制器
│   │   ├── AuthController.java      # 认证接口
│   │   ├── TenantController.java    # 租户管理
│   │   └── OperatorController.java  # 操作员管理
│   ├── service/         # 服务层
│   │   ├── TenantService.java
│   │   └── OperatorService.java
│   ├── mapper/          # 数据访问层
│   │   ├── TenantMapper.java
│   │   └── OperatorMapper.java
│   ├── entity/          # 实体类
│   │   ├── Tenant.java
│   │   └── Operator.java
│   ├── dto/             # 数据传输对象
│   │   ├── LoginDTO.java
│   │   ├── TenantDTO.java
│   │   └── OperatorDTO.java
│   ├── util/            # 工具类
│   │   └── JwtUtil.java
│   ├── common/          # 通用类
│   │   └── R.java       # 统一响应封装
│   └── SaasAdminApplication.java  # 启动类
├── src/main/resources/
│   ├── application.yml  # 应用配置
│   └── db/
│       └── init.sql     # 数据库初始化脚本
└── pom.xml              # Maven配置
```

### 前端结构 (frontend/)
```
frontend/
├── src/
│   ├── components/      # 组件
│   │   ├── ui/          # UI基础组件
│   │   ├── Layout.tsx   # 布局组件
│   │   ├── Sidebar.tsx  # 侧边栏
│   │   └── Navbar.tsx   # 导航栏
│   ├── pages/           # 页面
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── TenantsPage.tsx
│   │   └── OperatorsPage.tsx
│   ├── services/        # API服务
│   │   ├── auth.ts
│   │   ├── tenant.ts
│   │   └── operator.ts
│   ├── store/           # 状态管理
│   │   └── auth.ts
│   ├── lib/             # 工具函数
│   │   ├── api.ts       # Axios封装
│   │   └── utils.ts
│   ├── types/           # TypeScript类型定义
│   │   └── index.ts
│   ├── App.tsx          # 根组件
│   ├── main.tsx         # 入口文件
│   └── index.css        # 全局样式
├── index.html
├── vite.config.ts       # Vite配置
├── tailwind.config.js   # Tailwind配置
└── package.json         # 依赖配置
```

---

## 三、前后端分离架构

### 3.1 架构特点
- **完全分离**: 前端和后端独立部署
- **RESTful API**: 统一的接口规范
- **JWT认证**: 无状态身份验证
- **CORS支持**: 跨域资源共享

### 3.2 认证流程
```
1. 用户登录 → POST /api/auth/login
2. 后端验证 → 返回JWT Token
3. 前端存储Token → localStorage
4. 后续请求 → Header: Authorization: Bearer {token}
5. JWT过滤器验证 → 设置请求属性
6. Controller处理 → 返回响应
```

### 3.3 统一响应格式
```java
public class R<T> {
    private Integer code;    // 状态码: 200成功, 401未授权, 403禁止, 500错误
    private String message;  // 提示信息
    private T data;          // 数据内容
}
```

---

## 四、数据库初始化

### 4.1 数据库配置
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/saas_admin?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai
    username: root
    password: root123
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 4.2 初始化脚本 (init.sql)
```sql
CREATE DATABASE IF NOT EXISTS saas_admin DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE saas_admin;

-- 租户表
CREATE TABLE IF NOT EXISTS sys_tenant (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tenant_name VARCHAR(100) NOT NULL,
    tenant_code VARCHAR(50) NOT NULL UNIQUE,
    status TINYINT NOT NULL DEFAULT 1,
    remark VARCHAR(255) DEFAULT NULL,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 操作员表
CREATE TABLE IF NOT EXISTS sys_operator (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    real_name VARCHAR(20) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status TINYINT NOT NULL DEFAULT 1,
    create_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 初始化超级管理员
INSERT INTO sys_operator (username, password, real_name, role, status) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '超级管理员', 'SUPER_ADMIN', 1);
```

---

## 五、关键代码实现

### 5.1 JWT工具类
```java
@Component
public class JwtUtil {
    @Value("${jwt.secret}")
    private String secret;
    
    @Value("${jwt.expiration}")
    private Long expiration;
    
    public String generateToken(Long userId, String username, String role) {
        return Jwts.builder()
                .subject(userId.toString())
                .claims(Map.of("username", username, "role", role))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .compact();
    }
    
    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(Keys.hmacShaKeyFor(secret.getBytes()))
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
```

### 5.2 JWT过滤器
```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) {
        String token = extractToken(request);
        if (StringUtils.hasText(token) && !jwtUtil.isTokenExpired(token)) {
            Long userId = jwtUtil.getUserId(token);
            String role = jwtUtil.getRole(token);
            request.setAttribute("userId", userId);
            request.setAttribute("role", role);
        }
        filterChain.doFilter(request, response);
    }
}
```

### 5.3 前端API封装
```typescript
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 六、Bug修复记录

### 6.1 问题汇总

| 序号 | 问题描述 | 根因分析 | 解决方案 |
|------|----------|----------|----------|
| 1 | 租户管理数据后台有但前台不显示 | LocalDateTime序列化失败 | 配置Jackson的JavaTimeModule |
| 2 | 操作员查询无数据 | 返回格式不匹配 | 修改OperatorController返回Map格式 |
| 3 | API返回500错误 | 时间类型无法序列化 | 禁用WRITE_DATES_AS_TIMESTAMPS |
| 4 | 密码字段泄露 | 查询时返回密码 | 在Service层设置password=null |
| 5 | Jar包无法运行 | 缺少主清单属性 | 配置spring-boot-maven-plugin的repackage |
| 6 | Bean定义冲突 | objectMapper重复定义 | 删除重复配置，保留一个Primary Bean |

### 6.2 关键修复代码

**修复LocalDateTime序列化**
```java
@Bean
@Primary
public ObjectMapper objectMapper() {
    ObjectMapper mapper = new ObjectMapper();
    mapper.registerModule(new JavaTimeModule());
    mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    return mapper;
}
```

**修复Operator查询返回格式**
```java
@GetMapping
public R<Map<String, Object>> list(...) {
    IPage<Operator> page = operatorService.page(current, size, keyword);
    Map<String, Object> result = new HashMap<>();
    result.put("records", page.getRecords());
    result.put("total", page.getTotal());
    result.put("size", page.getSize());
    result.put("current", page.getCurrent());
    return R.success(result);
}
```

---

## 七、测试方法

### 7.1 API测试示例

**登录测试**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**租户列表**
```bash
curl -X GET http://localhost:8080/api/tenants \
  -H "Authorization: Bearer <token>"
```

**新增租户**
```bash
curl -X POST http://localhost:8080/api/tenants \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"tenantName":"测试租户","tenantCode":"test001","status":1,"remark":"测试"}'
```

### 7.2 测试用例模板

| 模块 | 功能 | 测试步骤 | 预期结果 |
|------|------|----------|----------|
| 认证 | 登录 | POST /api/auth/login | 返回token和用户信息 |
| 认证 | 未登录访问 | GET /api/tenants | 返回401错误 |
| 租户 | 查询列表 | GET /api/tenants | 返回租户列表和分页信息 |
| 租户 | 新增 | POST /api/tenants | 成功创建，code=200 |
| 租户 | 更新 | PUT /api/tenants/{id} | 成功更新，code=200 |
| 租户 | 删除 | DELETE /api/tenants/{id} | 成功删除，code=200 |
| 操作员 | 查询列表 | GET /api/operators | 返回操作员列表，密码为null |
| 操作员 | 新增 | POST /api/operators | 成功创建，密码加密存储 |
| 操作员 | 删除 | DELETE /api/operators/{id} | 超级管理员不能删除 |

### 7.3 单元测试结构

```
backend/
└── src/test/java/com/saas/admin/
    ├── controller/
    │   ├── AuthControllerTest.java
    │   ├── TenantControllerTest.java
    │   └── OperatorControllerTest.java
    ├── service/
    │   ├── TenantServiceTest.java
    │   └── OperatorServiceTest.java
    └── util/
        └── JwtUtilTest.java
```

---

## 八、启动方式

### 8.1 开发环境启动

**后端启动**
```bash
cd backend
mvn spring-boot:run
```

**前端启动**
```bash
cd frontend
npm install
npm run dev
```

### 8.2 生产环境打包

**后端打包**
```bash
cd backend
mvn clean package -DskipTests
java -jar target/saas-admin-1.0.0.jar
```

**前端打包**
```bash
cd frontend
npm run build
```

### 8.3 Docker部署
```bash
docker-compose up --build -d
```

---

## 九、注意事项

### 9.1 安全注意事项
- 密码使用BCrypt加密存储
- JWT令牌设置过期时间
- 敏感接口验证用户权限
- 禁止返回密码等敏感信息

### 9.2 配置注意事项
- 数据库密码使用环境变量
- JWT密钥不应硬编码
- 生产环境关闭MyBatis日志
- 配置适当的CORS策略

### 9.3 开发注意事项
- 使用Lombok简化代码
- 遵循RESTful规范
- 使用DTO隔离实体类
- 添加全局异常处理

---

## 十、快速生成指南

### 10.1 新增业务模块步骤

1. **创建实体类** - entity/XX.java
2. **创建Mapper接口** - mapper/XXMapper.java
3. **创建Service层** - service/XXService.java
4. **创建Controller** - controller/XXController.java
5. **创建DTO** - dto/XXDTO.java
6. **前端API服务** - services/xx.ts
7. **前端页面** - pages/XXPage.tsx
8. **添加路由** - App.tsx

### 10.2 CRUD接口模板

```java
@RestController
@RequestMapping("/api/xxx")
public class XXController {
    
    @GetMapping
    public R<Map<String, Object>> list(...) { /* 查询列表 */ }
    
    @GetMapping("/{id}")
    public R<XX> getById(@PathVariable Long id) { /* 查询单个 */ }
    
    @PostMapping
    public R<Void> create(@RequestBody XX entity) { /* 新增 */ }
    
    @PutMapping("/{id}")
    public R<Void> update(@PathVariable Long id, @RequestBody XX entity) { /* 更新 */ }
    
    @DeleteMapping("/{id}")
    public R<Void> delete(@PathVariable Long id) { /* 删除 */ }
}
```

---

## 附录：常用命令

| 命令 | 说明 |
|------|------|
| `mvn clean compile` | 编译项目 |
| `mvn spring-boot:run` | 启动开发服务器 |
| `mvn package -DskipTests` | 打包项目 |
| `npm run dev` | 前端开发模式 |
| `npm run build` | 前端生产打包 |
| `docker-compose up` | 启动所有服务 |