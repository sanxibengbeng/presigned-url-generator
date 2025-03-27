# Lambda S3 预签名URL生成器

这个项目使用AWS Lambda和API Gateway创建一个无服务器服务，用于生成S3对象的预签名URL，有效期为2小时。该项目可部署在AWS全球区域和中国区域。

![架构图](./docs/images/arch.drawio.png)

[English Documentation](./README.md)

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

## 快速开始

```bash
# 安装依赖
npm install
cd lambda && npm install && cd ..

# 引导CDK（仅首次使用）
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# 部署堆栈
# 全球区域
CDK_DEFAULT_REGION=us-east-1 cdk deploy

# 中国区域
CDK_DEFAULT_REGION=cn-north-1 cdk deploy
```

## 部署选项

该应用程序设计为区域无关的，将使用您环境变量中指定的区域：

- AWS CLI：在AWS CLI配置中设置区域或使用`--region`参数
- CDK部署：使用`CDK_DEFAULT_REGION`环境变量
- Lambda运行时：Lambda函数将自动使用执行环境中的区域

### 全球区域部署（如us-east-1）

```bash
CDK_DEFAULT_REGION=us-east-1 cdk deploy
```

### 中国区域部署（cn-north-1或cn-northwest-1）

```bash
CDK_DEFAULT_REGION=cn-north-1 cdk deploy
```

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
