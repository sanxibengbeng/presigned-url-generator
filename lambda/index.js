const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Create S3 client using only environment variables
const s3Client = new S3Client({
  region: process.env.AWS_REGION, // Use the Lambda execution environment's region
});

/**
 * Generate presigned URL for S3 object
 * @param {string} bucket - S3 bucket name
 * @param {string} key - S3 object key
 * @param {number} expiresIn - URL expiration time (seconds)
 * @returns {Promise<string>} Presigned URL
 */
const generatePresignedUrl = async (bucket, key, expiresIn = 7200) => { // Default 2 hours (7200 seconds)
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  try {
    // Generate presigned URL
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

/**
 * Lambda handler function
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));
  
  try {
    // Get parameters from event or query string parameters
    const bucket = event.bucket || (event.queryStringParameters && event.queryStringParameters.bucket) || process.env.DEFAULT_BUCKET;
    const key = event.key || (event.queryStringParameters && event.queryStringParameters.key);
    
    // Validate required parameters
    if (!bucket || !key) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'Missing required parameters: bucket and key are required' })
      };
    }
    
    // Generate presigned URL
    const url = await generatePresignedUrl(bucket, key);
    
    // Return successful response
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        presignedUrl: url,
        expiresIn: '2 hours',
        bucket,
        key
      })
    };
  } catch (error) {
    console.error('Error processing request:', error);
    
    // Return error response
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Error generating presigned URL', message: error.message })
    };
  }
};
