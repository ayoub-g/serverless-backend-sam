A simple serverless back-end service built with Dynamodb, Lambda and API Gateway, the service is deployed with SAM (Serverless Application Model)

## Requirements

#### 1. Make sure you have sam cli installed on your local machine

#### 2. Install dependencies with yarn install

## Configuration

#### 1. Set up your AWS security credentials in your local machine,

#### 2. Create an S3 bucket where the packaged lambda function will be stored

#### 3. Update all the policies' resources in the SAM template, with the correct region and you account identifier

## Instructions

    sam package --template-file template-file.yaml \
    --output-template-file output-template-file.yaml \
    --s3-bucket your-bucket-name

    sam deploy --template-file output-template-file \
    --stack-name your-stack-name \
    --capabilities CAPABILITY_IAM
