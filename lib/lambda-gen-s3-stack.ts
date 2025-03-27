import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as path from 'path';

export class LambdaGenS3Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // 创建IAM角色，授予Lambda访问S3的权限
    const lambdaRole = new iam.Role(this, 'PresignedUrlLambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda to generate S3 presigned URLs',
    });

    // 添加S3只读权限策略
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonS3ReadOnlyAccess')
    );

    // 添加CloudWatch Logs权限
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // 创建Lambda函数
    const presignedUrlLambda = new lambda.Function(this, 'PresignedUrlFunction', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      role: lambdaRole,
      timeout: cdk.Duration.seconds(30),
      environment: {
        // 可以在这里添加环境变量，如默认的桶名称等
        // DEFAULT_BUCKET: 'your-bucket-name',
      },
      description: 'Lambda function to generate S3 presigned URLs with 2-hour expiration',
    });

    // 创建API Gateway
    const api = new apigateway.RestApi(this, 'PresignedUrlApi', {
      restApiName: 'S3 Presigned URL Service',
      description: 'API for generating S3 presigned URLs',
      deployOptions: {
        stageName: 'prod',
      },
      // 中国区域需要启用CORS
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
      },
    });

    // 添加API资源和方法
    const presignedUrlResource = api.root.addResource('generate-url');
    presignedUrlResource.addMethod('GET', new apigateway.LambdaIntegration(presignedUrlLambda));

    // 输出API Gateway URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: 'API Gateway URL',
    });
  }
}
