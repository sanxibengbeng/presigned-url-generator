# Lambda S3 Presigned URL Generator

This project creates a serverless service using AWS Lambda and API Gateway to generate presigned URLs for S3 objects with a 2-hour validity period. The project can be deployed in both AWS global regions and AWS China regions.

![Architecture Diagram](./docs/images/arch.en.drawio.png)

[中文文档](./README_CN.md)

## Architecture Overview

The application consists of the following AWS services:

- **AWS Lambda**: Executes the logic for generating presigned URLs
- **API Gateway**: Provides an HTTP interface to trigger the Lambda function
- **IAM Role**: Grants Lambda the necessary permissions to access S3
- **AWS CDK**: Used to deploy the entire infrastructure

## Workflow

1. User sends an HTTP GET request through API Gateway, including object key parameters
2. API Gateway invokes the Lambda function to process the request
3. Lambda uses IAM role to access S3 and generate a presigned URL (valid for 2 hours)
4. The presigned URL is returned to the user via API Gateway
5. User can directly access the S3 object using the presigned URL without AWS credentials

## Prerequisites

- Node.js 14.x or higher
- AWS CLI configured with appropriate regional credentials
- AWS CDK installed (`npm install -g aws-cdk`)

## Quick Start

```bash
# Install dependencies
npm install
cd lambda && npm install && cd ..

# Bootstrap CDK (first time only)
cdk bootstrap aws://ACCOUNT-NUMBER/REGION

# Deploy the stack
# For global regions
CDK_DEFAULT_REGION=us-east-1 cdk deploy

# For China regions
CDK_DEFAULT_REGION=cn-north-1 cdk deploy
```

## Deployment Options

The application is designed to be region-agnostic and will use the region specified in your environment variables:

- For AWS CLI: Set the region in your AWS CLI configuration or use the `--region` parameter
- For CDK deployment: Use the `CDK_DEFAULT_REGION` environment variable
- For Lambda runtime: The Lambda function will automatically use the region from the execution environment

### Global Region Deployment (e.g., us-east-1)

```bash
CDK_DEFAULT_REGION=us-east-1 cdk deploy
```

### China Region Deployment (cn-north-1 or cn-northwest-1)

```bash
CDK_DEFAULT_REGION=cn-north-1 cdk deploy
```

## Usage

### API Request Format

```
https://your-api-id.execute-api.[region].amazonaws.com/prod/generate-url?bucket=your-bucket-name&key=your-object-key
```

For China regions, the URL format is:
```
https://your-api-id.execute-api.[region].amazonaws.com.cn/prod/generate-url?bucket=your-bucket-name&key=your-object-key
```

### Response Example

```json
{
  "presignedUrl": "https://your-bucket.s3.[region].amazonaws.com/your-object-key?X-Amz-Algorithm=...",
  "expiresIn": "2 hours",
  "bucket": "your-bucket-name",
  "key": "your-object-key"
}
```

For more detailed information, please refer to the [Chinese documentation](./README_CN.md).
