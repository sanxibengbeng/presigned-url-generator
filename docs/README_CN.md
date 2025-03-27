# Lambda S3 预签名URL生成器

这个项目使用AWS Lambda和API Gateway创建一个无服务器服务，用于生成S3对象的预签名URL，有效期为2小时。该项目可部署在AWS全球区域和中国区域。

![架构图](./images/arch.drawio.png)

## 架构概述

该应用程序由以下AWS服务组成：

- **AWS Lambda**: 执行生成预签名URL的逻辑
- **API Gateway**: 提供HTTP接口来触发Lambda函数
- **IAM Role**: 授予Lambda访问S3的必要权限
- **AWS CDK**: 用于部署整个基础设施

## 工作流程

1. 用户通过API Gateway发送HTTP GET请求，包含对象键参数
2. API Gateway调用Lambda函数处理请求
3. Lambda使用IAM角色访问S3并生成预签名URL (有效期2小时)
4. 预签名URL通过API Gateway返回给用户
5. 用户可以使用预签名URL直接访问S3对象，无需AWS凭证

## 前提条件

- Node.js 14.x 或更高版本
- AWS CLI 已配置，具有适当的区域凭证
- AWS CDK 已安装 (`npm install -g aws-cdk`)

## 部署选项

### 全球区域部署（如us-east-1）

1. 修改`bin/lambda-gen-s3.ts`文件，设置区域为全球区域：

```typescript
const app = new cdk.App();
new LambdaGenS3Stack(app, 'LambdaGenS3Stack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'us-east-1'  // 设置为所需的全球区域
  },
  description: '用于生成S3预签名URL的Lambda和API Gateway',
});
```

2. 修改`lambda/index.js`文件中的区域设置：

```javascript
// 使用全球区域的S3客户端
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1', // 使用全球区域
});
```

3. 如果需要设置默认桶，可以在`lib/lambda-gen-s3-stack.ts`中配置环境变量：

```typescript
environment: {
  // 设置默认的桶名称
  DEFAULT_BUCKET: 'your-bucket-name',
},
```

### 中国区域部署（cn-north-1或cn-northwest-1）

1. 修改`bin/lambda-gen-s3.ts`文件，设置区域为中国区域：

```typescript
const app = new cdk.App();
new LambdaGenS3Stack(app, 'LambdaGenS3Stack', {
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: 'cn-north-1'  // 或 'cn-northwest-1'
  },
  description: '用于生成S3预签名URL的Lambda和API Gateway',
});
```

2. 修改`lambda/index.js`文件中的区域设置：

```javascript
// 中国区域的S3客户端
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'cn-north-1', // 或 'cn-northwest-1'
});
```

## 部署步骤

1. 克隆此仓库
2. 安装依赖：

```bash
# 安装主项目依赖
npm install

# 安装Lambda函数依赖
cd lambda
npm install
cd ..
```

3. 引导CDK（如果这是您第一次在此AWS账户/区域中使用CDK）：

```bash
cdk bootstrap aws://ACCOUNT-NUMBER/REGION
```

4. 部署堆栈：

```bash
cdk deploy
```

5. 部署完成后，您将获得一个API Gateway URL，可以用于生成预签名URL。

## 使用方法

### API请求格式

```
https://your-api-id.execute-api.[region].amazonaws.com/prod/generate-url?bucket=your-bucket-name&key=your-object-key
```

对于中国区域，URL格式为：
```
https://your-api-id.execute-api.[region].amazonaws.com.cn/prod/generate-url?bucket=your-bucket-name&key=your-object-key
```

### 请求参数

- `bucket`: S3桶的名称（如果在Lambda环境变量中设置了DEFAULT_BUCKET，则此参数可选）
- `key`: S3对象的键（路径）（必需）

### 响应示例

```json
{
  "presignedUrl": "https://your-bucket.s3.[region].amazonaws.com/your-object-key?X-Amz-Algorithm=...",
  "expiresIn": "2小时",
  "bucket": "your-bucket-name",
  "key": "your-object-key"
}
```

## 测试示例

以下是使用curl测试API的示例：

```bash
# 生成预签名URL
curl "https://your-api-id.execute-api.[region].amazonaws.com/prod/generate-url?key=example.txt"

# 使用生成的预签名URL访问对象
curl -s "$(curl -s "https://your-api-id.execute-api.[region].amazonaws.com/prod/generate-url?key=example.txt" | jq -r '.presignedUrl')"
```

## 自定义

您可以通过修改以下文件来自定义此项目:

- `lambda/index.js`: 修改Lambda函数逻辑
- `lib/lambda-gen-s3-stack.ts`: 修改CDK基础设施定义

## 清理资源

要删除部署的资源，请运行：

```bash
cdk destroy
```

## 注意事项

1. 确保您的IAM用户/角色有足够的权限来部署此堆栈
2. 中国区域的AWS服务可能有一些特殊的配置要求，如果遇到问题，请参考AWS中国区域的文档
3. 预签名URL的有效期为2小时，可以通过修改`lambda/index.js`中的`expiresIn`参数来调整
4. 确保目标S3桶已存在，并且Lambda函数有权限访问该桶
