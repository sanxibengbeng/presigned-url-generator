#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaGenS3Stack } from '../lib/lambda-gen-s3-stack';

const app = new cdk.App();
new LambdaGenS3Stack(app, 'LambdaGenS3Stack', {
  // 中国区域部署，根据需要选择北京或宁夏区域
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION || 'cn-north-1' 
  },
  description: '用于生成S3预签名URL的Lambda和API Gateway',
});
