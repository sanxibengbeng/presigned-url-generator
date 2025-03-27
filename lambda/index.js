const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// 中国区域的S3客户端
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'cn-north-1', // 默认使用北京区域，也可以设置为'cn-northwest-1'宁夏区域
});

/**
 * 生成S3对象的预签名URL
 * @param {string} bucket - S3桶名称
 * @param {string} key - S3对象键
 * @param {number} expiresIn - URL有效期（秒）
 * @returns {Promise<string>} 预签名URL
 */
const generatePresignedUrl = async (bucket, key, expiresIn = 7200) => { // 默认2小时(7200秒)
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    // 生成预签名URL
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('生成预签名URL时出错:', error);
    throw error;
  }
};

/**
 * Lambda处理函数
 */
exports.handler = async (event) => {
  console.log('接收到的事件:', JSON.stringify(event, null, 2));
  
  try {
    // 从事件中获取参数，或使用查询字符串参数
    const bucket = event.bucket || (event.queryStringParameters && event.queryStringParameters.bucket) || process.env.DEFAULT_BUCKET;
    const key = event.key || (event.queryStringParameters && event.queryStringParameters.key);
    
    // 验证必要参数
    if (!bucket || !key) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: '缺少必要参数: bucket 和 key 是必需的' })
      };
    }
    
    // 生成预签名URL
    const url = await generatePresignedUrl(bucket, key);
    
    // 返回成功响应
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presignedUrl: url,
        expiresIn: '2小时',
        bucket,
        key
      })
    };
  } catch (error) {
    console.error('处理请求时出错:', error);
    
    // 返回错误响应
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: '生成预签名URL时发生错误', message: error.message })
    };
  }
};
