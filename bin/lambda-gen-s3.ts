#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaGenS3Stack } from '../lib/lambda-gen-s3-stack';

const app = new cdk.App();
new LambdaGenS3Stack(app, 'LambdaGenS3Stack', {
  // Use environment variables for account and region
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  description: 'Lambda and API Gateway for generating S3 presigned URLs',
});
